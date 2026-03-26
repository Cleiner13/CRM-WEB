import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { AppShell } from "@/components/layout";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ChangePasswordPage } from "@/features/auth/pages/ChangePasswordPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { InboxPage } from "@/features/inbox/pages/InboxPage";
import { PersonalPage } from "@/features/admin/personal/pages/PersonalPage";
import { ComisionesPage } from "@/features/admin/comisiones/pages/ComisionesPage";
import { PagosPage } from "@/features/admin/pagos/pages/PagosPage";
import { ReportesPersonalPage } from "@/features/admin/reportes-personal/pages/ReportesPersonalPage";
import { IngresosSalidasPage } from "@/features/ti/soporte-tecnico/ingresos-salidas/pages/IngresosSalidasPage";
import { InventarioTIPage } from "@/features/ti/soporte-tecnico/inventario/pages/InventarioTIPage";
import { ListasPage } from "@/features/ti/sistemas/listas/pages/ListasPage";
import { BasesPage } from "@/features/ti/sistemas/bases/pages/BasesPage";
import { ReporteListasPage } from "@/features/gerencia/reporte-listas/pages/ReporteListasPage";
import { ReporteBasesPage } from "@/features/gerencia/reporte-bases/pages/ReporteBasesPage";
import { ReporteVentasPage } from "@/features/gerencia/reporte-ventas/pages/ReporteVentasPage";
import { ReporteGestionPersonalPage } from "@/features/gerencia/reporte-gestion-personal/pages/ReporteGestionPersonalPage";
import { DocumentosOperativosPage } from "@/features/documentos-operativos/pages/DocumentosOperativosPage";
import { OHTCPage } from "@/features/gestion-operativa/ventas/oh-tc/pages/OHTCPage";
import { OHMaxPage } from "@/features/gestion-operativa/ventas/oh-max/pages/OHMaxPage";
import { OHPldPage } from "@/features/gestion-operativa/ventas/oh-pld/pages/OHPldPage";
import { SantanderTCPage } from "@/features/gestion-operativa/ventas/santander-tc/pages/SantanderTCPage";
import { SantanderLDPage } from "@/features/gestion-operativa/ventas/santander-ld/pages/SantanderLDPage";
import { CencosudTCPage } from "@/features/gestion-operativa/ventas/cencosud-tc/pages/CencosudTCPage";
import { CencosudLDPage } from "@/features/gestion-operativa/ventas/cencosud-ld/pages/CencosudLDPage";
import { BO_OHTCPage } from "@/features/gestion-operativa/back-office/oh-tc/pages/BO_OHTCPage";
import { BO_OHMaxPage } from "@/features/gestion-operativa/back-office/oh-max/pages/BO_OHMaxPage";
import { BO_OHPldPage } from "@/features/gestion-operativa/back-office/oh-pld/pages/BO_OHPldPage";
import { BO_SantanderTCPage } from "@/features/gestion-operativa/back-office/santander-tc/pages/BO_SantanderTCPage";
import { BO_SantanderLDPage } from "@/features/gestion-operativa/back-office/santander-ld/pages/BO_SantanderLDPage";
import { BO_CencosudTCPage } from "@/features/gestion-operativa/back-office/cencosud-tc/pages/BO_CencosudTCPage";
import { BO_CencosudLDPage } from "@/features/gestion-operativa/back-office/cencosud-ld/pages/BO_CencosudLDPage";
import { MantenimientoTablasPage } from "@/features/configuracion/mantenimiento-tablas/pages/MantenimientoTablasPage";
import { UsuariosPage } from "@/features/configuracion/usuarios/pages/UsuariosPage";

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route element={<Navigate replace to={ROUTES.dashboard} />} path="/" />
      <Route element={<LoginPage />} path={ROUTES.login} />
      <Route element={<ChangePasswordPage />} path={ROUTES.changePassword} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
        <Route path={ROUTES.inbox} element={<InboxPage />} />
        <Route path={ROUTES.adminPersonal} element={<PersonalPage />} />
        <Route path={ROUTES.adminComisiones} element={<ComisionesPage />} />
        <Route path={ROUTES.adminPagos} element={<PagosPage />} />
        <Route path={ROUTES.adminReportesPersonal} element={<ReportesPersonalPage />} />
        <Route path={ROUTES.tiIngresosSalidas} element={<IngresosSalidasPage />} />
        <Route path={ROUTES.tiInventario} element={<InventarioTIPage />} />
        <Route path={ROUTES.tiSistemasListas} element={<ListasPage />} />
        <Route path={ROUTES.tiSistemasBases} element={<BasesPage />} />
        <Route path={ROUTES.gerenciaReporteListas} element={<ReporteListasPage />} />
        <Route path={ROUTES.gerenciaReporteBases} element={<ReporteBasesPage />} />
        <Route path={ROUTES.gerenciaReporteVentas} element={<ReporteVentasPage />} />
        <Route path={ROUTES.gerenciaReporteGestionPersonal} element={<ReporteGestionPersonalPage />} />
        <Route path={ROUTES.documentosOperativos} element={<DocumentosOperativosPage />} />
        <Route path={ROUTES.goVentasOhTc} element={<OHTCPage />} />
        <Route path={ROUTES.goVentasOhMax} element={<OHMaxPage />} />
        <Route path={ROUTES.goVentasOhPld} element={<OHPldPage />} />
        <Route path={ROUTES.goVentasSantanderTc} element={<SantanderTCPage />} />
        <Route path={ROUTES.goVentasSantanderLd} element={<SantanderLDPage />} />
        <Route path={ROUTES.goVentasCencosudTc} element={<CencosudTCPage />} />
        <Route path={ROUTES.goVentasCencosudLd} element={<CencosudLDPage />} />
        <Route path={ROUTES.goBoOhTc} element={<BO_OHTCPage />} />
        <Route path={ROUTES.goBoOhMax} element={<BO_OHMaxPage />} />
        <Route path={ROUTES.goBoOhPld} element={<BO_OHPldPage />} />
        <Route path={ROUTES.goBoSantanderTc} element={<BO_SantanderTCPage />} />
        <Route path={ROUTES.goBoSantanderLd} element={<BO_SantanderLDPage />} />
        <Route path={ROUTES.goBoCencosudTc} element={<BO_CencosudTCPage />} />
        <Route path={ROUTES.goBoCencosudLd} element={<BO_CencosudLDPage />} />
        <Route path={ROUTES.configuracionMantenimientoTablas} element={<MantenimientoTablasPage />} />
        <Route path={ROUTES.configuracionUsuarios} element={<UsuariosPage />} />
        </Route>
      </Route>
      <Route element={<Navigate replace to={ROUTES.dashboard} />} path="*" />
    </Routes>
  );
}

export default AppRouter;
