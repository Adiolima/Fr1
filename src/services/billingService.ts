import api from "@/lib/api";

export interface Plano {
  uuid_publico: string;
  nome: string;
  classe: string;
  tier: string;
  descricao: string;
  preco_mensal_usd: number;
  preco_anual_usd: number;
  limite_contactos: number;
  limite_interacoes: number;
  limite_comunicados: number;
  historico_dias: number;
  trial_dias: number;
  tem_relatorios_mensais: boolean;
  tem_analytics_avancados: boolean;
  tem_dashboard_executivo: boolean;
  tem_suporte_email: boolean;
  tem_suporte_prioritario: boolean;
  tem_suporte_dedicado: boolean;
  ativo: boolean;
  destaque: boolean;
  destaque_label: string | null;
  ordem_exibicao: number;
}

export async function getPlanos(): Promise<Plano[]> {
  const { data } = await api.get("/billing/planos");
  return data.dados ?? data;
}
