import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function getAdminToken(): string | null {
  return sessionStorage.getItem("admin_token");
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// --- Query keys ---
export const getListGamesQueryKey = () => ["/api/games"] as const;
export const getListServersQueryKey = () => ["/api/servers"] as const;
export const getListFaqsQueryKey = () => ["/api/faqs"] as const;
export const getGetSiteSettingsQueryKey = () => ["/api/settings"] as const;

// --- Types ---
export interface Game {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  link: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

export interface PrivateServer {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  link: string;
  game: string;
  is_active: boolean;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  tiktok_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  announcement: string | null;
}

// --- Games ---
export function useListGames() {
  return useQuery({ queryKey: getListGamesQueryKey(), queryFn: () => apiFetch<Game[]>("/api/games") });
}

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Omit<Game, "id" | "created_at"> }) =>
      apiFetch<Game>("/api/games", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListGamesQueryKey() }),
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Game, "id" | "created_at">> }) =>
      apiFetch<Game>(`/api/games/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListGamesQueryKey() }),
  });
}

export function useDeleteGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/games/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListGamesQueryKey() }),
  });
}

// --- Servers ---
export function useListServers() {
  return useQuery({ queryKey: getListServersQueryKey(), queryFn: () => apiFetch<PrivateServer[]>("/api/servers") });
}

export function useCreateServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Omit<PrivateServer, "id" | "created_at"> }) =>
      apiFetch<PrivateServer>("/api/servers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListServersQueryKey() }),
  });
}

export function useUpdateServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<PrivateServer, "id" | "created_at">> }) =>
      apiFetch<PrivateServer>(`/api/servers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListServersQueryKey() }),
  });
}

export function useDeleteServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/servers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListServersQueryKey() }),
  });
}

// --- FAQs ---
export function useListFaqs() {
  return useQuery({ queryKey: getListFaqsQueryKey(), queryFn: () => apiFetch<Faq[]>("/api/faqs") });
}

export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Omit<Faq, "id" | "created_at"> }) =>
      apiFetch<Faq>("/api/faqs", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListFaqsQueryKey() }),
  });
}

export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Faq, "id" | "created_at">> }) =>
      apiFetch<Faq>(`/api/faqs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListFaqsQueryKey() }),
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/faqs/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getListFaqsQueryKey() }),
  });
}

// --- Settings ---
export function useGetSiteSettings() {
  return useQuery({ queryKey: getGetSiteSettingsQueryKey(), queryFn: () => apiFetch<SiteSettings>("/api/settings") });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Omit<SiteSettings, "id">> }) =>
      apiFetch<SiteSettings>("/api/settings", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() }),
  });
}

// --- Auth ---
export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ data }: { data: { password: string } }) =>
      apiFetch<{ success: boolean; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useAdminLogout() {
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
  });
}
