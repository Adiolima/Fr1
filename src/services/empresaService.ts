import api from "@/lib/api";

export interface Empresa {
  uuid_publico: string;
  nome: string;
  slug: string;
  email: string;
  telefone?: string | null;
  nif?: string | null;
  estado: "ativo" | "suspenso" | "inativo";
  verificado: boolean;
}

export async function getMinhaEmpresa(): Promise<Empresa> {
  const { data } = await api.get("/empresas/me");
  return data.dados ?? data;
}

export async function updateMinhaEmpresa(payload: {
  nome?: string;
  email?: string;
  telefone?: string;
  nif?: string;
}): Promise<Empresa> {
  const { data } = await api.patch("/empresas/me/", payload);
  return data.dados ?? data;
}
