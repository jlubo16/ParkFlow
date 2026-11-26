import { useCallback, useState } from 'react';

export default function useAsyncAction() {
    const [loading, setLoading] = useState(false);

    const run = useCallback(async (action) => {
        setLoading(true);
        try {
            return await action();
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, run };
}
