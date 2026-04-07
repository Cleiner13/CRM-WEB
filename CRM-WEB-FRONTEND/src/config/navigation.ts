import { ROUTES } from "@/config/routes";

export type NavigationItem = {
  id: string;
  label?: string;
  path?: string;
  moduleId?: number;
  alwaysVisible?: boolean;
  children?: NavigationItem[];
};

export const NAVIGATION_MENU: NavigationItem[] = [
  { id: "dashboard", path: ROUTES.dashboard, moduleId: 1, alwaysVisible: true },
  { id: "profile", path: ROUTES.profile, moduleId: 2, alwaysVisible: true },
  { id: "inbox", path: ROUTES.inbox, moduleId: 3, alwaysVisible: true },
  {
    id: "administracion",
    moduleId: 4,
    children: [
      {
        id: "admin-personal",
        path: ROUTES.adminPersonal,
        moduleId: 10,
      },
      {
        id: "admin-comisiones",
        path: ROUTES.adminComisiones,
        moduleId: 11,
      },
      {
        id: "admin-pagos",
        path: ROUTES.adminPagos,
        moduleId: 12,
      },
      {
        id: "admin-reportes-personal",
        path: ROUTES.adminReportesPersonal,
        moduleId: 13,
      },
    ],
  },
  {
    id: "ti",
    moduleId: 5,
    children: [
      {
        id: "soporte-tecnico",
        moduleId: 14,
        children: [
          {
            id: "ti-ingresos-salidas",
            path: ROUTES.tiIngresosSalidas,
            moduleId: 15,
          },
          {
            id: "ti-inventario",
            path: ROUTES.tiInventario,
            moduleId: 16,
          },
        ],
      },
      {
        id: "sistemas",
        moduleId: 17,
        children: [
          {
            id: "ti-sistemas-listas",
            path: ROUTES.tiSistemasListas,
            moduleId: 18,
          },
          {
            id: "ti-sistemas-bases",
            path: ROUTES.tiSistemasBases,
            moduleId: 19,
          },
        ],
      },
    ],
  },
  {
    id: "gerencia",
    moduleId: 6,
    children: [
      {
        id: "ger-reporte-listas",
        path: ROUTES.gerenciaReporteListas,
        moduleId: 20,
      },
      {
        id: "ger-reporte-bases",
        path: ROUTES.gerenciaReporteBases,
        moduleId: 21,
      },
      {
        id: "ger-reporte-ventas",
        path: ROUTES.gerenciaReporteVentas,
        moduleId: 22,
      },
      {
        id: "ger-reporte-gestion-personal",
        path: ROUTES.gerenciaReporteGestionPersonal,
        moduleId: 23,
      },
    ],
  },
  {
    id: "documentos-operativos",
    path: ROUTES.documentosOperativos,
    moduleId: 7,
  },
  {
    id: "gestion-operativa",
    moduleId: 8,
    children: [
      {
        id: "go-ventas",
        moduleId: 24,
        children: [
          {
            id: "go-ventas-oh-tc",
            path: ROUTES.goVentasOhTc,
            moduleId: 26,
          },
          {
            id: "go-ventas-oh-max",
            path: ROUTES.goVentasOhMax,
            moduleId: 27,
          },
          {
            id: "go-ventas-oh-pld",
            path: ROUTES.goVentasOhPld,
            moduleId: 28,
          },
          {
            id: "go-ventas-santander-tc",
            path: ROUTES.goVentasSantanderTc,
            moduleId: 29,
          },
          {
            id: "go-ventas-santander-ld",
            path: ROUTES.goVentasSantanderLd,
            moduleId: 30,
          },
          {
            id: "go-ventas-cencosud-tc",
            path: ROUTES.goVentasCencosudTc,
            moduleId: 31,
          },
          {
            id: "go-ventas-cencosud-ld",
            path: ROUTES.goVentasCencosudLd,
            moduleId: 32,
          },
        ],
      },
      {
        id: "go-back-office",
        moduleId: 25,
        children: [
          {
            id: "go-bo-oh-tc",
            path: ROUTES.goBoOhTc,
            moduleId: 33,
          },
          {
            id: "go-bo-oh-max",
            path: ROUTES.goBoOhMax,
            moduleId: 34,
          },
          {
            id: "go-bo-oh-pld",
            path: ROUTES.goBoOhPld,
            moduleId: 35,
          },
          {
            id: "go-bo-santander-tc",
            path: ROUTES.goBoSantanderTc,
            moduleId: 36,
          },
          {
            id: "go-bo-santander-ld",
            path: ROUTES.goBoSantanderLd,
            moduleId: 37,
          },
          {
            id: "go-bo-cencosud-tc",
            path: ROUTES.goBoCencosudTc,
            moduleId: 38,
          },
          {
            id: "go-bo-cencosud-ld",
            path: ROUTES.goBoCencosudLd,
            moduleId: 39,
          },
        ],
      },
    ],
  },
  {
    id: "configuracion",
    moduleId: 9,
    children: [
      {
        id: "config-mantenimiento-tablas",
        path: ROUTES.configuracionMantenimientoTablas,
        moduleId: 40,
      },
      {
        id: "config-usuarios",
        path: ROUTES.configuracionUsuarios,
        moduleId: 41,
      },
    ],
  },
];
