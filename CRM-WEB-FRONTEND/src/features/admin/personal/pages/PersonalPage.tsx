import { Button, Modal } from "@/components/ui";
import { EMPTY_FORM } from "../constants/personalConstants";
import { PersonalFormModal } from "../components/PersonalFormModal";
import { PersonalFilters } from "../components/PersonalFilters";
import { PersonalSummaryCards } from "../components/PersonalSummaryCards";
import { PersonalTableCard } from "../components/PersonalTableCard";
import { usePersonalPage } from "../hooks/usePersonalPage";
import { fullName } from "../utils/personalUtils";

export function PersonalPage(): JSX.Element {
  const personal = usePersonalPage();

  return (
    <div className="space-y-5">
      <PersonalFilters
        areaId={personal.areaId}
        areaOptions={personal.areaOptions}
        cargoId={personal.cargoId}
        cargoOptions={personal.cargoOptions}
        estadoId={personal.estadoId}
        estadoOptions={personal.estadoOptions}
        onAreaChange={(value) => { personal.setAreaId(value); personal.setPage(1); }}
        onCargoChange={(value) => { personal.setCargoId(value); personal.setPage(1); }}
        onClear={() => void personal.handleClearFilters()}
        onCreate={() => void personal.openCreateModal()}
        onEstadoChange={(value) => { personal.setEstadoId(value); personal.setPage(1); }}
        onExport={() => void personal.handleExport()}
        onOnlyActiveChange={(value) => { personal.setOnlyActive(value); personal.setPage(1); }}
        onSearchChange={(value) => { personal.setSearch(value); personal.setPage(1); }}
        onlyActive={personal.onlyActive}
        search={personal.search}
      />

      <PersonalSummaryCards
        total={personal.total}
        visibleActiveCount={personal.visibleActiveCount}
        visibleWithUserCount={personal.visibleWithUserCount}
      />

      <PersonalTableCard
        columns={personal.columns}
        employees={personal.employees}
        loading={personal.loading}
        onPageChange={personal.setPage}
        onPageSizeChange={(value) => { personal.setPageSize(value); personal.setPage(1); }}
        page={personal.page}
        pageSize={personal.pageSize}
        total={personal.total}
      />

      <PersonalFormModal
        documentGate={personal.documentGate}
        documentGateMessage={personal.documentGateMessage}
        documentMeta={personal.documentMeta}
        employeeOptions={personal.employeeOptions}
        form={personal.form}
        formErrors={personal.formErrors}
        formFieldsDisabled={personal.formFieldsDisabled}
        isOpen={personal.employeeModalOpen}
        loading={personal.loadingEmployee}
        masters={personal.masters}
        mode={personal.employeeModalMode}
        numeroDocumentoDisabled={personal.numeroDocumentoDisabled}
        onClose={() => {
          personal.setEmployeeModalOpen(false);
          personal.setForm(EMPTY_FORM);
          personal.setFormErrors({});
        }}
        onFieldChange={personal.setField}
        onNumeroDocumentoChange={personal.handleNumeroDocumentoChange}
        onSave={() => void personal.handleSave()}
        onTipoDocumentoChange={personal.handleTipoDocumentoChange}
        saving={personal.savingEmployee}
      />

      <Modal
        footer={<Button loading={personal.processingDeactivate} onClick={() => void personal.handleDeactivate()} variant="delete">Confirmar</Button>}
        isOpen={Boolean(personal.confirmDeactivate)}
        onClose={() => personal.setConfirmDeactivate(null)}
        panelClassName="max-w-[560px]"
        title="Inactivar personal"
        variant="warning"
      >
        <p>{personal.confirmDeactivate ? `Se inactivara a ${fullName(personal.confirmDeactivate)} y se cortara su acceso tecnico si tiene usuario asociado.` : ""}</p>
      </Modal>

      <Modal
        footer={<Button onClick={() => personal.setFeedback(null)} variant="create">Cerrar</Button>}
        isOpen={Boolean(personal.feedback)}
        onClose={() => personal.setFeedback(null)}
        panelClassName="max-w-[560px]"
        title={personal.feedback?.title || "Mensaje"}
        variant={personal.feedback?.variant || "info"}
      >
        <p>{personal.feedback?.message}</p>
      </Modal>
    </div>
  );
}

export default PersonalPage;
