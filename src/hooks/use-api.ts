import { useState, useEffect, useCallback } from "react";

type AsyncFn<T> = (...args: unknown[]) => Promise<{ data: T }>;

export function useApi<T>(fn: AsyncFn<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fn(...args);
        setData(res.data);
        return res.data;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, setData };
}
