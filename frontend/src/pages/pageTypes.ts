// Tipos das props que todas as paginas recebem.
import type { AppData, CollectionName, RecordId } from "../models/types";

// Contrato compartilhado por todas as paginas.
export interface PageProps {
    data: AppData;
    refreshData: () => Promise<void>;
    addWithId: (name: CollectionName, record: any) => Promise<boolean>;
    addDirect: (name: CollectionName, record: any) => Promise<any | null>;
    updateById: (name: CollectionName, id: RecordId, patch: any) => Promise<boolean>;
    removeById: (name: CollectionName, id: RecordId) => Promise<void>;
    removeDirect: (name: CollectionName, id: RecordId) => Promise<boolean>;
    notify: (message: string, type?: "success" | "warning" | "danger") => void;
    navigate: (section: string) => void;
}
