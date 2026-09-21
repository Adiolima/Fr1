import api from "@/lib/api";

function unwrap<T>(data: any): T {
  return (data?.dados ?? data) as T;
}

// ─── Catálogos fixos Merkron (nunca criar via UI) ───

export interface CatalogoTurno {
  codigo: string; // "manha" | "tarde" | "noite"
  nome: string; // "Manhã" | "Tarde" | "Noite"
}

export interface CatalogoCurso {
  uuid_publico: string;
  codigo: string;
  sigla?: string;
  nome: string;
  descricao?: string;
}

export async function getCatalogoTurnos(): Promise<CatalogoTurno[]> {
  const { data } = await api.get("/catalogos/turnos");
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.turnos ?? []);
}

export async function getCatalogoCursos(): Promise<CatalogoCurso[]> {
  const { data } = await api.get("/catalogos/cursos");
  const v = unwrap<any>(data);
  const arr = Array.isArray(v) ? v : (v?.cursos ?? []);
  return arr.map((c: any) => ({ uuid_publico: c.uuid_publico ?? "", codigo: c.sigla ?? c.codigo ?? c.uuid_publico ?? "", sigla: c.sigla, nome: c.nome, descricao: c.descricao }));
}

// ─── Turmas ───

export interface Turma {
  uuid_publico: string;
  nome: string;
  classe_uuid?: string;
  classe_nome?: string | null;
  classe_nivel?: number | null;
  tipo_ensino?: string;
  turno_uuid?: string;
  turno_nome?: string | null;
  curso_uuid?: string | null;
  curso_nome?: string | null;
  curso_sigla?: string | null;
  ativo?: boolean;
  criado_em?: string;
  atualizado_em?: string;
  // contagem de alunos activos (opcional — devolvida pelo backend)
  total_alunos?: number;
  // compat legada
  classe_id?: number;
  turno_id?: number;
  curso_id?: number | null;
}

export async function getTurmas(baseUuid: string): Promise<Turma[]> {
  const { data } = await api.get(`/bases/${baseUuid}/turmas`);
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.turmas ?? []);
}

export async function createTurma(
  baseUuid: string,
  payload: {
    nome: string;
    classe_uuid: string;
    turno_uuid: string;
    curso_uuid?: string | null;
  },
): Promise<Turma> {
  const { data } = await api.post(`/bases/${baseUuid}/turmas`, payload);
  return unwrap<Turma>(data);
}

export async function updateTurma(
  baseUuid: string,
  turmaUuid: string,
  payload: {
    nome?: string;
    turno_uuid?: string;
    curso_uuid?: string | null;
    ativo?: boolean;
  },
): Promise<Turma> {
  const { data } = await api.patch(
    `/bases/${baseUuid}/turmas/${turmaUuid}`,
    payload,
  );
  return unwrap<Turma>(data);
}

export async function deleteTurma(
  baseUuid: string,
  turmaUuid: string,
): Promise<void> {
  await api.delete(`/bases/${baseUuid}/turmas/${turmaUuid}`);
}

// ─── Encarregados ───

export async function createEncarregado(
  baseUuid: string,
  payload: { nome: string; telefone: string },
): Promise<{ uuid_publico: string }> {
  const { data } = await api.post(`/bases/${baseUuid}/encarregados`, payload);
  return unwrap<{ uuid_publico: string }>(data);
}

export async function updateEncarregado(
  baseUuid: string,
  uuid: string,
  payload: { nome?: string; estado?: "activo" | "inactivo" },
): Promise<void> {
  await api.patch(`/bases/${baseUuid}/encarregados/${uuid}`, payload);
}

export async function deleteEncarregado(
  baseUuid: string,
  uuid: string,
): Promise<{ alunos_associados_activos: number }> {
  const { data } = await api.delete(
    `/bases/${baseUuid}/encarregados/${uuid}`,
  );
  return unwrap<{ alunos_associados_activos: number }>(data);
}

// ─── Funcionários ───

export async function createFuncionario(
  baseUuid: string,
  payload: {
    nome: string;
    telefone: string;
    cargo?: string;
    departamento?: string;
  },
): Promise<{ uuid_publico: string }> {
  const { data } = await api.post(`/bases/${baseUuid}/funcionarios`, payload);
  return unwrap<{ uuid_publico: string }>(data);
}

export async function updateFuncionario(
  baseUuid: string,
  uuid: string,
  payload: {
    nome?: string;
    cargo?: string;
    departamento?: string;
    estado?: string;
  },
): Promise<void> {
  await api.patch(`/bases/${baseUuid}/funcionarios/${uuid}`, payload);
}

export async function deleteFuncionario(
  baseUuid: string,
  uuid: string,
): Promise<void> {
  await api.delete(`/bases/${baseUuid}/funcionarios/${uuid}`);
}

// ─── Alunos ───

export interface CriarAlunoPayload {
  nome: string;
  telefone?: string;
  turma_uuid: string;
  numero_processo?: string;
}

