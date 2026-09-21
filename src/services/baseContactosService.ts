import api from "@/lib/api";

export interface BaseContacto {
  uuid_publico: string;
  nome: string;
  descricao?: string | null;
  tem_ensino_base: boolean;
  tem_ensino_medio: boolean;
  total_contactos?: number;
  total_alunos?: number;
  total_encarregados?: number;
  total_professores?: number;
  total_funcionarios?: number;
  criado_em?: string;
  atualizado_em?: string | null;
}

export interface CriarBaseCompletaPayload {
  nome: string;
  descricao?: string;
  tem_ensino_base: boolean;
  tem_ensino_medio: boolean;
  /** Só relevante quando tem_ensino_base = true */
  incluir_pre?: boolean;
  /** códigos do catálogo: ["manha", "tarde", "noite"] */
  turnos_ativos: string[];
  /** códigos/siglas do catálogo, ex: ["CFB", "HUM"]. Obrigatório ≥1 se tem_ensino_medio */
  cursos_selecionados?: string[];
}

export interface CriarBaseCompletaResposta {
  uuid_publico: string;
  turnos_ativos: number;
  classes_criadas: number;
  cursos_associados: number;
}

export interface AtualizarEstruturaPayload {
  tem_ensino_medio?: boolean;
  turnos_ativos?: string[];
  cursos_selecionados?: string[];
}

function unwrap<T>(data: any): T {
  return (data?.dados ?? data) as T;
}

// ─── Listagem / detalhe (mantém compatibilidade com backend) ───

export async function getBases(params?: {
  pagina?: number;
  por_pagina?: number;
  search?: string;
}): Promise<BaseContacto[]> {
  try {
    const { data } = await api.get("/bases/", { params });
    const v = unwrap<any>(data);
    return Array.isArray(v) ? v : (v?.resultados ?? v?.items ?? []);
  } catch {
    // fallback legado
    const { data } = await api.get("/base-contactos/", { params });
    const v = unwrap<any>(data);
    return Array.isArray(v) ? v : [];
  }
}

export async function getBase(uid: string): Promise<BaseContacto> {
  try {
    const { data } = await api.get(`/bases/${uid}`);
    return unwrap<BaseContacto>(data);
  } catch {
    const { data } = await api.get(`/base-contactos/${uid}`);
    return unwrap<BaseContacto>(data);
  }
}

// ─── 1. Onboarding — criação completa numa única chamada ───

export async function createBaseCompleta(
  payload: CriarBaseCompletaPayload,
): Promise<CriarBaseCompletaResposta> {
  const { data } = await api.post("/bases/completa", payload);
  return unwrap<CriarBaseCompletaResposta>(data);
}

// ─── 2. Editar dados básicos (nome/descrição/ensinos) ───

export async function updateBase(
  uid: string,
  payload: {
    nome?: string;
    descricao?: string;
    tem_ensino_base?: boolean;
    tem_ensino_medio?: boolean;
  },
): Promise<BaseContacto> {
  const { data } = await api.patch(`/bases/${uid}`, payload);
  return unwrap<BaseContacto>(data);
}

// ─── 3. Evoluir estrutura (turnos / ensino médio / cursos) ───

export async function updateEstruturaBase(
  uid: string,
  payload: AtualizarEstruturaPayload,
): Promise<BaseContacto> {
  const { data } = await api.patch(`/bases/${uid}/estrutura`, payload);
  return unwrap<BaseContacto>(data);
}

// ─── 4. Desactivar (lógica, com confirmação explícita) ───

export async function deleteBase(uid: string): Promise<void> {
  try {
    await api.delete(`/bases/${uid}`, { data: { confirmar: true } });
  } catch {
    // fallback legado (sem body)
    await api.delete(`/base-contactos/${uid}`);
  }
}

// ─── Leitura de estrutura da escola (dropdowns) ───

export interface BaseTurno {
  uuid_publico: string;
  nome: string;
  codigo?: string;
  ativo?: boolean;
}

export interface BaseClasse {
  uuid_publico: string;
  nome: string;
  nivel?: number;
  tipo_ensino?: "base" | "medio";
  ativo?: boolean;
}

export interface BaseCurso {
  uuid_publico: string;
  nome: string;
  sigla?: string;
  codigo?: string;
  descricao?: string;
  ativo?: boolean;
}

export async function getTurnosBase(baseUuid: string): Promise<BaseTurno[]> {
  const { data } = await api.get(`/bases/${baseUuid}/turnos`);
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.turnos ?? []);
}

export async function getClassesBase(baseUuid: string): Promise<BaseClasse[]> {
  const { data } = await api.get(`/bases/${baseUuid}/classes`);
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.classes ?? []);
}

export async function getCursosBase(baseUuid: string): Promise<BaseCurso[]> {
  const { data } = await api.get(`/bases/${baseUuid}/cursos`);
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.cursos ?? []);
}

export async function getEncarregadosTurma(
  baseUuid: string,
  turmaUuid: string,
): Promise<any[]> {
  const { data } = await api.get(
    `/bases/${baseUuid}/turmas/${turmaUuid}/encarregados`,
  );
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.encarregados ?? []);
}
