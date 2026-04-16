import type { RolePermissionMatrixItem, UserPermissionMatrixItem } from "@/types";

export type ModalTone = "info" | "warning" | "error";
export type ActionType = "block" | "reset";
export type MatrixItem = RolePermissionMatrixItem | UserPermissionMatrixItem;
export type MatrixGroup<T extends MatrixItem> = {
  moduloId: number;
  moduloNombre: string;
  moduloCodigo: string;
  items: T[];
};