export async function createAluno(
  baseUuid: string,
  payload: CriarAlunoPayload,
): Promise<{ uuid_publico: string }> {
  const { data } = await api.post(`/bases/${baseUuid}/alunos`, payload);
  return unwrap<{ uuid_publico: string }>(data);
}

export interface CriarAlunoComEncarregadoPayload {
  nome_aluno: string;
  telefone_aluno?: string;
  turma_uuid: string;
  numero_processo?: string;
  nome_encarregado: string;
  telefone_encarregado: string;
  parentesco?: string;
  responsavel_financeiro?: boolean;
  responsavel_principal?: boolean;
}

export interface CriarAlunoComEncarregadoResposta {
  uuid_publico_aluno: string;
  uuid_publico_encarregado: string;
  encarregado_reutilizado: boolean;
}

export async function createAlunoComEncarregado(
  baseUuid: string,
  payload: CriarAlunoComEncarregadoPayload,
): Promise<CriarAlunoComEncarregadoResposta> {
  const { data } = await api.post(
    `/bases/${baseUuid}/alunos-com-encarregado`,
    payload,
  );
  return unwrap<CriarAlunoComEncarregadoResposta>(data);
}

export async function vincularEncarregadoAluno(
  baseUuid: string,
  alunoUuid: string,
  payload: {
    contacto_uuid: string;
    parentesco?: string;
    responsavel_financeiro?: boolean;
    responsavel_principal?: boolean;
  },
): Promise<void> {
  await api.post(
    `/bases/${baseUuid}/alunos/${alunoUuid}/encarregados`,
    payload,
  );
}

export async function setTelefoneAluno(
  baseUuid: string,
  alunoUuid: string,
  telefone: string,
): Promise<void> {
  await api.patch(`/bases/${baseUuid}/alunos/${alunoUuid}/telefone`, {
    telefone,
  });
}

export async function removeTelefoneAluno(
  baseUuid: string,
  alunoUuid: string,
): Promise<void> {
  await api.delete(`/bases/${baseUuid}/alunos/${alunoUuid}/telefone`);
}

export async function updateAluno(
  baseUuid: string,
  alunoUuid: string,
  payload: {
    nome?: string;
    turma_uuid?: string;
    numero_processo?: string;
    estado?: string;
  },
): Promise<void> {
  await api.patch(`/bases/${baseUuid}/alunos/${alunoUuid}`, payload);
}

export async function deleteAluno(
  baseUuid: string,
  alunoUuid: string,
  novo_estado: "inactivo" | "transferido" | "concluido",
): Promise<void> {
  await api.delete(`/bases/${baseUuid}/alunos/${alunoUuid}`, {
    data: { novo_estado },
  });
}

// ─── Professores ───

export async function createProfessor(
  baseUuid: string,
  payload: { nome: string; telefone: string },
): Promise<{ uuid_publico: string; professor_codigo: string }> {
  const { data } = await api.post(`/bases/${baseUuid}/professores`, payload);
  return unwrap<{ uuid_publico: string; professor_codigo: string }>(data);
}

export async function updateProfessor(
  baseUuid: string,
  contactoUuid: string,
  payload: { estado: "activo" | "rejeitado" },
): Promise<void> {
  await api.patch(
    `/bases/${baseUuid}/professores/${contactoUuid}`,
    payload,
  );
}

export async function deleteProfessor(
  baseUuid: string,
  contactoUuid: string,
): Promise<void> {
  await api.delete(`/bases/${baseUuid}/professores/${contactoUuid}`);
}

// ─── Listagem de contactos por papel ───

export interface ContactoResumo {
  uuid_publico: string;
  papel: "aluno" | "encarregado" | "funcionario" | "professor";
  estado: string;
  autorizado: boolean;
}

export async function getContactosPorPapel(
  baseUuid: string,
  papel?: "aluno" | "encarregado" | "funcionario" | "professor",
): Promise<ContactoResumo[]> {
  const { data } = await api.get(`/bases/${baseUuid}/contactos`, {
    params: papel ? { papel } : undefined,
  });
  const v = unwrap<any>(data);
  return Array.isArray(v) ? v : (v?.contactos ?? []);
}

// ─── Importação em massa (JSON já processado pelo frontend) ───

export type TipoImportacao = "aluno" | "encarregado" | "funcionario" | "professor";

export interface ImportarContactosPayload {
  tipo: TipoImportacao;
  turma_uuid?: string;
  contactos: Record<string, string>[];
}

export interface ImportarContactosResposta {
  total: number;
  criados: number;
  reutilizados: number;
  erros: { linha: number; nome: string; telefone: string; motivo: string }[];
}

export const LIMITE_IMPORTACAO = 50;

export async function importarContactos(
  baseUuid: string,
  payload: ImportarContactosPayload,
): Promise<ImportarContactosResposta> {
  const { data } = await api.post(
    `/bases/${baseUuid}/contactos/importar`,
    payload,
  );
  return unwrap<ImportarContactosResposta>(data);
}
