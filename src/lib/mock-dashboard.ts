import type { DashboardAssistente } from "@/services/dashboardService";

/* ─── MIC: matriz 7×24 simulada ─── */

const MIC_MOCK: number[][] = [
  // Segunda
  [0,0,0,0,0,0,2,15,45,32,18,12,8,5,10,22,38,28,15,8,4,2,0,0],
  // Terça
  [0,0,0,0,0,0,3,18,52,38,22,15,10,7,12,25,42,35,20,10,5,2,0,0],
  // Quarta
  [0,0,0,0,0,0,1,12,40,35,20,14,9,6,8,18,32,25,12,6,3,1,0,0],
  // Quinta
  [0,0,0,0,0,0,2,20,48,42,25,18,12,8,15,28,45,38,22,12,6,3,0,0],
  // Sexta
  [0,0,0,0,0,0,4,22,55,40,28,20,14,10,18,30,48,40,25,15,8,4,0,0],
  // Sábado
  [0,0,0,0,0,0,0,1,8,15,12,8,5,3,4,8,12,8,4,2,1,0,0,0],
  // Domingo
  [0,0,0,0,0,0,0,0,2,5,3,2,1,1,1,2,3,2,1,0,0,0,0,0],
];

/* ─── Mock ─── */

export const MOCK_DASHBOARD_ASSISTENTE: DashboardAssistente = {
  assistente: {
    uuid_publico: "mock-uuid",
    nome: "Assistente Académico",
    status: "trial",
    trial_termina_em: new Date(Date.now() + 3 * 86400000).toISOString(),
    trial_interacoes_restantes: 8,
    trial_comunicados_restantes: 12,
  },

  periodo: {
    inicio: "2026-07-11",
    fim: "2026-08-10",
  },

  tr: {
    valor: 87.3,
    total_interacoes: 3421,
    resolvidas: 3158,
    parciais: 263,
    nao_resolvidas: 278,
  },

  tra: {
    valor: 64.2,
    horas_poupadas: 127.4,
  },

  tdk: {
    variacao: 4.8,   // positivo = TR desceu
    alerta: false,    // false porque variacao < 10
  },

  trc: {
    valor: 42.7,
  },

  trp: [
    { perfil: "encarregado", tr_pct: 94.2, total_interacoes: 2810 },
    { perfil: "professor",  tr_pct: 87.6, total_interacoes: 342 },
    { perfil: "aluno",      tr_pct: 71.3, total_interacoes: 210 },
    { perfil: "funcionario", tr_pct: 68.9, total_interacoes: 59 },
  ],

  tci: {
    valor: 87.3,
    via_comunicado: 71.2,
    via_assistente: 16.1,
    memorias: [
      { memoria_id: 1, titulo: "Provas 1º Trimestre 2026", total_interacoes: 85, interacoes_resolvidas: 72, contactos_unicos: 45, relevancia_media: 0.88, tci_pct: 87.3, comunicado_enviados: 3, comunicado_lidos: 120, grupo_alvo_count: 200 },
      { memoria_id: 2, titulo: "Horários 2026 — Turmas Manhã e Tarde", total_interacoes: 62, interacoes_resolvidas: 58, contactos_unicos: 38, relevancia_media: 0.94, tci_pct: 94.6, comunicado_enviados: 2, comunicado_lidos: 95, grupo_alvo_count: 150 },
      { memoria_id: 3, titulo: "Valor das Propinas 2º Trimestre", total_interacoes: 110, interacoes_resolvidas: 85, contactos_unicos: 72, relevancia_media: 0.77, tci_pct: 77.4, comunicado_enviados: 4, comunicado_lidos: 200, grupo_alvo_count: 350 },
      { memoria_id: 4, titulo: "Reunião de Pais — 10ª Classe", total_interacoes: 48, interacoes_resolvidas: 35, contactos_unicos: 30, relevancia_media: 0.71, tci_pct: 71.3, comunicado_enviados: 1, comunicado_lidos: 52, grupo_alvo_count: 80 },
      { memoria_id: 5, titulo: "Calendário Escolar 2026", total_interacoes: 95, interacoes_resolvidas: 91, contactos_unicos: 60, relevancia_media: 0.96, tci_pct: 96.5, comunicado_enviados: 2, comunicado_lidos: 140, grupo_alvo_count: 180 },
      { memoria_id: 6, titulo: "Regulamento Interno — Faltas", total_interacoes: 72, interacoes_resolvidas: 41, contactos_unicos: 55, relevancia_media: 0.62, tci_pct: 56.9, comunicado_enviados: 2, comunicado_lidos: 88, grupo_alvo_count: 320 },
      { memoria_id: 7, titulo: "Material Escolar — Lista por Classe", total_interacoes: 38, interacoes_resolvidas: 12, contactos_unicos: 28, relevancia_media: 0.35, tci_pct: 31.6, comunicado_enviados: 1, comunicado_lidos: 45, grupo_alvo_count: 250 },
      { memoria_id: 8, titulo: "Inscrições para Exames Nacionais", total_interacoes: 56, interacoes_resolvidas: 10, contactos_unicos: 40, relevancia_media: 0.22, tci_pct: 17.9, comunicado_enviados: 1, comunicado_lidos: 30, grupo_alvo_count: 100 },
    ],
    ano: 2026,
    mes: 8,
  },

  satisfacao: {
    valor: 4.3,
    total_avaliacoes: 1248,
  },

  lacunas: {
    total_tipos: 5,
    lista: [
      {
        tipo_informacao: "propinas",
        label: "Propinas e Pagamentos",
        total_sem_resposta: 47,
        ultima_pergunta_em: new Date(Date.now() - 12 * 60000).toISOString(),
        exemplos_perguntas: [
          "Qual o valor da propina do 8ºA?",
          "Quando vence a propina de Julho?",
          "Aceita pagamento por Multicaixa?",
        ],
        urgencia: "alta",
      },
      {
        tipo_informacao: "transporte",
        label: "Transporte Escolar",
        total_sem_resposta: 23,
        ultima_pergunta_em: new Date(Date.now() - 45 * 60000).toISOString(),
        exemplos_perguntas: [
          "Há transporte escolar disponível?",
          "Qual é o percurso do autocarro?",
          "Quanto custa o transporte?",
        ],
        urgencia: "alta",
      },
      {
        tipo_informacao: "actividades",
        label: "Actividades Extracurriculares",
        total_sem_resposta: 12,
        ultima_pergunta_em: new Date(Date.now() - 120 * 60000).toISOString(),
        exemplos_perguntas: [
          "Que desportos a escola oferece?",
          "Há aulas de música?",
        ],
        urgencia: "media",
      },
      {
        tipo_informacao: "cantina",
        label: "Cantina e Refeições",
        total_sem_resposta: 8,
        ultima_pergunta_em: new Date(Date.now() - 180 * 60000).toISOString(),
        exemplos_perguntas: [
          "Qual é a ementa desta semana?",
          "Como faço para comprar senhas?",
        ],
        urgencia: "media",
      },
      {
        tipo_informacao: "uniforme",
        label: "Uniforme Escolar",
        total_sem_resposta: 3,
        ultima_pergunta_em: new Date(Date.now() - 360 * 60000).toISOString(),
        exemplos_perguntas: [
          "Onde posso comprar o uniforme?",
        ],
        urgencia: "baixa",
      },
    ],
  },

  historico_tr: [
    { mes: "2026-03", tr: 88.2 },
    { mes: "2026-04", tr: 90.1 },
    { mes: "2026-05", tr: 91.4 },
    { mes: "2026-06", tr: 89.7 },
    { mes: "2026-07", tr: 91.8 },
    { mes: "2026-08", tr: 87.3 },
  ],

  mic: MIC_MOCK,
};
