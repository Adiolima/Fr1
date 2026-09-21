import api from "@/lib/api";
import type { User } from "@/lib/auth-store";

export interface AdminLoginResponse {
  access_token: string;
  access_token_expira_em: string;
  session_uuid: string;
  usuario: User & { is_staff: true };
  empresa: {
    uuid_publico: string;
    nome: string;
    tipo: "interno";
  };
}

export async function loginStaff(email: string, password: string): Promise<AdminLoginResponse> {
  const { data } = await api.post("/admin/auth/login", { email, password });
  return data.dados ?? data;
}

export async function criarStaff(payload: {
  email: string;
  nome: string;
  password: string;
}): Promise<{ uuid_publico: string; email: string; nome: string; empresa_tipo: "interno" }> {
  const { data } = await api.post("/admin/staff/", payload);
  return data.dados ?? data;
}
