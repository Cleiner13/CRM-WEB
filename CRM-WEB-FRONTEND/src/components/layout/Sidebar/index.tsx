import { Fragment, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  FileText,
  Inbox,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Shield,
  UserCircle2,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logoMark from "@/assets/logos/Logo.png";
import { NAVIGATION_MENU, type NavigationItem } from "@/config/navigation";
import { LAYOUT_STYLES, cx } from "@/config/styles";
import { moduleService, profileService } from "@/services";
import type { AppModule, MiPerfilPermiso, Usuario } from "@/types";
import { buildModuleIdMap, canViewModule } from "@/utils";

type ExpandedMap = Record<string, boolean>;

type ResolvedNavigationItem = NavigationItem & {
  label: string;
  moduleId?: number;
  children?: ResolvedNavigationItem[];
};

type SidebarNodeProps = {
  depth: number;
  item: ResolvedNavigationItem;
  expandedMap: ExpandedMap;
  onToggle: (id: string) => void;
};

function hasActiveChild(item: ResolvedNavigationItem, pathname: string): boolean {
  if (item.path && pathname.startsWith(item.path)) {
    return true;
  }

  return ((item.children as ResolvedNavigationItem[] | undefined) ?? []).some((child) => hasActiveChild(child, pathname));
}

function findActiveBranchIds(items: ResolvedNavigationItem[], pathname: string): string[] {
  for (const item of items) {
    if (item.path && pathname.startsWith(item.path)) {
      return [item.id];
    }

    if (item.children?.length) {
      const nested = findActiveBranchIds(item.children as ResolvedNavigationItem[], pathname);
      if (nested.length > 0) {
        return [item.id, ...nested];
      }
    }
  }

  return [];
}

function getFirstPath(item: ResolvedNavigationItem): string | undefined {
  if (item.path) {
    return item.path;
  }

  for (const child of item.children ?? []) {
    const childPath = getFirstPath(child);
    if (childPath) {
      return childPath;
    }
  }

  return undefined;
}

function resolveNavigationItem(
  item: NavigationItem,
  modulesById: Map<number, AppModule>,
  permissions: MiPerfilPermiso[],
): ResolvedNavigationItem | null {
  const module = item.moduleId ? modulesById.get(item.moduleId) : undefined;
  const canShowSelf = item.alwaysVisible || !item.moduleId ? true : Boolean(module && canViewModule(permissions, module.moduloId));

  if (item.moduleId && !canShowSelf) {
    return null;
  }

  const resolvedChildren = (item.children ?? [])
    .map((child) => resolveNavigationItem(child, modulesById, permissions))
    .filter((child): child is ResolvedNavigationItem => child !== null);

  if (!canShowSelf && resolvedChildren.length === 0) {
    return null;
  }

  return {
    ...item,
    label: module?.nombre?.trim() || item.label || "Modulo",
    moduleId: module?.moduloId,
    children: resolvedChildren,
  };
}

function getTopLevelIcon(itemId: string): JSX.Element {
  const iconProps = { size: 18, strokeWidth: 1.9 };

  switch (itemId) {
    case "dashboard":
      return <LayoutDashboard {...iconProps} />;
    case "profile":
      return <UserCircle2 {...iconProps} />;
    case "inbox":
      return <Inbox {...iconProps} />;
    case "administracion":
      return <Shield {...iconProps} />;
    case "ti":
      return <Settings {...iconProps} />;
    case "gerencia":
      return <BarChart3 {...iconProps} />;
    case "documentos-operativos":
      return <FileText {...iconProps} />;
    case "gestion-operativa":
      return <Briefcase {...iconProps} />;
    case "configuracion":
      return <Settings {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
}

function SidebarNode({ depth, item, expandedMap, onToggle }: SidebarNodeProps): JSX.Element {
  const { pathname } = useLocation();
  const isActive = hasActiveChild(item, pathname);
  const hasChildren = Boolean(item.children?.length);
  const isOpen = expandedMap[item.id] ?? false;
  const isTopLevel = depth === 0;
  const icon = isTopLevel ? getTopLevelIcon(item.id) : null;

  if (hasChildren) {
    const childListClass = cx(
      LAYOUT_STYLES.sidebarGroupChildren,
      isTopLevel ? LAYOUT_STYLES.sidebarGroupChildrenPanel : LAYOUT_STYLES.sidebarGroupChildrenNested,
    );

    return (
      <li className="space-y-1">
        <button
          aria-expanded={isOpen}
          className={cx(
            LAYOUT_STYLES.sidebarGroupTrigger,
            isActive && LAYOUT_STYLES.sidebarGroupTriggerActive,
            isTopLevel && "mt-1",
          )}
          onClick={() => onToggle(item.id)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {icon ? <span className="text-current/90">{icon}</span> : null}
            <span className="truncate">{item.label}</span>
          </span>
          <ChevronRight className={cx(LAYOUT_STYLES.sidebarChevron, isOpen && LAYOUT_STYLES.sidebarChevronOpen)} size={16} />
        </button>
        {isOpen ? (
          <ul className={childListClass}>
            {(item.children as ResolvedNavigationItem[] | undefined)?.map((child) => (
              <SidebarNode depth={depth + 1} expandedMap={expandedMap} item={child} key={child.id} onToggle={onToggle} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        className={({ isActive: isExactActive }) => {
          const active = isExactActive || isActive;

          return cx(
            LAYOUT_STYLES.sidebarItem,
            depth > 0 && LAYOUT_STYLES.sidebarItemNested,
            active && LAYOUT_STYLES.sidebarItemActive,
            depth > 0 && active && LAYOUT_STYLES.sidebarItemNestedActive,
          );
        }}
        to={item.path ?? "/"}
      >
        <span className={LAYOUT_STYLES.sidebarLeafRow}>
          {isTopLevel ? <span className="text-current/90">{icon}</span> : null}
          {depth > 0 ? (
            <span aria-hidden="true" className={cx(LAYOUT_STYLES.sidebarLeafDot, isActive && LAYOUT_STYLES.sidebarLeafDotActive)} />
          ) : null}
          <span className="truncate">{item.label}</span>
        </span>
      </NavLink>
    </li>
  );
}

export type SidebarProps = {
  compact?: boolean;
  currentUser?: Usuario | null;
  refreshKey?: number;
};

function CompactSidebar({ items }: { items: ResolvedNavigationItem[] }): JSX.Element {
  const { pathname } = useLocation();

  return (
    <aside className={LAYOUT_STYLES.sidebarCompact}>
      <div className={LAYOUT_STYLES.sidebarCompactHeader}>
        <div className="grid place-items-center">
          <img alt="ALMPES" className={LAYOUT_STYLES.sidebarBrandLogo} src={logoMark} />
        </div>
      </div>

      <nav aria-label="Menu principal compacto" className={LAYOUT_STYLES.sidebarCompactBody}>
        <ul className={LAYOUT_STYLES.sidebarCompactList}>
          {items.map((item, index) => {
            const href = getFirstPath(item) ?? "/";
            const active = hasActiveChild(item, pathname);
            const showDivider = index === 3 || index === 8;

            return (
              <Fragment key={item.id}>
                {showDivider ? <li aria-hidden="true" className={LAYOUT_STYLES.sidebarCompactDivider} /> : null}
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      cx(LAYOUT_STYLES.sidebarCompactItem, (isActive || active) && LAYOUT_STYLES.sidebarCompactItemActive)
                    }
                    title={item.label}
                    to={href}
                  >
                    {getTopLevelIcon(item.id)}
                  </NavLink>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>

      <div className={LAYOUT_STYLES.sidebarCompactFooter}>
        <div className="grid place-items-center">
          <span className={LAYOUT_STYLES.sidebarCompactItem} title="Mas opciones">
            <MoreHorizontal size={18} />
          </span>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({ compact = false, currentUser, refreshKey = 0 }: SidebarProps): JSX.Element {
  const { pathname } = useLocation();
  const [availableModules, setAvailableModules] = useState<AppModule[]>([]);
  const [profilePermissions, setProfilePermissions] = useState<MiPerfilPermiso[]>([]);

  useEffect(() => {
    let active = true;

    void Promise.all([moduleService.getAll(), profileService.getMyProfile()])
      .then(([modules, profile]) => {
        if (!active) {
          return;
        }

        setAvailableModules(modules);
        setProfilePermissions(profile.permisos.filter((permission) => permission.permitido));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setAvailableModules([]);
        setProfilePermissions([]);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const resolvedNavigation = useMemo<ResolvedNavigationItem[]>(() => {
    if (availableModules.length === 0) {
      return NAVIGATION_MENU.filter((item) => item.alwaysVisible).map((item) => ({
        ...item,
        label: item.label || "Modulo",
        children: [],
      }));
    }

    const modulesById = buildModuleIdMap(availableModules);

    return NAVIGATION_MENU.map((item) => resolveNavigationItem(item, modulesById, profilePermissions)).filter(
      (item): item is ResolvedNavigationItem => item !== null,
    );
  }, [availableModules, profilePermissions]);

  const activeBranchIds = useMemo(() => findActiveBranchIds(resolvedNavigation, pathname), [pathname, resolvedNavigation]);
  const [expandedMap, setExpandedMap] = useState<ExpandedMap>(() => {
    const initial: ExpandedMap = {};
    for (const id of activeBranchIds) {
      initial[id] = true;
    }
    return initial;
  });

  useEffect(() => {
    setExpandedMap((current) => {
      let changed = false;
      const next = { ...current };

      for (const id of activeBranchIds) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [activeBranchIds]);

  const handleToggle = (id: string): void => {
    setExpandedMap((current) => ({
      ...current,
      [id]: !(current[id] ?? false),
    }));
  };

  if (compact) {
    return <CompactSidebar items={resolvedNavigation} />;
  }

  const mainRole = currentUser?.roles?.[0] || "Usuario";
  const cargoName = currentUser?.cargoNombre || "Sin cargo asignado";

  return (
    <aside className={LAYOUT_STYLES.sidebar}>
      <div className={LAYOUT_STYLES.sidebarHeader}>
        <div className={LAYOUT_STYLES.sidebarBrandWrap}>
          <img alt="ALMPES" className={LAYOUT_STYLES.sidebarBrandLogo} src={logoMark} />
          <div className="min-w-0">
            <p className={LAYOUT_STYLES.sidebarUserRoleValue}>{mainRole}</p>
            <p className={LAYOUT_STYLES.sidebarUserCargoValue}>{cargoName}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Menu principal" className={LAYOUT_STYLES.sidebarBody}>
        <ul className={LAYOUT_STYLES.sidebarGroup}>
          {resolvedNavigation.map((item) => (
            <Fragment key={item.id}>
              <SidebarNode depth={0} expandedMap={expandedMap} item={item} onToggle={handleToggle} />
            </Fragment>
          ))}
        </ul>
      </nav>

      <div className={LAYOUT_STYLES.sidebarFooter}>
        <div className={LAYOUT_STYLES.sidebarFooterCard}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">ALMPES UI</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Sistema base listo para modulos</p>
          <p className="mt-1 text-xs text-slate-500">Usa tokens y componentes reutilizables en cada nueva pantalla.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
