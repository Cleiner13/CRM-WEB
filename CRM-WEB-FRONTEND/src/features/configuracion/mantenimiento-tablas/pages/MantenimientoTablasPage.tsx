import { Download, Plus } from "lucide-react";
import { Button, Card, Input, Modal, Pagination, Select, Table, Textarea } from "@/components/ui";
import { ACTION_CODES, INITIAL_FORM, INITIAL_ITEM_FORM, INITIAL_RELATION_FORM } from "../constants/mantenimientoConstants";
import { MantenimientoFilters } from "../components/MantenimientoFilters";
import { MantenimientoSummary } from "../components/MantenimientoSummary";
import { useMantenimientoTablasPage } from "../hooks/useMantenimientoTablasPage";
import { buildCsv, downloadCsv, getRowId } from "../utils/mantenimientoUtils";

export function MantenimientoTablasPage(): JSX.Element {
  const {
    activeTable,
    availableChildItems,
    columns,
    draftSearch,
    ensureActionPermission,
    feedbackMessage,
    feedbackTitle,
    feedbackVariant,
    filteredRows,
    form,
    formErrors,
    handleChangeItemStatus,
    handleChangeRelationStatus,
    handleChangeStatus,
    handleSave,
    handleSaveItem,
    handleSaveRelation,
    isDeleteOpen,
    isFeedbackOpen,
    isFormOpen,
    isItemFormOpen,
    isItemSaving,
    isItemStatusOpen,
    isItemStatusSubmitting,
    isRelationFormOpen,
    isRelationSaving,
    isRelationStatusOpen,
    isRelationStatusSubmitting,
    isSaving,
    isStatusSubmitting,
    itemColumns,
    itemForm,
    itemFormErrors,
    itemMetrics,
    itemSearch,
    itemStatusFilter,
    itemsLoading,
    loadCurrentTable,
    loading,
    masterItems,
    masterTables,
    meta,
    metrics,
    normalizedPage,
    pageSize,
    paginatedItems,
    paginatedRows,
    relationColumns,
    relationForm,
    relationFormErrors,
    relationMetrics,
    relationStatusFilter,
    relationTypeFilter,
    relations,
    relationsLoading,
    selectedCatalogRow,
    selectedItem,
    selectedMasterTable,
    selectedParentItem,
    selectedRelation,
    setActiveTable,
    setDraftSearch,
    setForm,
    setFormErrors,
    setIsDeleteOpen,
    setIsFeedbackOpen,
    setIsFormOpen,
    setIsItemFormOpen,
    setIsItemStatusOpen,
    setIsRelationFormOpen,
    setIsRelationStatusOpen,
    setItemForm,
    setItemFormErrors,
    setItemSearch,
    setItemStatusFilter,
    setPage,
    setPageSize,
    setRelationForm,
    setRelationFormErrors,
    setRelationStatusFilter,
    setRelationTypeFilter,
    setSelectedCatalogRow,
    setSelectedItem,
    setSelectedMasterTable,
    setSelectedParentItem,
    setSelectedRelation,
    setStatusFilter,
    statusFilter,
    total,
  } = useMantenimientoTablasPage();

  return (
    <div className="space-y-6">
      <MantenimientoFilters
        activeTable={activeTable}
        draftSearch={draftSearch}
        meta={meta}
        onActiveTableChange={(value) => setActiveTable(value)}
        onClear={() => {
          void (async () => {
            if (!(await ensureActionPermission(ACTION_CODES.clear, "limpiar filtros"))) return;
            setDraftSearch("");
            setStatusFilter("active");
            setPage(1);
            void loadCurrentTable(activeTable, "", "active");
          })();
        }}
        onSearchChange={setDraftSearch}
        onStatusFilterChange={setStatusFilter}
        statusFilter={statusFilter}
      />

      <MantenimientoSummary meta={meta} metrics={metrics} />

      <Card
        bodyClassName="pt-5"
        className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
        subtitle={meta.subtitle}
        title={`Tablas de ${meta.title.toLowerCase()}`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Listado principal</p>
              <p className="text-sm text-slate-500">
                {loading ? `Cargando ${meta.title.toLowerCase()}...` : `${total} registros encontrados${draftSearch.trim() ? ` para "${draftSearch.trim()}"` : ""}.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => {
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.create, "crear"))) {
                    return;
                  }
                  setSelectedCatalogRow(null);
                  setForm(INITIAL_FORM);
                  setFormErrors({});
                  setIsFormOpen(true);
                })();
              }}
                variant="create"
              >
                Crear
              </Button>
            <Button
              leftIcon={<Download size={16} />}
              onClick={() => {
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.export, "exportar"))) {
                    return;
                  }

                  downloadCsv(meta.exportFilename, buildCsv(filteredRows));
                })();
              }}
                variant="export"
              >
                Exportar
              </Button>
            </div>
          </div>

          <Table columns={columns} emptyMessage={`No hay ${meta.title.toLowerCase()} para mostrar.`} getRowKey={(row) => String(getRowId(row))} rows={paginatedRows} />

          <Pagination
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            page={normalizedPage}
            pageSize={pageSize}
            total={total}
          />
        </div>
      </Card>

      {activeTable === "masterTables" ? (
        <div className="space-y-6">
          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle="Siga la secuencia natural: primero tabla maestra, luego item y finalmente sus relaciones"
            title="Estructura de catalogos"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 1</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Tabla maestra</p>
                <p className="mt-1 text-sm text-slate-500">Define el contenedor principal del catalogo.</p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 2</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Items maestros</p>
                <p className="mt-1 text-sm text-slate-500">Agrupa y mantiene los elementos de esa tabla.</p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 3</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Relaciones</p>
                <p className="mt-1 text-sm text-slate-500">Conecta un item padre con sus items hijos y su tipo de vinculo.</p>
              </div>
            </div>
          </Card>

          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle={selectedMasterTable ? `Gestion detallada para ${selectedMasterTable.nombre}` : "Seleccione una tabla maestra activa para administrar sus items"}
            title="Items maestros"
          >
            <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_220px_auto] lg:items-center">
              <Select
                label="Tabla maestra"
                onChange={(event) => {
                  const nextTable = masterTables.find((row) => row.tablaMaestraId === Number(event.target.value)) ?? null;
                  setSelectedMasterTable(nextTable);
                }}
                options={(masterTables.length ? masterTables : []).map((row) => ({ label: row.nombre, value: String(row.tablaMaestraId) }))}
                value={selectedMasterTable ? String(selectedMasterTable.tablaMaestraId) : ""}
              />
              <Input label="Buscar item" onChange={(event) => setItemSearch(event.target.value)} placeholder="Ej. LIMA, ACTIVO, FULL_TIME" value={itemSearch} />
              <Select
                label="Filtro items"
                onChange={(event) => setItemStatusFilter(event.target.value as "all" | "active")}
                options={[
                  { label: "Solo activos", value: "active" },
                  { label: "Todos", value: "all" },
                ]}
                value={itemStatusFilter}
              />
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button
                  disabled={!selectedMasterTable}
                  leftIcon={<Plus size={16} />}
                  onClick={() => {
                    void (async () => {
                      if (!(await ensureActionPermission(ACTION_CODES.create, "crear"))) {
                        return;
                      }
                    setSelectedItem(null);
                    setItemForm(INITIAL_ITEM_FORM);
                    setItemFormErrors({});
                    setIsItemFormOpen(true);
                    })();
                  }}
                  variant="create"
                >
                  Crear item
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tabla seleccionada</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{selectedMasterTable?.nombre || "-"}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedMasterTable?.codigo || "Sin seleccion"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Items activos</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">{itemMetrics.active}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Items inactivos</p>
                <p className="mt-2 text-2xl font-semibold text-rose-600">{itemMetrics.inactive}</p>
              </div>
            </div>

              <Table
                columns={itemColumns}
                emptyMessage={selectedMasterTable ? "No hay items maestros para mostrar." : "Seleccione una tabla maestra para comenzar."}
                getRowKey={(row) => String(row.itemMaestroId)}
                rows={paginatedItems}
              />

              {itemsLoading ? <p className="text-sm text-slate-500">Cargando items maestros...</p> : null}
            </div>
          </Card>

          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle={selectedParentItem ? `Relaciones configuradas para ${selectedParentItem.nombre}` : "Seleccione un item padre para ver y administrar sus relaciones"}
            title="Relaciones items maestros"
          >
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_220px_auto] lg:items-center">
                <Select
                  label="Item padre"
                  onChange={(event) => {
                    const nextParent = masterItems.find((row) => row.itemMaestroId === Number(event.target.value)) ?? null;
                    setSelectedParentItem(nextParent);
                  }}
                  options={(masterItems.length ? masterItems : []).map((row) => ({ label: `${row.nombre} (${row.codigo})`, value: String(row.itemMaestroId) }))}
                  value={selectedParentItem ? String(selectedParentItem.itemMaestroId) : ""}
                />
                <Input
                  label="Tipo de relacion"
                  onChange={(event) => setRelationTypeFilter(event.target.value)}
                  placeholder="Ej. HIJO, DEPENDE_DE, CAMPANIA_PRODUCTO"
                  value={relationTypeFilter}
                />
                <Select
                  label="Filtro relaciones"
                  onChange={(event) => setRelationStatusFilter(event.target.value as "all" | "active")}
                  options={[
                    { label: "Solo activas", value: "active" },
                    { label: "Todas", value: "all" },
                  ]}
                  value={relationStatusFilter}
                />
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button
                  disabled={!selectedParentItem}
                  leftIcon={<Plus size={16} />}
                  onClick={() => {
                    void (async () => {
                      if (!(await ensureActionPermission(ACTION_CODES.create, "crear"))) {
                        return;
                      }
                      setSelectedRelation(null);
                      setRelationForm(INITIAL_RELATION_FORM);
                      setRelationFormErrors({});
                      setIsRelationFormOpen(true);
                    })();
                  }}
                    variant="create"
                  >
                    Crear relacion
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Item padre</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{selectedParentItem?.nombre || "-"}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedParentItem?.codigo || "Sin seleccion"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Relaciones activas</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">{relationMetrics.active}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Relaciones inactivas</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-600">{relationMetrics.inactive}</p>
                </div>
              </div>

              <Table
                columns={relationColumns}
                emptyMessage={selectedParentItem ? "No hay relaciones para mostrar." : "Seleccione un item padre para comenzar."}
                getRowKey={(row) => String(row.relacionId)}
                rows={relations}
              />

              {relationsLoading ? <p className="text-sm text-slate-500">Cargando relaciones del item seleccionado...</p> : null}
            </div>
          </Card>
        </div>
      ) : null}

      <Modal
        footer={<Button loading={isSaving} onClick={() => void handleSave()} variant="create">{form.id ? "Guardar cambios" : meta.createLabel}</Button>}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCatalogRow(null);
          setForm(INITIAL_FORM);
          setFormErrors({});
        }}
        title={form.id ? meta.editLabel : meta.createLabel}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            errorText={formErrors.codigo}
            label="Codigo"
            onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value.toUpperCase() }))}
            placeholder={
              activeTable === "modules"
                ? "Ej. CONFIGURACION.USUARIOS"
                : activeTable === "roles"
                  ? "Ej. SUPER_ADMIN"
                  : activeTable === "permissions"
                    ? "Ej. EXPORTAR"
                    : "Ej. AREAS"
            }
            value={form.codigo}
          />
          <Input
            errorText={formErrors.nombre}
            label="Nombre"
            onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
            placeholder={
              activeTable === "modules"
                ? "Ej. USUARIOS"
                : activeTable === "roles"
                  ? "Ej. SUPER ADMIN"
                  : activeTable === "permissions"
                    ? "Ej. Exportar"
                    : "Ej. Areas"
            }
            value={form.nombre}
          />
          <Textarea
            containerClassName="md:col-span-2"
            label="Descripcion"
            onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
            placeholder="Descripcion breve del registro"
            rows={3}
            value={form.descripcion}
          />
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional del registro."
            label="Datos extra"
            onChange={(event) => setForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"orden":1}'
            rows={3}
            value={form.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={<Button loading={isItemSaving} onClick={() => void handleSaveItem()} variant="create">{itemForm.id ? "Guardar cambios" : "Crear item maestro"}</Button>}
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setSelectedItem(null);
          setItemForm(INITIAL_ITEM_FORM);
          setItemFormErrors({});
        }}
        title={itemForm.id ? "Editar item maestro" : "Crear item maestro"}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            errorText={itemFormErrors.codigo}
            label="Codigo"
            onChange={(event) => setItemForm((current) => ({ ...current, codigo: event.target.value.toUpperCase() }))}
            placeholder="Ej. CALLAO"
            value={itemForm.codigo}
          />
          <Input
            errorText={itemFormErrors.nombre}
            label="Nombre"
            onChange={(event) => setItemForm((current) => ({ ...current, nombre: event.target.value }))}
            placeholder="Ej. Callao"
            value={itemForm.nombre}
          />
          <Input
            errorText={itemFormErrors.orden}
            label="Orden"
            onChange={(event) => setItemForm((current) => ({ ...current, orden: event.target.value }))}
            placeholder="Ej. 1"
            value={itemForm.orden}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Tabla maestra
            <p className="mt-1 font-semibold text-slate-900">{selectedMasterTable?.nombre || "-"}</p>
          </div>
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional del item."
            label="Datos extra"
            onChange={(event) => setItemForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"color":"azul"}'
            rows={3}
            value={itemForm.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={<Button loading={isRelationSaving} onClick={() => void handleSaveRelation()} variant="create">{relationForm.id ? "Guardar cambios" : "Crear relacion"}</Button>}
        isOpen={isRelationFormOpen}
        onClose={() => {
          setIsRelationFormOpen(false);
          setSelectedRelation(null);
          setRelationForm(INITIAL_RELATION_FORM);
          setRelationFormErrors({});
        }}
        title={relationForm.id ? "Editar relacion" : "Crear relacion"}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Item padre
            <p className="mt-1 font-semibold text-slate-900">{selectedParentItem?.nombre || "-"}</p>
          </div>
          <Select
            errorText={relationFormErrors.itemHijoId}
            label="Item hijo"
            onChange={(event) => setRelationForm((current) => ({ ...current, itemHijoId: event.target.value }))}
            options={availableChildItems.map((item) => ({ label: `${item.nombre} (${item.codigo})`, value: String(item.itemMaestroId) }))}
            value={relationForm.itemHijoId}
          />
          <Input
            errorText={relationFormErrors.tipoRelacion}
            label="Tipo de relacion"
            onChange={(event) => setRelationForm((current) => ({ ...current, tipoRelacion: event.target.value.toUpperCase() }))}
            placeholder="Ej. HIJO"
            value={relationForm.tipoRelacion}
          />
          <Input
            errorText={relationFormErrors.orden}
            label="Orden"
            onChange={(event) => setRelationForm((current) => ({ ...current, orden: event.target.value }))}
            placeholder="Ej. 1"
            value={relationForm.orden}
          />
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional de la relacion."
            label="Datos extra"
            onChange={(event) => setRelationForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"prioridad":"alta"}'
            rows={3}
            value={relationForm.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={
          <Button loading={isStatusSubmitting} onClick={() => void handleChangeStatus()} variant={selectedCatalogRow?.activo ? "delete" : "create"}>
            {selectedCatalogRow?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCatalogRow(null);
        }}
        title={selectedCatalogRow?.activo ? `Inactivar ${meta.title.slice(0, -1).toLowerCase()}` : `Reactivar ${meta.title.slice(0, -1).toLowerCase()}`}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedCatalogRow
            ? selectedCatalogRow.activo
              ? activeTable === "modules"
                ? `Se inactivara el modulo ${selectedCatalogRow.nombre}. Esta accion ocultara su uso operativo, pero mantendra el historial.`
                : activeTable === "roles"
                  ? `Se inactivara el rol ${selectedCatalogRow.nombre}. Revise antes cualquier asignacion critica asociada.`
                  : `Se inactivara la tabla maestra ${selectedCatalogRow.nombre}. Esta accion ocultara su uso operativo, pero mantendra el historial.`
              : activeTable === "modules"
                ? `Se reactivara el modulo ${selectedCatalogRow.nombre} para volver a usarlo en el sistema.`
                : activeTable === "roles"
                  ? `Se reactivara el rol ${selectedCatalogRow.nombre} para que vuelva a estar disponible.`
                  : `Se reactivara la tabla maestra ${selectedCatalogRow.nombre} para volver a usarla en el sistema.`
            : "Seleccione un registro valido para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button loading={isItemStatusSubmitting} onClick={() => void handleChangeItemStatus()} variant={selectedItem?.activo ? "delete" : "create"}>
            {selectedItem?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isItemStatusOpen}
        onClose={() => {
          setIsItemStatusOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem?.activo ? "Inactivar item maestro" : "Reactivar item maestro"}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedItem
            ? selectedItem.activo
              ? `Se inactivara el item maestro ${selectedItem.nombre}. Esta accion mantendra el historial pero ocultara su uso operativo.`
              : `Se reactivara el item maestro ${selectedItem.nombre} para volver a usarlo en el sistema.`
            : "Seleccione un item maestro valido para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button loading={isRelationStatusSubmitting} onClick={() => void handleChangeRelationStatus()} variant={selectedRelation?.activo ? "delete" : "create"}>
            {selectedRelation?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isRelationStatusOpen}
        onClose={() => {
          setIsRelationStatusOpen(false);
          setSelectedRelation(null);
        }}
        title={selectedRelation?.activo ? "Inactivar relacion" : "Reactivar relacion"}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedRelation
            ? selectedRelation.activo
              ? "Se inactivara la relacion del item seleccionado. El historial se mantendra disponible."
              : "Se reactivara la relacion para volver a usarla en el sistema."
            : "Seleccione una relacion valida para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button
            onClick={() => {
              setIsFeedbackOpen(false);
            }}
            variant="create"
          >
            Cerrar
          </Button>
        }
        isOpen={isFeedbackOpen}
        onClose={() => {
          setIsFeedbackOpen(false);
        }}
        title={feedbackTitle}
        variant={feedbackVariant}
      >
        <p>{feedbackMessage}</p>
      </Modal>
    </div>
  );
}

export default MantenimientoTablasPage;
