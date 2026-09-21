"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, RefreshCw, Loader2, AlertTriangle,
  LayoutDashboard, Megaphone, BookOpen, FileText,
  BookUser, Radio, LayoutTemplate, Puzzle,
  Users, TrendingUp, CheckCircle2, Send, Star,
  ChevronDown, Download, Filter, Sparkles, Rocket,
  AlertCircle, Calendar as CalendarIcon,
  PanelLeftClose, PanelLeftOpen, Bot, Zap,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  getAssistente,
  type Assistente,
} from "@/services/assistenteService";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoSrc from "@/assets/logo.png";
import MemoriaTab from "@/components/assistente/MemoriaTab";
import { BaseContactosTab } from "@/components/assistente/BaseContactosTab";
import { getDashboardAssistente, type DashboardAssistente } from "@/services/dashboardService";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { StarRating } from "@/components/dashboard/StarRating";
import { TRPBars } from "@/components/dashboard/TRPBars";
import { TRCGauge } from "@/components/dashboard/TRCGauge";
import { MICHeatmap } from "@/components/dashboard/MICHeatmap";
import { ILKList } from "@/components/dashboard/ILKList";
import { TCIMemoriaTable } from "@/components/dashboard/TCIMemoriaTable";
import { CentroLacunas } from "@/components/dashboard/CentroLacunas";
import { DrawerLacunas } from "@/components/dashboard/DrawerLacunas";
import { MOCK_DASHBOARD_ASSISTENTE } from "@/lib/mock-dashboard";
import { useAuth } from "@/components/auth/auth-provider";
import { temPermissao, isAdmin, obterPermissoes, type PapelFuncional } from "@/lib/papeis";

/* ─── Constantes ─── */

const SIDEBAR_STORAGE_KEY = "merkron-assistente-sidebar-collapsed";

/* ─── Dados mockados ─── */

const lineData = [
  { dia: "Seg", mensagens: 142, respondidas: 138, encaminhadas: 4 },
  { dia: "Ter", mensagens: 168, respondidas: 162, encaminhadas: 6 },
  { dia: "Qua", mensagens: 155, respondidas: 149, encaminhadas: 6 },
  { dia: "Qui", mensagens: 187, respondidas: 180, encaminhadas: 7 },
  { dia: "Sex", mensagens: 173, respondidas: 166, encaminhadas: 7 },
  { dia: "Sáb", mensagens: 98, respondidas: 96, encaminhadas: 2 },
  { dia: "Dom", mensagens: 64, respondidas: 63, encaminhadas: 1 },
];

const pieData = [
  { name: "Pais/Encarregados", value: 520, color: "#3B82F6" },
  { name: "Alunos", value: 740, color: "#8B5CF6" },
  { name: "Professores", value: 98, color: "#6D28D9" },
  { name: "Outros", value: 72, color: "#64748B" },
];

const topPerguntas = [
  { label: "Propinas e Pagamentos", val: 342, pct: 100 },
  { label: "Horários de Aulas", val: 215, pct: 63 },
  { label: "Calendário Escolar", val: 178, pct: 52 },
  { label: "Faltas e Justificações", val: 144, pct: 42 },
  { label: "Reuniões e Eventos", val: 98, pct: 28 },
];

const atividadeTempoReal = [
  { name: "Aluno - 10ªA", msg: "Qual é a data da próxima prova de Matemática?", time: "agora", initial: "A", color: "bg-blue-500" },
  { name: "Pai - 6ºB", msg: "Como posso emitir a segunda via do boleto?", time: "1m", initial: "P", color: "bg-purple-500" },
  { name: "Professor - História", msg: "Enviou o comunicado: Trabalho de Pesquisa", time: "2m", initial: "P", color: "bg-emerald-500" },
  { name: "Aluno - 8ºC", msg: "Como justificar uma falta?", time: "3m", initial: "A", color: "bg-blue-500" },
];

