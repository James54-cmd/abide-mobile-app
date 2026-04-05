import { ApiError } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export type ApiRequestState = "loading" | "ready" | "error";

/**
 * Shared data fetching hook - eliminates duplication across API hooks (SKILL.md Rule 16).
 * Handles common patterns: loading state, error handling, retry, cancellation.
 */
export function useApiRequest<T>(
  request: () => Promise<T>,
  deps: unknown[],
  defaultErrorMessage: string,
  initialData?: T
): {
  data: T | null;
  loadState: ApiRequestState;
  errorMessage: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loadState, setLoadState] = useState<ApiRequestState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const refetch = useCallback(() => {
    setRetryTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setErrorMessage(null);

    const executeRequest = async () => {
      try {
        const result = await request();
        if (cancelled) return;
        setData(result);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : defaultErrorMessage;
        setErrorMessage(msg);
        setLoadState("error");
      }
    };

    executeRequest();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryTick]);

  return { data, loadState, errorMessage, refetch };
}