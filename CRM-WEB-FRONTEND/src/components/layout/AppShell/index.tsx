import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LAYOUT_STYLES, cx } from "@/config/styles";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button, Modal } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { authService, profileService } from "@/services";
import { permissionHubService } from "@/services/permissionHub";
import type { Usuario } from "@/types";

export function AppShell(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Su usuario ha sido desactivado en el sistema.");
  const [mustReturnToLogin, setMustReturnToLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => authService.getCurrentUser());
  const enrichingUserIdRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribePermissionChanged: (() => void) | undefined;
    let unsubscribeUserStatusChanged: (() => void) | undefined;
    let statusPollInterval: number | undefined;
    const syncDisplayUser = async (user: Usuario | null): Promise<void> => {
      if (!user?.usuarioId) {
        return;
      }

      if (user.nombreCompleto && user.cargoNombre && user.areaNombre) {
        return;
      }

      if (enrichingUserIdRef.current === user.usuarioId) {
        return;
      }

      try {
        enrichingUserIdRef.current = user.usuarioId;
        const profile = await profileService.getMyProfile();
        const resumen = profile.resumen;
        if (!resumen) {
          return;
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
    };

    const unsubscribeCurrentUser = authService.subscribeCurrentUser((user) => {
      setCurrentUser(user);
      void syncDisplayUser(user);
    });

    const handleRemoteStatusChange = (isActive: boolean): void => {
      if (isActive) {
        setStatusMessage("Su usuario ha sido reactivado. Recargue la informacion para continuar.");
        setMustReturnToLogin(false);
        setIsStatusModalOpen(true);
        void authService.fetchCurrentUser().catch(() => {});
        return;
      }

      authService.logout();
      setStatusMessage("Su usuario ha sido desactivado. Debe volver a iniciar sesion.");
      setMustReturnToLogin(true);
      setIsStatusModalOpen(true);
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

        void authService.fetchCurrentUser().catch(() => {
          // keep current state until a future successful refresh
        });
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
  }, [navigate]);

  const handleStatusModalClose = (): void => {
    setIsStatusModalOpen(false);

    if (mustReturnToLogin) {
      setMustReturnToLogin(false);
      navigate(ROUTES.login, { replace: true });
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
          <Sidebar compact={!isSidebarOpen} currentUser={currentUser} />
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
          <Button onClick={handleStatusModalClose} variant="create">
            {mustReturnToLogin ? "Volver al login" : "Cerrar"}
          </Button>
        }
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        title="Estado de usuario actualizado"
        variant="warning"
      >
        <p>{statusMessage}</p>
      </Modal>
    </div>
  );
}

export default AppShell;
