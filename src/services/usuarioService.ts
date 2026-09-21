import api from "@/lib/api";
import type { User } from "@/lib/auth-store";
import type { PapelFuncional, EstadoUsuario } from "@/lib/papeis";

// ─── Próprio ───

export async function getMe(): Promise<User> {
  const { data } = await api.get("/usuarios/me");
  return data.dados ?? data;
}

export async function updateMe(payload: {
  nome?: string;
  telefone?: string | null;
  avatar_url?: string | null;
}): Promise<User> {
  const { data } = await api.patch("/usuarios/me/", payload);
  return data.dados ?? data;
}

export async function changePassword(payload: {
  password_actual: string;
  nova_password: string;
}): Promise<void> {
  await api.post("/usuarios/me/change-password/", payload);
}

// ─── Admin: Listar Operadores ───

export interface UsuarioAdmin {
  uuid_publico: string;
  nome: string;
  email: string;
  telefone?: string | null;
  papel: "admin" | "operador";
  avatar_url?: string | null;
  estado: EstadoUsuario;
  email_verificado: boolean;
  ultimo_login?: string | null;
}

export interface Paginacao {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export async function listarUsuarios(params?: {
  pagina?: number;
  por_pagina?: number;
  apenas_activos?: boolean;
}): Promise<{ dados: UsuarioAdmin[]; paginacao: Paginacao }> {
  const { data } = await api.get("/usuarios/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function getUsuario(uid: string): Promise<UsuarioAdmin> {
  const { data } = await api.get(`/usuarios/${uid}`);
  return data.dados ?? data;
}

export async function updateUsuario(
  uid: string,
  payload: {
    nome?: string;
    email?: string;
    telefone?: string | null;
    avatar_url?: string | null;
    papel_funcional?: PapelFuncional;
  },
): Promise<UsuarioAdmin> {
  const { data } = await api.patch(`/usuarios/${uid}/`, payload);
  return data.dados ?? data;
}

export async function alterarEstadoUsuario(
  uid: string,
  estado: EstadoUsuario,
): Promise<void> {
  await api.patch(`/usuarios/${uid}/estado/`, { estado });
}

export async function criarConviteUsuario(payload: {
  email: string;
  papel_funcional: PapelFuncional;
  assistentes_uuids: string[];
}): Promise<{ uuid_publico: string; expira_em: string }> {
  const { data } = await api.post("/usuarios/", payload);
  return data.dados ?? data;
}
