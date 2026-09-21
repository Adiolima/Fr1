import { useState, useCallback, useRef } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  fn: (...args: unknown[]) => Promise<T>,
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fnRef.current(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro ??
        (err as Error)?.message ??
        "Erro ao carregar dados";
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
