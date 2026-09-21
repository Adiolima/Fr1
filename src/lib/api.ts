// API, api.ts
import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";

const BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,
  timeout: 10000,
});

// ── Request interceptor ──
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.log(
    `[Axios] ${config.method?.toUpperCase()} ${fullUrl}`,
    token ? `✅ Token: ${token.slice(0, 20)}...` : "❌ SEM TOKEN"
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Fila de refresh ──
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueItem[] = [];

function processQueue(token: string | null, error: unknown = null) {
  refreshQueue.forEach((item) => {
    if (token) item.resolve(token);
    else item.reject(error);
  });
  refreshQueue = [];
}

// ── Refresh via fetch nativo (mais fiável para cookies HttpOnly) ──
async function doRefresh(): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const codigo = body?.codigo ?? body?.erro?.codigo ?? "UNKNOWN";
      throw new Error(codigo);
    }

    const data = await res.json();
    const token: string = data?.dados?.access_token ?? data?.access_token ?? "";
    const usuario = data?.dados?.usuario ?? data?.usuario;

    if (!token) throw new Error("Sem access_token na resposta do refresh");

    if (usuario) {
      useAuthStore.getState().setAuth(token, usuario);
    } else {
      useAuthStore.getState().setToken(token);
    }

    return token;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Response interceptor ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    if (originalRequest.url?.includes("/auth/")) return Promise.reject(error);
    if (error.response?.status !== 401) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);

    const codigo = error.response?.data?.codigo;

    // Só TOKEN_REVOGADO força logout imediato
    if (codigo === "TOKEN_REVOGADO") {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // Já há um refresh em curso → entrar na fila
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    // Iniciar refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const newToken = await doRefresh();
      processQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(null, refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
