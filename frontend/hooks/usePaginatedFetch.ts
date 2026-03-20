import { PaginationMeta } from "@/services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function usePaginatedFetch<T>(
  fetchFn: () => Promise<{ data: T[]; meta: PaginationMeta }>,
  deps: unknown[],
  options: { role: string | null; errorMessage?: string }
) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!options.role) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return fetchFn();
      })
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setMeta(res.meta);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error(options.errorMessage ?? "Falha ao carregar dados");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.role, ...deps]);

  return { data, setData, meta, setMeta, loading };
}