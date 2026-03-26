import { Bell, ChevronDown, Menu, Moon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LAYOUT_STYLES } from "@/config/styles";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services";

export type TopbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Topbar({ isSidebarOpen, onToggleSidebar }: TopbarProps): JSX.Element {
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  const userDisplay = currentUser ? {
    name: currentUser.nombreCompleto || currentUser.username,
    role: currentUser.roles?.join(", ") || "Usuario",
    avatar: "https://i.pravatar.cc/80?img=12", // Placeholder
  } : {
    name: "Usuario",
    role: "Cargando...",
    avatar: "https://i.pravatar.cc/80?img=12",
  };

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
        <button aria-label="Tema" className={LAYOUT_STYLES.topbarIconBtn} type="button">
          <Moon size={18} />
        </button>
        <button aria-label="Notificaciones" className={LAYOUT_STYLES.topbarIconBtn} type="button">
          <Bell size={18} />
        </button>
        <button aria-label="Perfil de usuario" className={LAYOUT_STYLES.topbarUser} onClick={handleLogout} type="button">
          <img alt={userDisplay.name} className={LAYOUT_STYLES.topbarUserAvatar} src={userDisplay.avatar} />
          <span className={LAYOUT_STYLES.topbarUserMeta}>
            <span className={LAYOUT_STYLES.topbarUserName}>{userDisplay.name}</span>
          </span>
          <ChevronDown className={LAYOUT_STYLES.topbarUserChevron} size={16} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
