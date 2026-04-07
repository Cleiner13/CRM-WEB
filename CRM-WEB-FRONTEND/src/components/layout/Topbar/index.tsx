import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LAYOUT_STYLES } from "@/config/styles";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services";
import type { Usuario } from "@/types";

export type TopbarProps = {
  currentUser?: Usuario | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function Topbar({ currentUser, isSidebarOpen, onToggleSidebar }: TopbarProps): JSX.Element {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userName = currentUser?.nombreCompleto || "Usuario";

  const notifications = useMemo(
    () => [
      {
        id: "notification-1",
        title: "Cuenta protegida",
        text: "Revise sus datos de perfil y mantenga actualizada su contrasena.",
        time: "Hoy",
      },
      {
        id: "notification-2",
        title: "Bandeja pendiente",
        text: "Tiene elementos pendientes por revisar en su bandeja de entrada.",
        time: "Hace 1 hora",
      },
      {
        id: "notification-3",
        title: "Sesion reciente",
        text: "Se registro un acceso exitoso desde su cuenta en esta plataforma.",
        time: "Hace 3 horas",
      },
    ],
    [],
  );

  const handleLogout = (): void => {
    authService.logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <header className={LAYOUT_STYLES.topbar}>
      <div className={LAYOUT_STYLES.topbarLeft}>
        <button
          aria-label={isSidebarOpen ? "Ocultar menu lateral" : "Mostrar menu lateral"}
          className={LAYOUT_STYLES.topbarMenuBtn}
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu size={18} />
        </button>

        <div className={LAYOUT_STYLES.topbarSearchWrap}>
          <div className={LAYOUT_STYLES.topbarSearchBox}>
            <span aria-hidden="true" className={LAYOUT_STYLES.topbarSearchIcon}>
              <Search size={16} />
            </span>
            <input className={LAYOUT_STYLES.topbarSearchInput} placeholder="Busca o escribe comando..." type="search" />
          </div>
        </div>
      </div>

      <div className={LAYOUT_STYLES.topbarActions}>
        <div className={LAYOUT_STYLES.topbarNotificationsWrap}>
          <button
            aria-expanded={isNotificationsOpen}
            aria-label="Notificaciones"
            className={LAYOUT_STYLES.topbarIconBtn}
            onClick={() => setIsNotificationsOpen((current) => !current)}
            type="button"
          >
            <Bell size={18} />
            <span className={LAYOUT_STYLES.topbarIconBadge}>{notifications.length}</span>
          </button>

          {isNotificationsOpen ? (
            <div className={LAYOUT_STYLES.topbarNotificationsPanel}>
              <div className={LAYOUT_STYLES.topbarNotificationsHeader}>
                <div>
                  <p className={LAYOUT_STYLES.topbarNotificationsTitle}>Notificaciones</p>
                  <p className={LAYOUT_STYLES.topbarNotificationsMeta}>Alertas y recordatorios de su cuenta.</p>
                </div>
              </div>

              <div className={LAYOUT_STYLES.topbarNotificationsList}>
                {notifications.map((notification) => (
                  <article className={LAYOUT_STYLES.topbarNotificationsItem} key={notification.id}>
                    <p className={LAYOUT_STYLES.topbarNotificationsItemTitle}>{notification.title}</p>
                    <p className={LAYOUT_STYLES.topbarNotificationsItemText}>{notification.text}</p>
                    <p className={LAYOUT_STYLES.topbarNotificationsItemTime}>{notification.time}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={LAYOUT_STYLES.topbarUser}>
          <div aria-hidden="true" className={LAYOUT_STYLES.topbarUserAvatar}>
            {getInitials(userName)}
          </div>
          <span className={LAYOUT_STYLES.topbarUserMeta}>
            <span className={LAYOUT_STYLES.topbarUserName}>{userName}</span>
          </span>
        </div>

        <button aria-label="Cerrar sesion" className={LAYOUT_STYLES.topbarLogoutBtn} onClick={handleLogout} type="button">
          <LogOut size={16} />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
