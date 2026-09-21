import api from "@/lib/api";

// ─── Tipos ───

export interface Curso {
  uuid_publico: string;
  nome: string;
  sigla: string;
  descricao?: string;
  ativo: boolean;
}

export interface Classe {
  uuid_publico: string;
  nome: string;
  nivel: number;
  tipo_ensino: "base" | "medio";
  ativo: boolean;
}

export interface Turno {
  uuid_publico: string;
  nome: string;
  ativo: boolean;
}

export interface Turma {
  uuid_publico: string;
  nome: string;
  classe_id: number;
  classe_nome: string | null;
  classe_nivel: number | null;
  turno_id: number;
  turno_nome: string | null;
  tipo_ensino: string;
  curso_id: number | null;
  curso_nome: string | null;
  curso_sigla: string | null;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Aluno {
  uuid_publico: string;
  contacto_uid?: string;
  contacto_nome?: string;
  turma_uid?: string;
  turma_nome?: string;
  classe_uid?: string;
  classe_nome?: string;
  tipo_ensino: "base" | "medio";
  curso_uid?: string;
  curso_nome?: string;
  numero_processo?: string;
  abreviacao?: string;
  estado: "activo" | "inactivo" | "transferido" | "concluido";
  criado_em: string;
}

export interface Encarregado {
  id: number;
  contacto_uuid: string;
  contacto_nome?: string;
  contacto_telefone?: string;
  parentesco: string;
  responsavel_principal: boolean;
  responsavel_financeiro: boolean;
  criado_em: string;
}

export interface Paginacao {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// ─── Cursos ───

export async function getCursos(params: {
  base_contacto_uid: string;
  pagina?: number;
  por_pagina?: number;
  ativo?: boolean;
}): Promise<{ dados: Curso[]; paginacao: Paginacao }> {
  const { data } = await api.get("/estrutura-escolar/cursos/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function createCurso(payload: {
  base_contacto_uid: string;
  nome: string;
  sigla: string;
  descricao?: string;
  ativo?: boolean;
}): Promise<Curso> {
  const { data } = await api.post("/estrutura-escolar/cursos/", payload);
  return data.dados ?? data;
}

export async function getCurso(uid: string): Promise<Curso> {
  const { data } = await api.get(`/estrutura-escolar/cursos/${uid}`);
  return data.dados ?? data;
}

export async function updateCurso(
  uid: string,
  payload: { nome?: string; sigla?: string; descricao?: string; ativo?: boolean },
): Promise<Curso> {
  const { data } = await api.patch(`/estrutura-escolar/cursos/${uid}/`, payload);
  return data.dados ?? data;
}

// ─── Classes ───

export async function getClasses(params: {
  base_contacto_uid: string;
  pagina?: number;
  por_pagina?: number;
  tipo_ensino?: "base" | "medio";
  ativo?: boolean;
}): Promise<{ dados: Classe[]; paginacao: Paginacao }> {
  const { data } = await api.get("/estrutura-escolar/classes/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function createClasse(payload: {
  base_contacto_uid: string;
  nivel: number;
  nome: string;
  tipo_ensino: "base" | "medio";
  ativo?: boolean;
}): Promise<Classe> {
  const { data } = await api.post("/estrutura-escolar/classes/", payload);
  return data.dados ?? data;
}

export async function getClasse(uid: string): Promise<Classe> {
  const { data } = await api.get(`/estrutura-escolar/classes/${uid}`);
  return data.dados ?? data;
}

export async function updateClasse(
  uid: string,
  payload: { nome?: string; nivel?: number; tipo_ensino?: "base" | "medio"; ativo?: boolean },
): Promise<Classe> {
  const { data } = await api.patch(`/estrutura-escolar/classes/${uid}/`, payload);
  return data.dados ?? data;
}

// ─── Turnos ───

export async function getTurnos(params: {
  base_contacto_uid: string;
  pagina?: number;
  por_pagina?: number;
  ativo?: boolean;
}): Promise<{ dados: Turno[]; paginacao: Paginacao }> {
  const { data } = await api.get("/estrutura-escolar/turnos/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function createTurno(payload: {
  base_contacto_uid: string;
  nome: string;
  ativo?: boolean;
}): Promise<Turno> {
  const { data } = await api.post("/estrutura-escolar/turnos/", payload);
  return data.dados ?? data;
}

export async function getTurno(uid: string): Promise<Turno> {
  const { data } = await api.get(`/estrutura-escolar/turnos/${uid}`);
  return data.dados ?? data;
}

export async function updateTurno(
  uid: string,
  payload: { nome?: string; ativo?: boolean },
): Promise<Turno> {
  const { data } = await api.patch(`/estrutura-escolar/turnos/${uid}/`, payload);
  return data.dados ?? data;
}

// ─── Turmas ───

export async function getTurmas(params: {
  base_contacto_uid: string;
  pagina?: number;
  por_pagina?: number;
  classe_id?: number;
  turno_id?: number;
  curso_id?: number;
  ativo?: boolean;
}): Promise<{ dados: Turma[]; paginacao: Paginacao }> {
  const { data } = await api.get("/estrutura-escolar/turmas/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function createTurma(payload: {
  base_contacto_uid: string;
  nome: string;
  classe_uid: string;
  turno_uid: string;
  tipo_ensino: "base" | "medio";
  curso_uid?: string;
  ativo?: boolean;
}): Promise<Turma> {
  const { data } = await api.post("/estrutura-escolar/turmas/", payload);
  return data.dados ?? data;
}

export async function getTurma(uid: string): Promise<Turma> {
  const { data } = await api.get(`/estrutura-escolar/turmas/${uid}`);
  return data.dados ?? data;
}

export async function updateTurma(
  uid: string,
  payload: { nome?: string; classe_uid?: string; turno_uid?: string; tipo_ensino?: "base" | "medio"; curso_uid?: string; ativo?: boolean },
): Promise<Turma> {
  const { data } = await api.patch(`/estrutura-escolar/turmas/${uid}/`, payload);
  return data.dados ?? data;
}

export async function deleteTurma(uid: string): Promise<void> {
  await api.delete(`/estrutura-escolar/turmas/${uid}`);
}

// ─── Alunos ───

export async function getAlunos(params: {
  base_contacto_uid: string;
  paginah?: number;
  por_pagina?: number;
  turma_id?: number;
  classe_id?: number;
  curso_id?: number;
  tipo_ensino?: "base" | "medio";
  estado?: string;
}): Promise<{ dados: Aluno[]; paginacao: Paginacao }> {
  const { data } = await api.get("/estrutura-escolar/alunos/", { params });
  return { dados: data.dados ?? data, paginacao: data.paginacao };
}

export async function createAluno(payload: {
  base_contacto_uid: string;
  turma_uid: string;
  classe_uid: string;
  tipo_ensino: "base" | "medio";
  curso_uid?: string;
  contacto_uid?: string;
  numero_processo?: string;
  abreviacao?: string;
  estado?: string;
}): Promise<Aluno> {
  const { data } = await api.post("/estrutura-escolar/alunos/", payload);
  return data.dados ?? data;
}

export async function createAlunoCompleto(payload: {
  base_contacto_uid: string;
  nome: string;
  telefone: string;
  turma_uid: string;
  classe_uid: string;
  tipo_ensino: "base" | "medio";
  curso_uid?: string | null;
  numero_processo?: string;
  abreviacao?: string;
  estado?: string;
  encarregados?: {
    nome: string;
    telefone: string;
    parentesco?: string;
    responsavel_financeiro?: boolean;
    responsavel_principal?: boolean;
  }[];
}): Promise<{ aluno: Aluno; encarregados: any[] }> {
  const { data } = await api.post("/estrutura-escolar/alunos/completo", payload);
  return data.dados ?? data;
}

export async function getAluno(uid: string): Promise<Aluno> {
  const { data } = await api.get(`/estrutura-escolar/alunos/${uid}`);
  return data.dados ?? data;
}

export async function updateAluno(
  uid: string,
  payload: {
    turma_uid?: string;
    classe_uid?: string;
    tipo_ensino?: "base" | "medio";
    curso_uid?: string;
    contacto_uid?: string;
    numero_processo?: string;
    abreviacao?: string;
    estado?: string;
  },
): Promise<Aluno> {
  const { data } = await api.patch(`/estrutura-escolar/alunos/${uid}/`, payload);
  return data.dados ?? data;
}

// ─── Encarregados ───

export async function getEncarregados(alunoUid: string): Promise<Encarregado[]> {
  const { data } = await api.get(`/estrutura-escolar/alunos/${alunoUid}/encarregados`);
  return data.dados ?? data;
}

export async function vincularEncarregado(
  alunoUid: string,
  payload: {
    contacto_uid: string;
    parentesco?: string;
    responsavel_principal?: boolean;
    responsavel_financeiro?: boolean;
  },
): Promise<Encarregado> {
  const { data } = await api.post(`/estrutura-escolar/alunos/${alunoUid}/encarregados/`, payload);
  return data.dados ?? data;
}

export async function desvincularEncarregado(alunoUid: string, encarregadoId: number): Promise<void> {
  await api.delete(`/estrutura-escolar/alunos/${alunoUid}/encarregados/${encarregadoId}`);
}
