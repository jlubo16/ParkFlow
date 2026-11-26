import { useCallback, useState } from 'react';

/** El hook centraliza el indicador de carga y conserva el resultado de una acción. */
export default function useAsyncAction() {
    // El estado informa a la interfaz si la operación asíncrona sigue activa.
    const [loading, setLoading] = useState(false);

    // La función activa la carga y la desactiva incluso si la operación falla.
    const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await action();
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, run };
}
