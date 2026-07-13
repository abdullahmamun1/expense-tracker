const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

export const authApi = {
  signup: (email: string, password: string) =>
    apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch("/api/auth/me"),
};

export const walletsApi = {
  list: () => apiFetch("/api/wallets"),
  create: (data: { name: string; type: string; startingBalance: string }) =>
    apiFetch("/api/wallets", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch(`/api/wallets/${id}`),
  update: (id: string, data: Partial<{ name: string; type: string; startingBalance: string }>) =>
    apiFetch(`/api/wallets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/api/wallets/${id}`, { method: "DELETE" }),
};

export const categoriesApi = {
  list: () => apiFetch("/api/categories"),
  create: (data: { name: string; type: string; color: string }) =>
    apiFetch("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch(`/api/categories/${id}`),
  update: (id: string, data: Partial<{ name: string; type: string; color: string }>) =>
    apiFetch(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
};

type TransactionData = {
  walletId: string;
  categoryId: string;
  amount: string;
  occurredAt: string;
  note?: string;
};

export const transactionsApi = {
  list: (filters?: { walletId?: string; categoryId?: string; from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (filters?.walletId) params.set("walletId", filters.walletId);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    return apiFetch(`/api/transactions${qs ? `?${qs}` : ""}`);
  },
  create: (data: TransactionData) =>
    apiFetch("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch(`/api/transactions/${id}`),
  update: (id: string, data: Partial<TransactionData>) =>
    apiFetch(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/api/transactions/${id}`, { method: "DELETE" }),
  suggestCategory: (note: string) =>
    apiFetch(`/api/transactions/suggest-category?note=${encodeURIComponent(note)}`),
};
