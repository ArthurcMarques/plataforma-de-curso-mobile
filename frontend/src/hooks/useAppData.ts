// Hook que concentra dados, loading, alertas e operacoes de CRUD.
import { useEffect, useState } from "react";
import type { AppData, CollectionName, RecordId } from "../models/types";
import { createRecord, deleteRecord, emptyAppData, fetchAppData, updateRecord } from "../services/api";

type AlertState = { message: string; type: "success" | "warning" | "danger" } | null;
type WithId = { id: RecordId };

export function useAppData() {
    // Estado compartilhado por todas as paginas.
    const [data, setData] = useState<AppData>(emptyAppData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>(null);

    useEffect(() => {
        void refreshData();
    }, []);

    // Carrega todas as colecoes da API.
    async function refreshData() {
        setLoading(true);
        try {
            setData(await fetchAppData());
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Não foi possível carregar os dados da API.");
        } finally {
            setLoading(false);
        }
    }

    function notify(message: string, type: "success" | "warning" | "danger" = "success") {
        setAlert({ message, type });
        window.setTimeout(() => setAlert(null), 2800);
    }

    async function addWithId(name: CollectionName, record: any) {
        const saved = await addDirect(name, record);
        if (saved) {
            notify("Registro salvo com sucesso.");
        }
        return Boolean(saved);
    }

    async function addDirect(name: CollectionName, record: any) {
        try {
            const saved = await createRecord(name, record);
            setData((current) => ({ ...current, [name]: [...current[name], saved] }));
            return saved;
        } catch (error) {
            notify(error instanceof Error ? error.message : "Não foi possível salvar o registro.", "danger");
            return null;
        }
    }

    async function removeById(name: CollectionName, id: RecordId) {
        if (!window.confirm("Deseja excluir este registro?")) {
            return;
        }

        const removed = await removeDirect(name, id);
        if (removed) {
            notify("Registro removido com sucesso.", "warning");
        }
    }

    async function removeDirect(name: CollectionName, id: RecordId) {
        try {
            await deleteRecord(name, id);
            setData(current => ({
                ...current,
                [name]: (current[name] as WithId[]).filter(item => String(item.id) !== String(id))
            }));
            return true;
        } catch (error) {
            notify(error instanceof Error ? error.message : "Não foi possível remover o registro.", "danger");
            return false;
        }
    }

    async function updateById(name: CollectionName, id: RecordId, patch: any) {
        try {
            const saved = await updateRecord(name, id, patch);
            setData((current) => ({
                ...current,
                [name]: (current[name] as unknown as WithId[]).map((item) => {
                    return String(item.id) === String(id) ? saved : item;
                })
            }));
            notify("Registro atualizado com sucesso.");
            return true;
        } catch (error) {
            notify(error instanceof Error ? error.message : "Não foi possível atualizar o registro.", "danger");
            return false;
        }
    }

    return {
        data,
        loading,
        error,
        alert,
        refreshData,
        notify,
        addWithId,
        addDirect,
        removeById,
        removeDirect,
        updateById
    };
}
