import api from "@/lib/api";

export interface Contacto {
  uuid_publico: string;
  nome: string;
  telefone: string;
  tipo: "aluno" | "professor" | "encarregado" | "funcionario";
  autorizado: boolean;
  opt_out: boolean;
  opt_out_em?: string | null;
  ultimo_envio_em?: string | null;
  criado_em: string;
  atualizado_em?: string | null;
}

export interface Paginacao {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface CriarContactoPayload {
  nome: string;
  telefone: string;
  tipo: string;
  autorizado?: boolean;
}

export interface EditarContactoPayload {
  nome?: string;
  telefone?: string;
  tipo?: string;
  autorizado?: boolean;
}

export async function getContactos(
  baseUid: string,
  params?: {
    pagina?: number;
    por_pagina?: number;
    tipo?: string;
    autorizado?: boolean;
    opt_out?: boolean;
    search?: string;
  },
): Promise<{ dados: Contacto[]; paginacao: Paginacao }> {
  const { data } = await api.get(`/base-contactos/${baseUid}/contactos/`, { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function getContacto(baseUid: string, uid: string): Promise<Contacto> {
  const { data } = await api.get(`/base-contactos/${baseUid}/contactos/${uid}`);
  return data.dados ?? data;
}

export async function createContacto(baseUid: string, payload: CriarContactoPayload): Promise<Contacto> {
  const { data } = await api.post(`/base-contactos/${baseUid}/contactos/`, payload);
  return data.dados ?? data;
}

export async function updateContacto(
  baseUid: string,
  uid: string,
  payload: EditarContactoPayload,
): Promise<Contacto> {
  const { data } = await api.patch(`/base-contactos/${baseUid}/contactos/${uid}/`, payload);
  return data.dados ?? data;
}

export async function deleteContacto(baseUid: string, uid: string): Promise<void> {
  await api.delete(`/base-contactos/${baseUid}/contactos/${uid}`);
}

// ─── Import CSV ───

export interface ImportResult {
  total: number;
  criados: number;
  ignorados: number;
  erros: Array<{ linha: number; motivo: string }>;
}

export async function importContactosCSV(baseUid: string, file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("ficheiro", file);
  const { data } = await api.post(`/base-contactos/${baseUid}/contactos/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.dados ?? data;
}

// ─── Vista Completa ───

export interface ContactoAlunoDetalhe {
  contacto: Contacto;
  escolar: {
    uuid_publico: string;
    turma_id: number;
    turma_nome: string;
    classe_id: number;
    classe_nome: string;
    classe_nivel: number;
    curso_id: number | null;
    curso_nome: string | null;
    curso_sigla: string | null;
    tipo_ensino: "base" | "medio";
    numero_processo: string;
    abreviacao: string;
    estado: string;
  } | null;
  encarregados: {
    contacto_uuid: string;
    contacto_nome: string;
    contacto_telefone: string;
    parentesco: string;
    responsavel_financeiro: boolean;
    responsavel_principal: boolean;
  }[];
}

export interface ContactoEncarregadoDetalhe {
  contacto: Contacto;
  alunos: {
    aluno_uuid: string;
    aluno_nome: string;
    turma_nome: string;
    classe_nome: string;
    classe_nivel: number;
    curso_nome: string | null;
    tipo_ensino: string;
    estado: string;
    parentesco: string;
  }[];
}

export async function getContactoAluno(baseUid: string, uid: string): Promise<ContactoAlunoDetalhe> {
  const { data } = await api.get(`/base-contactos/${baseUid}/contactos/${uid}/aluno`);
  return data.dados ?? data;
}

export async function getContactoEncarregado(baseUid: string, uid: string): Promise<ContactoEncarregadoDetalhe> {
  const { data } = await api.get(`/base-contactos/${baseUid}/contactos/${uid}/encarregado`);
  return data.dados ?? data;
}
