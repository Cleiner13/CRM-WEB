import { ROUTES } from "@/config/routes";

export type NavigationItem = {
  id: string;
  label: string;
  path?: string;
  children?: NavigationItem[];
};

export const NAVIGATION_MENU: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", path: ROUTES.dashboard },
  { id: "profile", label: "Mi Perfil", path: ROUTES.profile },
  { id: "inbox", label: "Bandeja de Entrada", path: ROUTES.inbox },
  {
    id: "administracion",
    label: "Administracion",
    children: [
      { id: "admin-personal", label: "Personal", path: ROUTES.adminPersonal },
      { id: "admin-comisiones", label: "Comisiones", path: ROUTES.adminComisiones },
      { id: "admin-pagos", label: "Pagos", path: ROUTES.adminPagos },
      {
        id: "admin-reportes-personal",
        label: "Reportes Personal",
        path: ROUTES.adminReportesPersonal,
      },
    ],
  },
  {
    id: "ti",
    label: "TI",
    children: [
      {
        id: "soporte-tecnico",
        label: "Soporte Tecnico",
        children: [
          {
            id: "ti-ingresos-salidas",
            label: "Ingresos / Salidas",
            path: ROUTES.tiIngresosSalidas,
          },
          { id: "ti-inventario", label: "Inventario", path: ROUTES.tiInventario },
        ],
      },
      {
        id: "sistemas",
        label: "Sistemas",
        children: [
          { id: "ti-sistemas-listas", label: "Listas", path: ROUTES.tiSistemasListas },
          { id: "ti-sistemas-bases", label: "Bases", path: ROUTES.tiSistemasBases },
        ],
      },
    ],
  },
  {
    id: "gerencia",
    label: "Gerencia",
    children: [
      { id: "ger-reporte-listas", label: "Reporte Listas", path: ROUTES.gerenciaReporteListas },
      { id: "ger-reporte-bases", label: "Reporte Bases", path: ROUTES.gerenciaReporteBases },
      { id: "ger-reporte-ventas", label: "Reporte Ventas", path: ROUTES.gerenciaReporteVentas },
      {
        id: "ger-reporte-gestion-personal",
        label: "Reporte Gestion Personal",
        path: ROUTES.gerenciaReporteGestionPersonal,
      },
    ],
  },
  {
    id: "documentos-operativos",
    label: "Documentos Operativos",
    path: ROUTES.documentosOperativos,
  },
  {
    id: "gestion-operativa",
    label: "Gestion Operativa",
    children: [
      {
        id: "go-ventas",
        label: "Ventas",
        children: [
          { id: "go-ventas-oh-tc", label: "OH TC", path: ROUTES.goVentasOhTc },
          { id: "go-ventas-oh-max", label: "OH MAX", path: ROUTES.goVentasOhMax },
          { id: "go-ventas-oh-pld", label: "OH PLD", path: ROUTES.goVentasOhPld },
          {
            id: "go-ventas-santander-tc",
            label: "Santander TC",
            path: ROUTES.goVentasSantanderTc,
          },
          {
            id: "go-ventas-santander-ld",
            label: "Santander LD",
            path: ROUTES.goVentasSantanderLd,
          },
          {
            id: "go-ventas-cencosud-tc",
            label: "Cencosud TC",
            path: ROUTES.goVentasCencosudTc,
          },
          {
            id: "go-ventas-cencosud-ld",
            label: "Cencosud LD",
            path: ROUTES.goVentasCencosudLd,
          },
        ],
      },
      {
        id: "go-back-office",
        label: "Back Office",
        children: [
          { id: "go-bo-oh-tc", label: "OH TC", path: ROUTES.goBoOhTc },
          { id: "go-bo-oh-max", label: "OH MAX", path: ROUTES.goBoOhMax },
          { id: "go-bo-oh-pld", label: "OH PLD", path: ROUTES.goBoOhPld },
          {
            id: "go-bo-santander-tc",
            label: "Santander TC",
            path: ROUTES.goBoSantanderTc,
          },
          {
            id: "go-bo-santander-ld",
            label: "Santander LD",
            path: ROUTES.goBoSantanderLd,
          },
          {
            id: "go-bo-cencosud-tc",
            label: "Cencosud TC",
            path: ROUTES.goBoCencosudTc,
          },
          {
            id: "go-bo-cencosud-ld",
            label: "Cencosud LD",
            path: ROUTES.goBoCencosudLd,
          },
        ],
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuracion",
    children: [
      {
        id: "config-mantenimiento-tablas",
        label: "Mantenimiento Tablas",
        path: ROUTES.configuracionMantenimientoTablas,
      },
      { id: "config-usuarios", label: "Usuarios", path: ROUTES.configuracionUsuarios },
    ],
  },
];
