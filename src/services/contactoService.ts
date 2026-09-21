import api from "@/lib/api";

export interface BaseContactoSimples {
  uuid_publico: string;
  nome: string;
}

export async function getBasesContacto(): Promise<BaseContactoSimples[]> {
  const { data } = await api.get("/base-contactos");
  return data.dados ?? data;
}
