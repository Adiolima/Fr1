import api from "@/lib/api";

/* ─── Tipos ─── */

export interface ConexaoWhatsApp {
  uuid_publico: string;
  provider: string;
  status: string;
  numero_telefone: string | null;
  perfil_nome: string | null;
  falhas_recentes: number;
  ultimo_erro: string | null;
  criado_em: string;
}

export interface Waba {
  waba_id: string;
  tier: string;
  qualidade: string | null;
  conversas_bi_hoje: number;
}

export interface Assistente {
  uuid_publico: string;
  assistente_id?: number;
  base_contacto_uuid?: string;
  nome: string;
  nome_assistente?: string;
  apresentacao?: string;
  modelo_ia: string;
  temperatura: number;
  max_tokens_resposta: number;
  horario_24h?: boolean;
  horario_inicio: string;
  horario_fim: string;
  fora_horario_msg: string;
  modo_acesso: "restrito" | "aberto";
  status?: string;
  ativo: boolean;
  conexao_status: string;
  conexao_numero: string;
  waba_tier: string;
  criado_em: string;
  conexao?: ConexaoWhatsApp;
  waba?: Waba;
}

export interface AssistenteListParams {
  pagina?: number;
  por_pagina?: number;
  apenas_ativos?: boolean;
}

export interface Paginacao {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface AssistenteListResponse {
  sucesso: boolean;
  dados: Assistente[];
  paginacao: Paginacao;
}

export interface AssistenteCreatePayload {
  nome: string;
  nome_assistente: string;
  apresentacao: string;
  horario_24h: boolean;
  horario_inicio?: string;
  horario_fim?: string;
  modo_acesso: "restrito" | "aberto";
}

export interface AssistenteCreateResponse {
  uuid_publico: string;
  assistente_id: number;
  status: string;
}

export interface AssistenteBaseCreatePayload {
  nome: string; nome_assistente: string; apresentacao: string; horario_24h: boolean; horario_inicio?: string; horario_fim?: string; modo_acesso: "restrito" | "aberto"; base_nome: string; base_descricao?: string; tem_ensino_base: boolean; tem_ensino_medio: boolean; incluir_pre?: boolean; turnos_ativos: string[]; cursos_selecionados: string[];
}

export interface AssistenteBaseCreateResponse {
  assistente_uuid: string; base_uuid: string; status: string; proximo_passo: string; turnos_ativos: number; classes_criadas: number; cursos_associados: number;
}

/* ─── Funções ─── */

export async function getAssistentes(
  params?: AssistenteListParams,
): Promise<AssistenteListResponse> {
  const { data } = await api.get("/assistentes/", { params });
  return data;
}

export async function createAssistente(
  payload: AssistenteCreatePayload,
): Promise<AssistenteCreateResponse> {
  const { data } = await api.post("/assistentes/", payload);
  return data.dados ?? data;
}

export async function getAssistente(uid: string): Promise<Assistente> {
  const { data } = await api.get(`/assistentes/${uid}`);
  return data.dados ?? data;
}

export async function criarAssistenteEBase(payload: AssistenteBaseCreatePayload): Promise<AssistenteBaseCreateResponse> {
  const { data } = await api.post("/assistentes/completo", payload);
  return data.dados ?? data;
}
