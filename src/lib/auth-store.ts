import { create } from "zustand";
import type { OperadorPerfil, PapelConta, PapelFuncional, EstadoUsuario } from "@/lib/papeis";

export interface User {
  uuid_publico: string;
  nome: string;
  email: string;
  telefone?: string | null;
  papel: PapelConta;
  /** Papel funcional do operador (secretaria, coordenador, dp, financeiro). Enviado pelo backend. */
  papel_funcional?: PapelFuncional | null;
  avatar_url?: string | null;
  estado: EstadoUsuario;
  email_verificado: boolean;
  ultimo_login?: string | null;
  is_staff?: boolean;
  operador?: OperadorPerfil | null;
  empresa?: {
    uuid_publico: string;
    nome: string;
    slug: string;
    tipo?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  access_token_expira_em: string;
  session_uuid: string;
  usuario: User;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true, isLoading: false }),
  setToken: (token) => set({ accessToken: token, isAuthenticated: true, isLoading: false }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
