import api from "@/lib/api";

/* ─── Tipos ─── */

export type MemoriaTipo = "institucional" | "academica" | "faq" | "comunicado" | "documento";

export interface Memoria {
  uuid_publico: string;
  assistente_academico_id: number;
  tipo: MemoriaTipo;
  titulo: string;
  conteudo?: string;
  resumo: string;
  origem: string;
  ativo: boolean;
  valido_de: string;
  valido_ate: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface MemoriaListParams {
  assistente_id: string;
  tipo?: MemoriaTipo;
  ativo?: boolean;
  pagina?: number;
  por_pagina?: number;
}

export interface Paginacao {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface MemoriaListResponse {
  sucesso: boolean;
  dados: Memoria[];
  paginacao: Paginacao;
}

export interface MemoriaCreatePayload {
  assistente_uid: string;
  tipo: MemoriaTipo;
  titulo: string;
  conteudo: string;
  resumo?: string;
  valido_de?: string;
  valido_ate?: string | null;
  ativo?: boolean;
}

export interface MemoriaUpdatePayload {
  tipo?: MemoriaTipo;
  titulo?: string;
  conteudo?: string;
  resumo?: string;
  valido_de?: string;
  valido_ate?: string | null;
  ativo?: boolean;
}

export interface MemoriaResponse {
  sucesso: boolean;
  dados: Memoria;
  mensagem?: string;
}

export interface MemoriaDeleteResponse {
  sucesso: boolean;
  mensagem: string;
  dados: { uuid_publico: string; apagada: boolean };
}

export interface DocumentoUploadResponse {
  sucesso: boolean;
  dados: {
    memoria_uuid: string;
    documento_uuid: string;
    nome_ficheiro: string;
    tamanho: number;
    status: string;
  };
  mensagem: string;
}

export interface DocumentoDownloadResponse {
  sucesso: boolean;
  dados: {
    uuid_publico: string;
    nome_ficheiro: string;
    tamanho: number;
    mime_type: string;
    url_download: string;
    criado_em: string;
  };
}

export interface AtualizarAssistenteResponse {
  sucesso: boolean;
  dados: {
    cache_invalidada: boolean;
    memorias_activas: number;
    timestamp: string;
  };
  mensagem: string;
}

/* ─── Funções ─── */

export async function getMemorias(
  params: MemoriaListParams,
): Promise<MemoriaListResponse> {
  const { data } = await api.get("/memorias/", { params });
  return data;
}

export async function getMemoria(uid: string): Promise<MemoriaResponse> {
  const { data } = await api.get(`/memorias/${uid}`);
  return data;
}

export async function createMemoria(
  payload: MemoriaCreatePayload,
): Promise<MemoriaResponse> {
  const { data } = await api.post("/memorias/", payload);
  return data;
}

export async function updateMemoria(
  uid: string,
  payload: MemoriaUpdatePayload,
): Promise<MemoriaResponse> {
  const { data } = await api.patch(`/memorias/${uid}/`, payload);
  return data;
}

export async function deleteMemoria(
  uid: string,
): Promise<MemoriaDeleteResponse> {
  const { data } = await api.delete(`/memorias/${uid}`);
  return data;
}

export async function actualizarAssistente(
  assistenteUid: string,
): Promise<AtualizarAssistenteResponse> {
  const { data } = await api.put(
    `/memorias/actualizar-assistente/${assistenteUid}/`,
  );
  return data;
}

export async function uploadDocumento(
  assistenteUid: string,
  file: File,
): Promise<DocumentoUploadResponse> {
  const form = new FormData();
  form.append("assistente_uid", assistenteUid);
  form.append("ficheiro", file);
  const { data } = await api.post("/memorias/documentos", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadDocumento(
  documentoUid: string,
): Promise<DocumentoDownloadResponse> {
  const { data } = await api.get(`/memorias/documentos/${documentoUid}`);
  return data;
}
