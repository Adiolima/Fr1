import api from "@/lib/api";

/* ─── Tipos da API final do backend ─── */

export interface AssistenteInfoAPI {
  uuid_publico: string;
  nome: string;
  status: "trial" | "ativa" | "em_atraso" | "expirada";
  trial_termina_em?: string;
  trial_interacoes_restantes?: number;
  trial_comunicados_restantes?: number;
}

export interface PeriodoAPI {
  inicio: string;
  fim: string;
}

export interface TrAPI {
  valor: number;       // 0–100, já em percentagem
  total_interacoes: number;
  resolvidas: number;
  parciais: number;
  nao_resolvidas: number;
}

export interface TraAPI {
  valor: number;       // 0–100
  horas_poupadas: number;
}

export interface TdkAPI {
  variacao: number;    // positivo = TR desceu, negativo = TR melhorou
  alerta: boolean;     // true quando variacao > 10
}

export interface TrcAPI {
  valor: number;       // 0–100
}

export interface TrpItemAPI {
  perfil: "encarregado" | "aluno" | "professor" | "funcionario";
  tr_pct: number;
  total_interacoes: number;
}

export interface TciMemoriaAPI {
  memoria_id: number;
  titulo: string;
  total_interacoes: number;
  interacoes_resolvidas: number;
  contactos_unicos: number;
  relevancia_media: number;
  tci_pct: number;
  comunicado_enviados: number;
  comunicado_lidos: number;
  grupo_alvo_count: number;
}

export interface TciAPI {
  valor: number;           // % global (0–100)
  via_comunicado: number;  // % que leu comunicados
  via_assistente: number;  // % que perguntou e foi respondido
  memorias: TciMemoriaAPI[];
  ano: number;
  mes: number;
}

export interface SatisfacaoAPI {
  valor: number;       // 1.0–5.0
  total_avaliacoes: number;
}

export interface LacunaItemAPI {
  tipo_informacao: string;
  label: string;
  total_sem_resposta: number;
  ultima_pergunta_em: string;
  exemplos_perguntas: string[];
  urgencia: "alta" | "media" | "baixa";
}

export interface LacunasAPI {
  total_tipos: number;
  lista: LacunaItemAPI[];
}

export interface HistoricoTrItemAPI {
  mes: string;   // "YYYY-MM"
  tr: number;     // 0–100
}

/** Resposta completa da API */
export interface DashboardAssistenteAPI {
  assistente: AssistenteInfoAPI;
  periodo: PeriodoAPI;
  tr: TrAPI;
  tra: TraAPI;
  tdk: TdkAPI;
  trc: TrcAPI;
  trp: TrpItemAPI[];
  tci: TciAPI;
  satisfacao: SatisfacaoAPI;
  lacunas: LacunasAPI;
  historico_tr: HistoricoTrItemAPI[];
  mic: number[][];  // matriz 7×24 pronta
}

/* ─── Tipo legacy (mantido para compatibilidade com UI existente) ─── */

export interface DashboardAssistente extends DashboardAssistenteAPI {}

/* ─── Dashboard Principal (inalterado) ─── */

export interface DashboardPrincipal {
  periodo: "semana" | "mes" | "trimestre";
  utilizadores_activos: {
    total: number;
    encarregados: number;
    alunos: number;
    professores: number;
    outros: number;
    variacao_pct: number;
  };
  tr: { valor: number; variacao_pct: number; respondidas: number; encaminhadas: number };
  tci: { valor: number; variacao_pct: number; via_comunicado: number; via_assistente: number };
  tra: { valor: number; variacao_pct: number; horas_poupadas: number };
  satisfacao: { valor: number; variacao: number; total_avaliacoes: number };
  grafico_linha: Array<{ data: string; entregues: number; lidas: number; interacoes: number }>;
  distribuicao_tipo: Array<{ tipo: string; total: number; pct: number }>;
  top_perguntas: Array<{ tipo_informacao: string; label: string; total: number }>;
  alertas: Array<{ tipo: string; mensagem: string; prioridade: "alta" | "media" | "baixa"; criado_em: string }>;
  comunicados_recentes: Array<{
    nome: string; tipo: string; data: string;
    entregue_pct: number; lido_pct: number; tci_pct: number;
  }>;
  impacto: {
    perguntas_respondidas: number;
    atendimentos_evitados: number;
    horas_poupadas: number;
    interacoes_comunicados: number;
  };
}

/* ─── Funções ─── */

export async function getDashboardAssistente(
  uid: string,
  dias = 30,
  ano?: number,
  mes?: number,
): Promise<DashboardAssistenteAPI> {
  const now = new Date();
  const { data } = await api.get(`/assistentes/${uid}/dashboard`, {
    params: {
      dias,
      ano: ano ?? now.getFullYear(),
      mes: mes ?? (now.getMonth() + 1),
    },
  });
  return data.dados ?? data;
}

export async function getDashboardPrincipal(
  periodo: "semana" | "mes" | "trimestre" = "semana",
): Promise<DashboardPrincipal> {
  const { data } = await api.get("/dashboard/metricas/", { params: { periodo } });
  return data.dados ?? data;
}
