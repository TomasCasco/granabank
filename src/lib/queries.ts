import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import type { MovementDTO, MovementType, ProfileDTO } from "@/lib/types";

export function useProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<ProfileDTO>("/api/me"),
  });
}

export function useMovements(filters: { type?: MovementType; q?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.q) params.set("q", filters.q);
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["movements", filters],
    queryFn: () => apiFetch<MovementDTO[]>(`/api/movements?${params}`),
    // Keep the previous results on screen while a new search loads instead of flashing a skeleton.
    placeholderData: (previous) => previous,
  });
}

export function useMovement(id: string) {
  return useQuery({
    queryKey: ["movement", id],
    queryFn: () => apiFetch<MovementDTO>(`/api/movements/${encodeURIComponent(id)}`),
  });
}