const alertas = [
  { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", msg: "27 encarregados não receberam o último comunicado.", time: "Há 15 min" },
  { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", msg: "Taxa de leitura caiu 8% em relação à semana anterior.", time: "Há 1 hora" },
  { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", msg: "Aumento de 23% nas perguntas sobre propinas.", time: "Há 2 horas" },
  { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", msg: "Reunião de Pais ainda não lida por 53 encarregados.", time: "Há 3 horas" },
];

type Tab = "painel" | "comunicados" | "memoria" | "relatorio" | "base-contactos" | "actividade" | "templates" | "integracoes";

interface TabDef {
  key: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  /** Permissão necessária para ver esta aba (owner/admin têm acesso total) */
  permissao?: string;
  /** Papéis funcionais que podem ver esta aba (se vazio, todos com permissão) */
  papeisPermitidos?: PapelFuncional[];
}

const TABS: TabDef[] = [
  { key: "painel", label: "Painel", icon: LayoutDashboard },
  { key: "comunicados", label: "Comunicados", icon: Megaphone, permissao: "ver_comunicados" },
  { key: "memoria", label: "Memória", icon: BookOpen, permissao: "ver_memorias" },
  { key: "relatorio", label: "Relatório", icon: FileText, permissao: "ver_relatorios", papeisPermitidos: ["coordenador", "dp"] },
  { key: "base-contactos", label: "Base de Contactos", icon: BookUser, permissao: "ver_contactos" },
  { key: "actividade", label: "Actividade ao Vivo", icon: Radio, permissao: "ver_conversas" },
  { key: "templates", label: "Templates", icon: LayoutTemplate, permissao: "ver_templates" },
  { key: "integracoes", label: "Integrações", icon: Puzzle, permissao: "ver_assistente" },
];

export default function AssistenteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const uid = id ?? "";
  const { user } = useAuth();

  const [assistente, setAssistente] = useState<Assistente | null>(null);
  const [dashboard, setDashboard] = useState<DashboardAssistente>(MOCK_DASHBOARD_ASSISTENTE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("painel");

  // ── Filtragem de tabs por permissão ──
  const isAltoNivel = isAdmin(user);
  const papelFuncional = user?.operador?.papel_funcional ?? user?.papel_funcional;

  // DEBUG: diagnosticar permissões
  console.log("[DEBUG Assistente] user completo:", JSON.stringify(user, null, 2));
  console.log("[DEBUG Assistente] user.papel:", user?.papel);
  console.log("[DEBUG Assistente] user.papel_funcional:", user?.papel_funcional);
  console.log("[DEBUG Assistente] user.operador:", user?.operador);
  console.log("[DEBUG Assistente] papelFuncional (resolved):", papelFuncional);
  console.log("[DEBUG Assistente] isAltoNivel:", isAltoNivel);
  const permissoesDebug = obterPermissoes(user);
  console.log("[DEBUG Assistente] obterPermissoes():", permissoesDebug);
  console.log("[DEBUG Assistente] temPermissao(ver_comunicados):", temPermissao(user, "ver_comunicados"));
  console.log("[DEBUG Assistente] temPermissao(ver_contactos):", temPermissao(user, "ver_contactos"));

  const visibleTabs = TABS.filter((t) => {
    // Owner e Admin vêem todas as abas
    if (isAltoNivel) return true;
    // Verifica permissão
    if (t.permissao) {
      const temPerm = temPermissao(user, t.permissao);
      console.log(`[DEBUG] Tab "${t.key}" permissao="${t.permissao}" → temPermissao=${temPerm}`);
      if (!temPerm) return false;
    }
    // Verifica papéis funcionais permitidos (se definido)
    if (t.papeisPermitidos && t.papeisPermitidos.length > 0) {
      if (!papelFuncional || !t.papeisPermitidos.includes(papelFuncional)) {
        console.log(`[DEBUG] Tab "${t.key}" bloqueada por papeisPermitidos. papelFuncional=${papelFuncional}, permitidos=${t.papeisPermitidos.join(",")}`);
        return false;
      }
    }
    return true;
  });
  console.log("[DEBUG] visibleTabs:", visibleTabs.map((t) => t.key));

  // Se a tab atual não está visível, volta para "painel"
  useEffect(() => {
    if (!loading && !visibleTabs.find((t) => t.key === tab)) {
      setTab("painel");
    }
  }, [loading, visibleTabs, tab]);
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre">("semana");
  const [drawerLacunasAberto, setDrawerLacunasAberto] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"; } catch { return false; }
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, apiDash] = await Promise.all([
        getAssistente(uid),
        getDashboardAssistente(uid, 30).catch(() => null),
      ]);
      setAssistente(data);
      setDashboard(apiDash ?? MOCK_DASHBOARD_ASSISTENTE);
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.message || "Erro ao carregar assistente.");
      setDashboard(MOCK_DASHBOARD_ASSISTENTE);
      // Mock fallback: permite que a UI continue a renderizar mesmo sem a API,
      // mas sem base_contacto_uuid (a tab de base-contactos fica oculta).
      setAssistente({
        uuid_publico: uid,
        nome: "Assistente",
        nome_assistente: "",
        apresentacao: "",
        modelo_ia: "gpt-4o-mini",
        temperatura: 0.3,
        max_tokens_resposta: 800,
        horario_24h: true,
        horario_inicio: "07:00",
        horario_fim: "18:00",
        fora_horario_msg: "",
        modo_acesso: "restrito",
        ativo: false,
        conexao_status: "sem_conexao",
        conexao_numero: "",
        waba_tier: "",
        criado_em: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { if (uid) fetch(); }, [fetch, uid]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  };

  const SW = collapsed ? 68 : 232;
  const isOnline = assistente?.ativo && assistente?.conexao_status === "activa";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error && !assistente) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-gray-900">Erro ao carregar</p>
        <p className="text-xs text-gray-500 text-center">{error}</p>
        <Button onClick={fetch} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
        </Button>
      </div>
    );
  }

  if (!assistente) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4 bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Bot className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm text-gray-500">Assistente não encontrado ({uid}).</p>
        <Button onClick={() => router.push("/assistentes")} variant="outline" size="sm" className="gap-1.5 mt-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Assistentes
        </Button>
      </div>
    );
  }

  const d = dashboard;

  return (
    <div className="h-full flex">
      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside
        style={{
          width: SW, minWidth: SW,
          willChange: "width",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="h-full bg-white text-gray-900 flex flex-col border-r border-gray-200 shrink-0 overflow-hidden"
      >
        {/* Logo + Empresa */}
        <div
          className="flex items-center px-3 py-3 border-b border-gray-100 min-h-[52px]"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <img src={logoSrc.src} alt="Merkron" className="w-7 h-7 rounded-md object-contain shrink-0" />
          <div
            className="overflow-hidden"
            style={{
              maxWidth: collapsed ? 0 : 180, opacity: collapsed ? 0 : 1,
              transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
              transitionDelay: collapsed ? "0ms, 0ms" : "60ms, 60ms",
            }}
          >
            <div className="pl-2.5 whitespace-nowrap">
              <p className="font-bold text-gray-900 text-[14px] tracking-tight leading-tight">Merkron</p>
              <p className="text-[9px] text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold tracking-wide uppercase mt-0.5">
                Assistente Académico
              </p>
            </div>
          </div>
        </div>

        {/* Nome do assistente + status pulsante */}
        <div
          className="flex items-center px-3 py-3 border-b border-gray-100"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div
            className="overflow-hidden flex items-center flex-1"
            style={{
              maxWidth: collapsed ? 0 : 180, opacity: collapsed ? 0 : 1,
              transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
              transitionDelay: collapsed ? "0ms, 0ms" : "60ms, 60ms",
            }}
          >
            <div className="ml-2.5 min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{assistente.nome}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                </span>
                <span className="text-[10px] text-gray-400">{isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <UITooltip key={t.key} delayDuration={150} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center rounded-lg text-[13px] font-medium transition-all cursor-pointer overflow-hidden ${
                      active
                        ? "bg-purple-50 text-purple-600"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                    style={{
                      padding: "7px 10px",
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-purple-600" : ""}`} />
                    <div
                      className="overflow-hidden"
                      style={{
                        maxWidth: collapsed ? 0 : 160, opacity: collapsed ? 0 : 1,
                        transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                        transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                      }}
                    >
                      <span className="ml-3 whitespace-nowrap">{t.label}</span>
                    </div>
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={12} className="text-xs">
                    <p className="font-semibold">{t.label}</p>
                  </TooltipContent>
                )}
              </UITooltip>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2.5 border-t border-gray-100 space-y-1">
          {/* Voltar */}
          <UITooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push("/assistentes")}
                className="flex items-center w-full rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 overflow-hidden transition-all cursor-pointer"
                style={{ padding: "6px 8px", justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <ArrowLeft size={16} strokeWidth={1.8} className="shrink-0" />
                <div
                  className="overflow-hidden"
                  style={{
                    maxWidth: collapsed ? 0 : 160, opacity: collapsed ? 0 : 1,
                    transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                    transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                  }}
                >
                  <span className="ml-2.5 text-xs whitespace-nowrap">Voltar para Assistentes</span>
                </div>
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={12} className="text-xs">Voltar para Assistentes</TooltipContent>
            )}
          </UITooltip>

          {/* Colapsar */}
          <UITooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="flex items-center w-full rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 overflow-hidden transition-all cursor-pointer"
                style={{ padding: "6px 8px", justifyContent: collapsed ? "center" : "flex-start" }}
              >
                {collapsed
                  ? <PanelLeftOpen size={16} strokeWidth={1.8} className="shrink-0" />
                  : <PanelLeftClose size={16} strokeWidth={1.8} className="shrink-0" />
                }
                <div
                  className="overflow-hidden"
                  style={{
                    maxWidth: collapsed ? 0 : 160, opacity: collapsed ? 0 : 1,
                    transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                    transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                  }}
                >
                  <span className="ml-2.5 text-xs whitespace-nowrap">Recolher painel</span>
                </div>
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={12} className="text-xs">Expandir painel</TooltipContent>
            )}
          </UITooltip>
        </div>
      </aside>

      {/* ═══════════════ CONTEÚDO ═══════════════ */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {tab === "painel" && (
          <div className="p-4 max-w-[1600px] mx-auto space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 py-1">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Olá, Administrador! 👋</h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Panorama do assistente <span className="font-semibold text-gray-700">{assistente.nome}</span>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CentroLacunas
                  lacunas={d.lacunas}
                  onClick={() => setDrawerLacunasAberto(true)}
                />
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
                  className="h-8 text-xs border-gray-200 bg-white px-3 text-gray-600 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40">
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mês</option>
                  <option value="trimestre">Este trimestre</option>
                </select>
                <Button
                  variant="outline"
                  className="h-8 text-xs border-gray-200 bg-white px-3 text-gray-600"
                  onClick={fetch}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Trial Banner */}
            {d?.assistente?.status === "trial" && (
              <TrialBanner
                status="trial"
                trial_termina_em={d.assistente.trial_termina_em}
                trial_interacoes_restantes={d.assistente.trial_interacoes_restantes}
                trial_comunicados_restantes={d.assistente.trial_comunicados_restantes}
                onSubscribe={() => router.push("/planos")}
              />
            )}

            {/* ===================== NOVAS MÉTRICAS ===================== */}

            {/* Linha 1: Métricas principais (NOVO) */}
            <div className="grid grid-cols-5 gap-3">
              {[
                {
                  icon: CheckCircle2, label: "Taxa de Resolução",
                  value: d?.tr?.valor != null ? `${d.tr.valor.toFixed(1)}%` : "—",
                  pct: d?.tdk?.variacao != null ? `${d.tdk.variacao > 0 ? "↓" : "↑"} ${Math.abs(d.tdk.variacao).toFixed(1)} pp` : "",
                  desc: d?.tr ? `${d.tr.resolvidas} resolvidas · ${d.tr.parciais} parciais` : "",
                  color: d?.tr?.valor != null ? (d.tr.valor >= 85 ? "text-emerald-500" : d.tr.valor >= 70 ? "text-amber-500" : "text-red-500") : "text-purple-500",
                  bg: d?.tr?.valor != null ? (d.tr.valor >= 85 ? "bg-emerald-500/10" : d.tr.valor >= 70 ? "bg-amber-500/10" : "bg-red-500/10") : "bg-purple-500/10",
                  alerta: d?.tdk?.alerta ?? false,
                },
                {
                  icon: Zap, label: "Taxa de Resposta Autónoma",
                  value: d?.tra?.valor != null ? `${d.tra.valor.toFixed(1)}%` : "—",
                  pct: "", desc: d?.tra?.horas_poupadas != null ? `${d.tra.horas_poupadas.toFixed(0)}h poupadas este mês` : "",
                  color: "text-cyan-500", bg: "bg-cyan-500/10",
                },
                {
                  icon: Users, label: "Reciprocidade Comunicativa",
                  value: d?.trc?.valor != null ? `${d.trc.valor.toFixed(1)}%` : "—",
                  pct: "", desc: d?.trc?.valor != null ? (d.trc.valor >= 50 ? "Bidireccionalidade saudável" : d.trc.valor >= 25 ? "Comunicação moderada" : "Baixa reciprocidade") : "",
                  color: d?.trc?.valor != null ? (d.trc.valor >= 50 ? "text-emerald-500" : d.trc.valor >= 25 ? "text-amber-500" : "text-red-500") : "text-blue-500",
                  bg: d?.trc?.valor != null ? (d.trc.valor >= 50 ? "bg-emerald-500/10" : d.trc.valor >= 25 ? "bg-amber-500/10" : "bg-red-500/10") : "bg-blue-500/10",
                },
                {
                  icon: TrendingUp, label: "Controlo Informativo",
                  value: d?.tci?.valor != null ? `${d.tci.valor.toFixed(1)}%` : "—",
                  pct: "", desc: d?.tci ? `📨 ${d.tci.via_comunicado.toFixed(0)}% comunicados · 💬 ${d.tci.via_assistente.toFixed(0)}% assistente` : "",
                  color: "text-indigo-500", bg: "bg-indigo-500/10",
                },
                {
                  icon: Star, label: "Satisfação Geral",
                  value: d?.satisfacao?.valor != null ? `${d.satisfacao.valor.toFixed(1)}/5` : "—",
                  pct: "", desc: d?.satisfacao?.total_avaliacoes ? `${d.satisfacao.total_avaliacoes} avaliações` : "",
                  color: "text-amber-500", bg: "bg-amber-500/10", stars: true, starVal: d?.satisfacao?.valor ?? 0, starTotal: d?.satisfacao?.total_avaliacoes,
                },
              ].map((m: any, i) => (
                <Card key={i} className={`shadow-sm bg-white border-gray-100 ${m.alerta ? "border-amber-300" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-md ${m.bg}`}>
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                      <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wide">{periodo === "semana" ? "Esta semana" : periodo === "mes" ? "Este mês" : "Este trimestre"}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <h3 className="text-2xl font-bold leading-none text-gray-900">{m.value}</h3>
                      {m.pct && (
                        <span className={`text-[10px] font-medium flex items-center ${String(m.pct).startsWith("↑") ? "text-emerald-500" : String(m.pct).startsWith("↓") ? "text-red-400" : "text-emerald-500"}`}>
                          <TrendingUp className={`w-2.5 h-2.5 mr-0.5 ${String(m.pct).startsWith("↓") ? "rotate-180" : ""}`} />{m.pct}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-700 mb-2">{m.label}</p>
                    {m.stars ? (
                      <StarRating value={m.starVal} size="sm" />
                    ) : (
                      <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
                        {m.desc.split(" · ").map((d: string, j: number) => <span key={j}>{d}</span>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* TDK — Taxa de Degradação de Conhecimento */}
            <Card className={`shadow-sm border transition-colors ${
              d.tdk.alerta
                ? "border-red-200 bg-red-50/50"
                : d.tdk.variacao > 0
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-emerald-200 bg-emerald-50/50"
            }`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  d.tdk.alerta
                    ? "bg-red-500/10"
                    : d.tdk.variacao > 0
                      ? "bg-amber-500/10"
                      : "bg-emerald-500/10"
                }`}>
                  {d.tdk.alerta || d.tdk.variacao > 0 ? (
                    <AlertTriangle className={`w-5 h-5 ${d.tdk.alerta ? "text-red-500" : "text-amber-500"}`} />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Taxa de Degradação de Conhecimento (TDK)
                  </p>
                  <p className="text-xs text-gray-600">
                    {d.tdk.alerta
                      ? `A qualidade de resposta caiu ${d.tdk.variacao.toFixed(1)} pontos este mês.`
                      : d.tdk.variacao > 0
                        ? `Ligeira queda de ${d.tdk.variacao.toFixed(1)} pp — dentro do aceitável.`
                        : `Conhecimento estável — TR melhorou ${Math.abs(d.tdk.variacao).toFixed(1)} pp.`}
                  </p>
                </div>
                <Badge className={`text-xs px-2 py-1 border font-semibold ${
                  d.tdk.alerta
                    ? "bg-red-100 text-red-700 border-red-200"
                    : d.tdk.variacao > 0
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}>
                  {d.tdk.alerta
                    ? "🔴 Crítico"
                    : d.tdk.variacao > 0
                      ? "🟡 Atenção"
                      : "🟢 Estável"} — {d.tdk.variacao > 0 ? "↓" : "↑"} {Math.abs(d.tdk.variacao).toFixed(1)} pp
                </Badge>
              </CardContent>
            </Card>

            {/* ===================== CONTEÚDO ORIGINAL ===================== */}

            {/* Charts */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="col-span-2 shadow-sm bg-white border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                  <CardTitle className="text-sm font-semibold text-gray-900">Visão Geral de Mensagens</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 border border-gray-200 text-gray-500">
                    Últimos 7 dias <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#e5e7eb", borderRadius: "6px", fontSize: "11px" }} />
                        <Line type="monotone" dataKey="mensagens" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="respondidas" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="encaminhadas" stroke="#EC4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100">
                    {[
                      { color: "bg-purple-500", label: "Mensagens", val: "987", pct: "↑14%" },
                      { color: "bg-blue-500", label: "Respondidas", val: "95,8%", pct: "↑6,4%" },
                      { color: "bg-pink-500", label: "Encaminhadas", val: "4,2%", pct: "↓2,1%" },
                    ].map((m, i) => (
                      <div key={i}>
                        <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.color}`} /> {m.label}
                        </p>
                        <p className="text-sm font-bold text-gray-900">{m.val} <span className="text-[9px] font-medium text-emerald-500">{m.pct}</span></p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-white border-gray-100">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-semibold text-gray-900">Distribuição por Perfil</CardTitle>
                </CardHeader>
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="h-[160px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#e5e7eb", borderRadius: "6px", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-gray-400">Total alcançados</span>
                      <span className="text-base font-bold text-gray-900">1.030</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-1">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-[9px] text-gray-400 leading-tight truncate">{item.name}</p>
                          <p className="text-[10px] font-semibold text-gray-900">{item.value} <span className="font-normal text-gray-400">{((item.value / 1030) * 100).toFixed(1)}%</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    Alertas Inteligentes
                    <span className="bg-red-100 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold">4</span>
                  </CardTitle>
                  <a href="#" className="text-[10px] text-purple-600 font-medium hover:underline">Ver todos</a>
                </CardHeader>
                <CardContent className="p-3 flex-1">
                  <div className="space-y-2.5 mt-1">
                    {alertas.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 group cursor-pointer">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${alert.bg}`}>
                          <alert.icon className={`w-3.5 h-3.5 ${alert.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-700 leading-snug group-hover:text-purple-600 transition-colors">{alert.msg}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{alert.time}</p>
                        </div>
                        <ChevronDown className="w-3 h-3 text-gray-300 -rotate-90 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom: 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-900">Top Perguntas (Esta semana)</CardTitle>
                  <a href="#" className="text-[10px] text-purple-600 font-medium hover:underline">Ver todas</a>
                </CardHeader>
                <CardContent className="p-3 pt-1 flex-1 flex flex-col">
                  <div className="space-y-2.5 flex-1">
                    {topPerguntas.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-700">{item.label}</span>
                          <span className="text-xs text-gray-400 font-semibold">{item.val}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: item.pct + "%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">Total de Perguntas</span>
                    <span className="text-sm font-bold text-gray-900">1.030</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Actividade ao Vivo
                  </CardTitle>
                  <a href="#" className="text-[10px] text-purple-600 font-medium hover:underline">Ver todas</a>
                </CardHeader>
                <CardContent className="p-3 pt-1 flex-1">
                  <div className="space-y-2">
                    {atividadeTempoReal.map((chat, i) => (
                      <div key={i} className="flex gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${chat.color}`}>
                          {chat.initial}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[10px] font-bold text-gray-700 truncate">{chat.name}</span>
                            <span className="text-[9px] text-gray-400 shrink-0 ml-1">{chat.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{chat.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-gradient-to-br from-purple-50 via-white to-violet-50 border-purple-200 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Rocket className="w-24 h-24 text-purple-600" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 relative z-10">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Impacto Gerado Esta Semana
                  </CardTitle>
                  <a href="#" className="text-[10px] text-purple-600 font-medium hover:underline">Ver tudo</a>
                </CardHeader>
                <CardContent className="p-3 pt-1 flex-1 flex flex-col relative z-10">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {[
                      { val: "987", color: "text-purple-600", label: "Mensagens respondidas pela IA" },
                      { val: "520", color: "text-cyan-500", label: "Atendimentos resolvidos" },
                      { val: "89,3%", color: "text-emerald-500", label: "Taxa de controlo" },
                      { val: "1.030", color: "text-blue-600", label: "Utilizadores alcançados" },
                    ].map((m, j) => (
                      <div key={j} className="bg-white/80 backdrop-blur-sm border border-gray-200 p-2 rounded-lg">
                        <h4 className={`text-lg font-bold mb-0.5 ${m.color}`}>{m.val}</h4>
                        <span className="text-[9px] text-gray-500 font-medium leading-tight block">{m.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-700 py-1.5 px-2 rounded-lg flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] font-semibold">Redução de 38% na carga de trabalho da secretaria</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela */}
            <div className="pb-4">
              <Card className="shadow-sm bg-white border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-gray-100">
                  <CardTitle className="text-sm font-semibold text-gray-900">Comunicações Recentes</CardTitle>
                  <a href="#" className="text-[10px] text-purple-600 font-medium hover:underline">Ver todos</a>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-gray-400 bg-gray-50/50 uppercase border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 font-medium">Contacto</th>
                        <th className="px-3 py-2 font-medium">Tipo</th>
                        <th className="px-3 py-2 font-medium">Mensagem</th>
                        <th className="px-3 py-2 font-medium">Data</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { nome: "Maria Santos", tipo: "Encarregada", msg: "Qual o valor da propina do 2º trimestre?", data: "Hoje, 14:32", status: "Respondida" },
                        { nome: "João Pedro", tipo: "Aluno", msg: "Quando começa o período de exames?", data: "Hoje, 14:15", status: "Respondida" },
                        { nome: "Prof. Carlos", tipo: "Professor", msg: "Preciso enviar comunicado urgente à turma 10ªB", data: "Hoje, 13:48", status: "Pendente" },
                        { nome: "Ana Costa", tipo: "Encarregada", msg: "O meu filho faltou, como justificar?", data: "Hoje, 12:10", status: "Respondida" },
                        { nome: "Pedro Lopes", tipo: "Aluno", msg: "Qual o horário da aula de reposição?", data: "Hoje, 11:05", status: "Respondida" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-gray-900">{row.nome}</td>
                          <td className="px-3 py-2.5 text-gray-500">{row.tipo}</td>
                          <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate">{row.msg}</td>
                          <td className="px-3 py-2.5 text-gray-400">{row.data}</td>
                          <td className="px-3 py-2.5">
                            <Badge className={`text-[9px] h-4 px-1.5 font-normal border ${
                              row.status === "Respondida" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}>{row.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* ===================== NOVAS SECÇÕES DE MÉTRICAS ===================== */}

            {/* ═══════════ INDICADORES DE COMUNICAÇÃO ═══════════ */}

            {/* TRP — Taxa de Resolução por Perfil */}
            <TRPBars trp={d.trp} />

            {/* TRC + TR Histórica lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <TRCGauge value={d.trc.valor} />
              {d.historico_tr && d.historico_tr.length > 0 && (
                <Card className="shadow-sm bg-white border-gray-100">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      TR Histórica (últimos 6 meses)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d.historico_tr} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} dy={8} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#e5e7eb", borderRadius: "6px", fontSize: "11px" }} formatter={(val: number) => [`${val.toFixed(1)}%`, "TR"]} />
                          <Line type="monotone" dataKey="tr" name="TR" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3, fill: "#8B5CF6" }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* MIC — Mapa de Intensidade Comunicativa */}
            <MICHeatmap data={d.mic} />

            {/* ILK — Índice de Lacunas de Conhecimento */}
            <ILKList lacunas={d.lacunas.lista} />

            {/* TCI — Barra dupla empilhada */}
            <Card className="shadow-sm bg-white border-gray-100">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Taxa de Controlo Informativo (TCI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl font-bold text-indigo-600">{d.tci.valor.toFixed(1)}%</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden flex">
                      <div
                        className="bg-purple-500 h-full transition-all duration-700 flex items-center justify-center text-[9px] text-white font-bold"
                        style={{ width: `${Math.min(d.tci.via_comunicado, 100)}%`, minWidth: d.tci.via_comunicado > 5 ? "32px" : "0" }}
                      >
                        {d.tci.via_comunicado > 5 ? `${d.tci.via_comunicado.toFixed(0)}%` : ""}
                      </div>
                      <div
                        className="bg-teal-500 h-full transition-all duration-700 flex items-center justify-center text-[9px] text-white font-bold"
                        style={{ width: `${Math.min(d.tci.via_assistente, 100)}%`, minWidth: d.tci.via_assistente > 5 ? "32px" : "0" }}
                      >
                        {d.tci.via_assistente > 5 ? `${d.tci.via_assistente.toFixed(0)}%` : ""}
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0" />
                        Via Comunicado
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 shrink-0" />
                        Via Assistente
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TCI por Memória */}
            <TCIMemoriaTable memorias={d.tci.memorias} />
          </div>
        )}

        {tab === "memoria" && <MemoriaTab assistenteUid={uid} />}

        {tab === "base-contactos" &&
          assistente?.base_contacto_uuid && (
            <BaseContactosTab baseUid={assistente.base_contacto_uuid} />
          )}

        {tab === "base-contactos" && !assistente?.base_contacto_uuid && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <BookUser className="w-7 h-7 opacity-40" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Sem base de contactos</p>
            <p className="text-xs text-gray-400">Este assistente ainda não tem uma base de contactos associada.</p>
          </div>
        )}

        {tab !== "painel" &&
          tab !== "memoria" &&
          tab !== "base-contactos" && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                {(() => { const t = visibleTabs.find((t) => t.key === tab); const Icon = t?.icon ?? LayoutDashboard; return <Icon className="w-7 h-7 opacity-40" />; })()}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{visibleTabs.find((t) => t.key === tab)?.label ?? tab}</p>
              <p className="text-xs text-gray-400">Em breve.</p>
            </div>
          )}
      </main>

      {/* Drawer de Lacunas */}
      <DrawerLacunas
        aberto={drawerLacunasAberto}
        onFechar={() => setDrawerLacunasAberto(false)}
        lacunas={d.lacunas.lista}
        assistenteUid={uid}
      />
    </div>
  );
}
