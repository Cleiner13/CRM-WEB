import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LAYOUT_STYLES, cx } from "@/config/styles";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button, Modal } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { NAVIGATION_MENU, type NavigationItem } from "@/config/navigation";
import { authService, profileService } from "@/services";
import { permissionHubService } from "@/services/permissionHub";
import type { MiPerfilPermiso, Usuario } from "@/types";
import { canViewModule } from "@/utils";

type RealtimeNotice = {
  title: string;
  message: string;
  redirectTo?: string | null;
};

function findNavigationBranch(items: NavigationItem[], pathname: string): NavigationItem[] {
  for (const item of items) {
    if (item.path && pathname.startsWith(item.path)) {
      return [item];
    }

    if (item.children?.length) {
      const nested = findNavigationBranch(item.children, pathname);
      if (nested.length > 0) {
        return [item, ...nested];
      }
    }
  }

  return [];
}

function getAllowedActions(permissions: MiPerfilPermiso[], moduleId: number): Set<string> {
  return new Set(
    permissions
      .filter((permission) => permission.permitido && permission.moduloId === moduleId)
      .map((permission) => (permission.permisoCodigo || permission.permisoNombre || "").trim().toUpperCase())
      .filter(Boolean),
  );
}

export function AppShell(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notice, setNotice] = useState<RealtimeNotice | null>(null);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => authService.getCurrentUser());
  const [permissionRefreshToken, setPermissionRefreshToken] = useState(0);
  const enrichingUserIdRef = useRef<number | null>(null);
  const profilePermissionsRef = useRef<MiPerfilPermiso[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const currentBranch = useMemo(() => findNavigationBranch(NAVIGATION_MENU, location.pathname), [location.pathname]);

  useEffect(() => {
    let unsubscribePermissionChanged: (() => void) | undefined;
    let unsubscribeUserStatusChanged: (() => void) | undefined;
    let statusPollInterval: number | undefined;
    const syncDisplayUser = async (user: Usuario | null, forceProfileRefresh = false): Promise<MiPerfilPermiso[]> => {
      if (!user?.usuarioId) {
        profilePermissionsRef.current = [];
        return [];
      }

      if (!forceProfileRefresh && user.nombreCompleto && user.cargoNombre && user.areaNombre && profilePermissionsRef.current.length > 0) {
        return profilePermissionsRef.current;
      }

      if (enrichingUserIdRef.current === user.usuarioId) {
        return profilePermissionsRef.current;
      }

      try {
        enrichingUserIdRef.current = user.usuarioId;
        const profile = await profileService.getMyProfile();
        profilePermissionsRef.current = profile.permisos.filter((permission) => permission.permitido);
        const resumen = profile.resumen;
        if (!resumen) {
          return profilePermissionsRef.current;
        }

        const nextUser: Usuario = {
          ...user,
          nombreCompleto: user.nombreCompleto || resumen.nombreCompleto || user.username,
          cargoNombre: user.cargoNombre || resumen.contratacionCargoNombre || resumen.postulacionCargoNombre || user.cargoNombre,
          areaNombre: user.areaNombre || resumen.contratacionAreaNombre || resumen.postulacionAreaNombre || user.areaNombre,
        };

        const didChange =
          nextUser.nombreCompleto !== user.nombreCompleto ||
          nextUser.cargoNombre !== user.cargoNombre ||
          nextUser.areaNombre !== user.areaNombre;

        if (didChange) {
          authService.setCurrentUser(nextUser);
        }
      } catch {
        // ignore display enrichment failures
      } finally {
        if (enrichingUserIdRef.current === user.usuarioId) {
          enrichingUserIdRef.current = null;
        }
      }

      return profilePermissionsRef.current;
    };

    const unsubscribeCurrentUser = authService.subscribeCurrentUser((user) => {
      setCurrentUser(user);
      void syncDisplayUser(user);
    });

    const handleRemoteStatusChange = (isActive: boolean): void => {
      if (isActive) {
        setNotice({
          title: "Estado de usuario actualizado",
          message: "Su usuario ha sido reactivado. Recargue la informacion para continuar.",
        });
        void authService.fetchCurrentUser().catch(() => {});
        return;
      }

      authService.logout();
      setNotice({
        title: "Estado de usuario actualizado",
        message: "Su usuario ha sido desactivado. Debe volver a iniciar sesion.",
        redirectTo: ROUTES.login,
      });
    };

    const handleRemotePermissionChange = async (): Promise<void> => {
      const knownUser = authService.getCurrentUser();
      if (!knownUser?.usuarioId) {
        return;
      }

      const previousPermissions = profilePermissionsRef.current;

      try {
        await authService.fetchCurrentUser();
        const nextPermissions = await syncDisplayUser(authService.getCurrentUser(), true);
        setPermissionRefreshToken((current) => current + 1);

        const branchModuleIds = currentBranch.map((item) => item.moduleId).filter((value): value is number => typeof value === "number");
        const currentLeafModuleId = [...branchModuleIds].reverse()[0];

        const lostViewAccess = branchModuleIds.some((moduleId) => canViewModule(previousPermissions, moduleId) && !canViewModule(nextPermissions, moduleId));
        if (lostViewAccess) {
          setNotice({
            title: "Permisos actualizados",
            message: "Tus permisos para esta seccion han sido actualizados. Ya no tienes acceso a este contenido.",
            redirectTo: ROUTES.dashboard,
          });
          return;
        }

        if (!currentLeafModuleId) {
          return;
        }

        const previousActions = getAllowedActions(previousPermissions, currentLeafModuleId);
        const nextActions = getAllowedActions(nextPermissions, currentLeafModuleId);
        const removedActions = [...previousActions].filter((action) => action !== "VER" && !nextActions.has(action));

        if (removedActions.length > 0) {
          setNotice({
            title: "Permisos actualizados",
            message: `Tus permisos para esta seccion han sido actualizados. Ya no puedes realizar: ${removedActions.join(", ")}.`,
          });
          return;
        }

        const previousCanViewCurrent = canViewModule(previousPermissions, currentLeafModuleId);
        const nextCanViewCurrent = canViewModule(nextPermissions, currentLeafModuleId);
        if (previousCanViewCurrent && !nextCanViewCurrent) {
          setNotice({
            title: "Permisos actualizados",
            message: "Tus permisos para esta seccion han sido actualizados. Ya no tienes acceso a este contenido.",
            redirectTo: ROUTES.dashboard,
          });
        }
      } catch {
        // keep current state until a future successful refresh
      }
    };

    const initializeRealtime = async (): Promise<void> => {
      if (authService.isAuthenticated() && !authService.getCurrentUser()) {
        try {
          const user = await authService.fetchCurrentUser();
          await syncDisplayUser(user);
        } catch (error) {
          console.warn("AppShell: could not restore current user", error);
          authService.logout();
          navigate(ROUTES.login, { replace: true });
          return;
        }
      }

      unsubscribePermissionChanged = permissionHubService.onPermissionChanged((payload) => {
        if (payload.userId !== Number(authService.getCurrentUser()?.usuarioId)) {
          return;
        }

        void handleRemotePermissionChange();
      });

      unsubscribeUserStatusChanged = permissionHubService.onUserStatusChanged((payload) => {
        if (payload.userId !== Number(authService.getCurrentUser()?.usuarioId)) {
          return;
        }

        handleRemoteStatusChange(payload.isActive);
      });

      const isRealtimeConnected = await permissionHubService.start();
      if (isRealtimeConnected) {
        return;
      }

      statusPollInterval = window.setInterval(() => {
        const knownUser = authService.getCurrentUser();
        if (!knownUser?.usuarioId || !authService.isAuthenticated()) {
          return;
        }

        void authService
          .fetchCurrentUser()
          .then((freshUser) => {
            void syncDisplayUser(freshUser);
            if (freshUser.usuarioId !== knownUser.usuarioId) {
              return;
            }

            if (freshUser.activo === false) {
              window.clearInterval(statusPollInterval);
              statusPollInterval = undefined;
              handleRemoteStatusChange(false);
            }
          })
          .catch(() => {});
      }, 3000);
    };

    void initializeRealtime();

    return () => {
      unsubscribePermissionChanged?.();
      unsubscribeUserStatusChanged?.();
      unsubscribeCurrentUser();
      if (statusPollInterval) {
        window.clearInterval(statusPollInterval);
      }
      void permissionHubService.stop();
    };
  }, [currentBranch, navigate]);

  const handleNoticeClose = (): void => {
    const redirectTo = notice?.redirectTo;
    setNotice(null);

    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className={LAYOUT_STYLES.shell}>
      <div aria-hidden="true" className={LAYOUT_STYLES.shellBackdrop} />
      <div className={LAYOUT_STYLES.shellGrid}>
        {isSidebarOpen ? (
          <button
            aria-label="Cerrar menu lateral"
            className={LAYOUT_STYLES.sidebarOverlay}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <div
          className={cx(
            LAYOUT_STYLES.sidebarSlot,
            isSidebarOpen ? LAYOUT_STYLES.sidebarSlotOpen : LAYOUT_STYLES.sidebarSlotClosed,
          )}
        >
          <Sidebar compact={!isSidebarOpen} currentUser={currentUser} refreshKey={permissionRefreshToken} />
        </div>

        <div className={LAYOUT_STYLES.contentArea}>
          <Topbar currentUser={currentUser} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((current) => !current)} />
          <main className={LAYOUT_STYLES.main}>
            <Outlet />
          </main>
        </div>
      </div>

      <Modal
        footer={
          <Button onClick={handleNoticeClose} variant="create">
            {notice?.redirectTo ? "Continuar" : "Cerrar"}
          </Button>
        }
        isOpen={Boolean(notice)}
        onClose={handleNoticeClose}
        title={notice?.title || "Estado de usuario actualizado"}
        variant="warning"
      >
        <p>{notice?.message}</p>
      </Modal>
    </div>
  );
}

export default AppShell;
