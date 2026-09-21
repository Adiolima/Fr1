import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  LayoutTemplate, Plus, Search, Filter, CheckCircle2, Clock, XCircle,
  AlertTriangle, ChevronDown, X, Smartphone, Eye, Copy, Trash2, Edit2,
  MoreHorizontal, MessageSquare, ShieldCheck, Megaphone, Wrench,
  Image, Video, FileText, AlignLeft, Link2, Phone, MousePointerClick,
  Sparkles, Info, Globe, Star, BarChart2, Send, RefreshCw, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Types ─────────────────────────────────────────────────── */
type Category = "Marketing" | "Utilidade" | "Autenticação";
type Status = "Aprovado" | "Pendente" | "Rejeitado" | "Pausado";
type HeaderType = "none" | "text" | "image" | "video" | "document";
type ButtonType = "quick_reply" | "url" | "phone";

interface TemplateButton {
  type: ButtonType;
  text: string;
  value?: string;
}

interface Template {
  id: number;
  name: string;
  category: Category;
  status: Status;
  language: string;
  headerType: HeaderType;
  headerContent?: string;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
  quality: number;
  lastEdited: string;
  sentCount: number;
  readRate: number;
}

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK: Template[] = [
  {
    id: 1,
    name: "aviso_reuniao_pais",
    category: "Utilidade",
    status: "Aprovado",
    language: "pt_PT",
    headerType: "text",
    headerContent: "📅 Reunião de Pais",
    body: "Olá, {{1}}!\n\nA reunião de pais do *{{2}}* está agendada para *{{3}}* às *{{4}}*.\n\nLocal: {{5}}",
    footer: "Merkron — Sistema Escolar",
    buttons: [
      { type: "quick_reply", text: "Confirmar presença" },
      { type: "quick_reply", text: "Não posso comparecer" },
    ],
    quality: 95,
    lastEdited: "03 Jun, 2025",
    sentCount: 2847,
    readRate: 91.2,
  },
  {
    id: 2,
    name: "lembrete_propinas",
    category: "Utilidade",
    status: "Aprovado",
    language: "pt_PT",
    headerType: "none",
    body: "Caro/a Encarregado/a de Educação,\n\nInformamos que a propina referente ao mês de *{{1}}* no valor de *{{2}} €* se encontra por liquidar.\n\nData limite: *{{3}}*.",
    footer: "Para dúvidas contacte a secretaria.",
    buttons: [
      { type: "url", text: "Pagar online", value: "https://escola.pt/pagamento" },
      { type: "phone", text: "Ligar à secretaria", value: "+351220000000" },
    ],
    quality: 88,
    lastEdited: "01 Jun, 2025",
    sentCount: 1523,
    readRate: 87.4,
  },
  {
    id: 3,
    name: "promocao_atividades_extra",
    category: "Marketing",
    status: "Aprovado",
    language: "pt_PT",
    headerType: "image",
    headerContent: "Atividades Extracurriculares 2025",
    body: "Olá, {{1}}! 🎉\n\nAs inscrições para as *atividades extracurriculares* de {{2}} já estão abertas!\n\nVagas limitadas — garanta já o lugar do seu educando.",
    footer: "Vagas esgotam rapidamente.",
    buttons: [
      { type: "url", text: "Ver atividades", value: "https://escola.pt/atividades" },
      { type: "quick_reply", text: "Quero saber mais" },
    ],
    quality: 76,
    lastEdited: "28 Mai, 2025",
    sentCount: 3102,
    readRate: 82.0,
  },
  {
    id: 4,
    name: "codigo_verificacao_portal",
    category: "Autenticação",
    status: "Aprovado",
    language: "pt_PT",
    headerType: "none",
    body: "O seu código de verificação para o Portal Escolar é:\n\n*{{1}}*\n\nO código expira em 10 minutos. Não o partilhe com ninguém.",
    buttons: [
      { type: "url", text: "Abrir Portal", value: "https://portal.escola.pt" },
    ],
    quality: 99,
    lastEdited: "25 Mai, 2025",
    sentCount: 8941,
    readRate: 99.1,
  },
  {
    id: 5,
    name: "boletim_notas_disponivel",
    category: "Utilidade",
    status: "Pendente",
    language: "pt_PT",
    headerType: "document",
    body: "Olá, {{1}}!\n\nO boletim de notas do *{{2}}* referente ao *{{3}}* já está disponível para consulta.",
    footer: "Merkron — Portal Escolar",
    buttons: [
      { type: "url", text: "Ver boletim", value: "https://portal.escola.pt/notas" },
    ],
    quality: 0,
    lastEdited: "05 Jun, 2025",
    sentCount: 0,
    readRate: 0,
  },
  {
    id: 6,
    name: "falta_injustificada_aluno",
    category: "Utilidade",
    status: "Rejeitado",
    language: "pt_PT",
    headerType: "text",
    headerContent: "⚠️ Falta Registada",
    body: "Caro/a Encarregado/a,\n\nInformamos que o/a aluno/a *{{1}}* registou uma falta injustificada no dia *{{2}}* na disciplina de *{{3}}*.\n\nQueira justificar no prazo de 3 dias úteis.",
    buttons: [
      { type: "url", text: "Justificar falta", value: "https://portal.escola.pt/faltas" },
      { type: "quick_reply", text: "Já justifiquei" },
    ],
    quality: 0,
    lastEdited: "22 Mai, 2025",
    sentCount: 0,
    readRate: 0,
  },
];

const CATEGORY_CONFIG: Record<Category, { icon: React.ElementType; color: string; bg: string; desc: string }> = {
  Marketing:    { icon: Megaphone,    color: "text-amber-500",   bg: "bg-amber-500/10",   desc: "Promoções e notícias" },
  Utilidade:    { icon: Wrench,       color: "text-blue-500",    bg: "bg-blue-500/10",    desc: "Transações e avisos" },
  Autenticação: { icon: ShieldCheck,  color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Códigos de acesso" },
};

const STATUS_CONFIG: Record<Status, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  Aprovado:  { icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Aprovado" },
  Pendente:  { icon: Clock,          color: "text-amber-600",   bg: "bg-amber-500/10",   label: "Em revisão" },
  Rejeitado: { icon: XCircle,        color: "text-red-500",     bg: "bg-red-500/10",     label: "Rejeitado" },
  Pausado:   { icon: AlertTriangle,  color: "text-slate-400",   bg: "bg-slate-500/10",   label: "Pausado" },
};

const HEADER_ICONS: Record<HeaderType, React.ElementType> = {
  none: AlignLeft, text: AlignLeft, image: Image, video: Video, document: FileText,
};

const LANGS = ["pt_PT", "pt_BR", "en_US", "es_ES", "fr_FR"];

/* ─── WhatsApp Preview inside iPhone mockup ─────────────────── */
function WaPreview({ tpl }: { tpl: Partial<Template> & { body: string } }) {
  const bodyPrev = (tpl.body || "")
    .replace(/{{(\d+)}}/g, (_, n) => `[Variável ${n}]`)
    .replace(/\*(.*?)\*/g, "$1");

  const chatContent = (
    <>
      {/* WA top bar */}
      <div style={{ background: "#202c33", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>E</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#e9edef", lineHeight: 1.2 }}>Escola</p>
          <p style={{ margin: 0, fontSize: 9, color: "#25d366" }}>Conta empresarial verificada ✓</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", background: "#0b141a", padding: "10px 8px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23ffffff04' stroke-width='1'/%3E%3C/svg%3E\")" }}>
        {/* Date chip */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 9, background: "#182229", color: "#8696a0", padding: "2px 8px", borderRadius: 8 }}>HOJE</span>
        </div>

        {/* Message bubble */}
        <div style={{ maxWidth: "90%", marginLeft: 0 }}>
          <div style={{ background: "#202c33", borderRadius: "0 12px 12px 12px", padding: "8px 10px", boxShadow: "0 1px 2px rgba(0,0,0,0.4)", position: "relative" }}>
            {/* Tail */}
            <div style={{ position: "absolute", top: 0, left: -6, width: 0, height: 0, borderTop: "6px solid #202c33", borderLeft: "6px solid transparent" }} />

            {/* Header */}
            {tpl.headerType && tpl.headerType !== "none" && (
              <div style={{ marginBottom: 6 }}>
                {tpl.headerType === "image" && (
                  <div style={{ width: "100%", height: 90, borderRadius: 8, background: "linear-gradient(135deg,rgba(59,130,246,0.35),rgba(139,92,246,0.35))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                )}
                {tpl.headerType === "video" && (
                  <div style={{ width: "100%", height: 90, borderRadius: 8, background: "linear-gradient(135deg,rgba(239,68,68,0.25),rgba(249,115,22,0.25))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
                {tpl.headerType === "document" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#2a3942", borderRadius: 8, padding: "6px 10px", marginBottom: 4 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>documento.pdf</span>
                  </div>
                )}
                {tpl.headerType === "text" && tpl.headerContent && (
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#e9edef" }}>{tpl.headerContent}</p>
                )}
              </div>
            )}

            {/* Body */}
            <p style={{ margin: 0, fontSize: 11, color: "#e9edef", lineHeight: 1.55, whiteSpace: "pre-line" }}>
              {bodyPrev || "O corpo da mensagem aparecerá aqui…"}
            </p>

            {/* Footer */}
            {tpl.footer && <p style={{ margin: "5px 0 0", fontSize: 9, color: "#8696a0" }}>{tpl.footer}</p>}

            {/* Timestamp */}
            <p style={{ margin: "3px 0 0", fontSize: 9, color: "#8696a0", textAlign: "right" }}>12:00 ✓✓</p>
          </div>

          {/* Action buttons */}
          {tpl.buttons && tpl.buttons.length > 0 && (
            <div style={{ marginTop: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              {tpl.buttons.map((btn, i) => (
                <div key={i} style={{ background: "#202c33", borderRadius: 12, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                  {btn.type === "quick_reply" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00a884" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  {btn.type === "url"         && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00a884" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                  {btn.type === "phone"       && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00a884" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.48C1.53 2.39 2.37 1.46 3.46 1.46h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.1a16 16 0 0 0 6 6l1.01-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#00a884" }}>{btn.text || "Botão"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WA bottom bar */}
      <div style={{ background: "#202c33", padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "#2a3942", borderRadius: 24, height: 32, display: "flex", alignItems: "center", padding: "0 10px" }}>
          <span style={{ fontSize: 10, color: "#8696a0" }}>Escreva uma mensagem</span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#00a884", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-7 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* iPhone body */}
      <div style={{ position: "relative", width: 218, flexShrink: 0 }}>

        {/* Side buttons left (volume) */}
        <div style={{ position: "absolute", left: -3, top: 72, width: 3, height: 26, background: "#2a2a2a", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", left: -3, top: 106, width: 3, height: 26, background: "#2a2a2a", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", left: -3, top: 52, width: 3, height: 16, background: "#2a2a2a", borderRadius: "2px 0 0 2px", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)" }} />

        {/* Side button right (power) */}
        <div style={{ position: "absolute", right: -3, top: 90, width: 3, height: 40, background: "#2a2a2a", borderRadius: "0 2px 2px 0", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)" }} />

        {/* Phone chassis */}
        <div style={{
          width: 218,
          background: "linear-gradient(160deg, #1c1c1e 0%, #0d0d0f 100%)",
          borderRadius: 36,
          padding: 6,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 4px 6px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
          position: "relative",
        }}>
          {/* Screen */}
          <div style={{
            borderRadius: 30,
            overflow: "hidden",
            background: "#000",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* iOS status bar */}
            <div style={{ background: "#202c33", padding: "10px 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>9:41</span>
              {/* Dynamic Island */}
              <div style={{ width: 68, height: 20, background: "#000", borderRadius: 12, position: "absolute", left: "50%", transform: "translateX(-50%)", top: 6 }} />
              {/* Status icons */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="10" viewBox="0 0 24 24" fill="white"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                <svg width="12" height="10" viewBox="0 0 24 24" fill="white"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2a2 2 0 0 0 0 4v-2z"/></svg>
              </div>
            </div>

            {/* Chat content */}
            <div style={{ display: "flex", flexDirection: "column", height: 390, overflow: "hidden" }}>
              {chatContent}
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 60, height: 3, background: "rgba(255,255,255,0.25)", borderRadius: 4 }} />
      </div>

      <p style={{ fontSize: 10, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        Pré-visualização iPhone · WhatsApp
      </p>
    </div>
  );
}

/* ─── Create / Edit Panel ────────────────────────────────────── */
type PanelMode = "create" | "view";
function TemplatePanel({ template, mode, onClose }: { template?: Template; mode: PanelMode; onClose: () => void }) {
  const isView = mode === "view" && template;
  const [name, setName]               = useState(template?.name || "");
  const [category, setCategory]       = useState<Category>(template?.category || "Utilidade");
  const [language, setLanguage]       = useState(template?.language || "pt_PT");
  const [headerType, setHeaderType]   = useState<HeaderType>(template?.headerType || "none");
  const [headerContent, setHeaderContent] = useState(template?.headerContent || "");
  const [body, setBody]               = useState(template?.body || "");
  const [footer, setFooter]           = useState(template?.footer || "");
  const [buttons, setButtons]         = useState<TemplateButton[]>(template?.buttons || []);
  const [saved, setSaved]             = useState(false);

  const livePreview: Partial<Template> & { body: string } = {
    headerType, headerContent, body, footer, buttons,
  };

  const addButton = (type: ButtonType) => {
    if (buttons.length >= 3) return;
    setButtons(prev => [...prev, { type, text: "", value: "" }]);
  };
  const removeButton = (i: number) => setButtons(prev => prev.filter((_, idx) => idx !== i));
  const updateButton = (i: number, key: keyof TemplateButton, val: string) =>
    setButtons(prev => prev.map((b, idx) => idx === i ? { ...b, [key]: val } : b));

  const insertVar = () => {
    const n = (body.match(/{{(\d+)}}/g) || []).length + 1;
    setBody(prev => prev + `{{${n}}}`);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-[860px] h-full bg-card border-l border-border flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isView ? `Template: ${template!.name}` : "Novo Template"}
              </h2>
              <p className="text-[10px] text-muted-foreground">Seguindo os requisitos da Meta / WhatsApp Business API</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Meta notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                Os templates são submetidos à <strong>Meta para aprovação</strong> antes de poderem ser usados. O processo demora entre 10 minutos e 24 horas. Templates de <strong>Autenticação</strong> têm aprovação quase instantânea.
              </p>
            </div>

            {/* Nome */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Nome do template <span className="text-red-400">*</span>
                <span className="ml-2 text-[10px] font-normal text-muted-foreground">(minúsculas e underscores apenas)</span>
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                placeholder="ex: lembrete_reuniao_pais"
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
              />
            </div>

            {/* Categoria + Idioma */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Categoria <span className="text-red-400">*</span></label>
                <div className="space-y-1.5">
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    const active = category === cat;
                    return (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg border text-left transition-all ${active ? "border-primary/50 bg-primary/8 text-primary" : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"}`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary" : cfg.color}`} />
                        <div>
                          <p className="text-[12px] font-semibold">{cat}</p>
                          <p className="text-[9px] opacity-70">{cfg.desc}</p>
                        </div>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Idioma</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                  >
                    {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {/* Meta requirements summary */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5">
                  <p className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-primary" /> Requisitos Meta
                  </p>
                  {[
                    { ok: name.length >= 1,       label: "Nome preenchido" },
                    { ok: name.match(/^[a-z0-9_]+$/) !== null, label: "Formato válido" },
                    { ok: body.length >= 10,       label: "Corpo ≥ 10 caracteres" },
                    { ok: body.length <= 1024,     label: "Corpo ≤ 1024 chars" },
                    { ok: buttons.length <= 3,     label: "Máx. 3 botões" },
                    { ok: footer.length <= 60,     label: "Rodapé ≤ 60 chars" },
                  ].map(r => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-[10px] ${r.ok ? "text-emerald-600" : "text-muted-foreground"}`}>
                      <CheckCircle2 className={`w-2.5 h-2.5 shrink-0 ${r.ok ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cabeçalho */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Cabeçalho <span className="text-[10px] font-normal text-muted-foreground">(opcional)</span></label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {(["none","text","image","video","document"] as HeaderType[]).map(t => {
                  const Icon = HEADER_ICONS[t];
                  const labels = { none: "Nenhum", text: "Texto", image: "Imagem", video: "Vídeo", document: "Ficheiro" };
                  return (
                    <button key={t} onClick={() => setHeaderType(t)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-medium transition-all ${headerType === t ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {labels[t]}
                    </button>
                  );
                })}
              </div>
              {headerType === "text" && (
                <input value={headerContent} onChange={e => setHeaderContent(e.target.value.slice(0, 60))}
                  placeholder="Título da mensagem (máx. 60 caracteres)"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
              )}
              {(headerType === "image" || headerType === "video" || headerType === "document") && (
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                  <p className="text-xs">Será fornecido no envio (URL ou ficheiro)</p>
                  <p className="text-[10px] mt-0.5 opacity-60">O template define o tipo — o conteúdo é passado dinamicamente</p>
                </div>
              )}
            </div>

            {/* Corpo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Corpo da mensagem <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={insertVar} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-mono">
                    + {`{{`}{(body.match(/{{(\d+)}}/g) || []).length + 1}{`}}`}
                  </button>
                  <span className={`text-[10px] ${body.length > 1024 ? "text-red-500" : "text-muted-foreground"}`}>{body.length}/1024</span>
                </div>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value.slice(0, 1024))}
                placeholder={"Olá, {{1}}!\n\nAqui vai o corpo da sua mensagem. Use {{2}}, {{3}}… para variáveis dinâmicas.\n\nFormate com *negrito* ou _itálico_."}
                rows={6}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Use *texto* para negrito, _texto_ para itálico. Variáveis: {`{{1}}, {{2}}…`}</p>
            </div>

            {/* Rodapé */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Rodapé <span className="text-[10px] font-normal text-muted-foreground">(opcional, máx. 60 chars)</span>
              </label>
              <input value={footer} onChange={e => setFooter(e.target.value.slice(0, 60))}
                placeholder="Ex: Merkron — Sistema Escolar"
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Botões */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">
                  Botões <span className="text-[10px] font-normal text-muted-foreground">(opcional, máx. 3)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { type: "quick_reply" as ButtonType, icon: MessageSquare, label: "Resposta" },
                    { type: "url"         as ButtonType, icon: Link2,         label: "URL" },
                    { type: "phone"       as ButtonType, icon: Phone,         label: "Telefone" },
                  ].map(b => (
                    <button key={b.type} onClick={() => addButton(b.type)} disabled={buttons.length >= 3}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <b.icon className="w-2.5 h-2.5" /> {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {buttons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      btn.type === "quick_reply" ? "bg-purple-500/10" : btn.type === "url" ? "bg-blue-500/10" : "bg-emerald-500/10"
                    }`}>
                      {btn.type === "quick_reply" && <MessageSquare className="w-3 h-3 text-purple-500" />}
                      {btn.type === "url"         && <Link2 className="w-3 h-3 text-blue-500" />}
                      {btn.type === "phone"       && <Phone className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <input value={btn.text} onChange={e => updateButton(i, "text", e.target.value)}
                      placeholder="Texto do botão" maxLength={25}
                      className="flex-1 h-7 px-2 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    {btn.type !== "quick_reply" && (
                      <input value={btn.value || ""} onChange={e => updateButton(i, "value", e.target.value)}
                        placeholder={btn.type === "url" ? "https://…" : "+351…"}
                        className="flex-1 h-7 px-2 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                      />
                    )}
                    <button onClick={() => removeButton(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {buttons.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2">Nenhum botão adicionado</p>
                )}
              </div>
            </div>
          </div>

          {/* Preview column */}
          <div className="w-[260px] shrink-0 border-l border-border bg-muted/20 flex flex-col items-center justify-start pt-8 px-4 gap-4 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground self-start">Pré-visualização</p>
            <WaPreview tpl={livePreview} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <button onClick={onClose} className="flex-none h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium">
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-lg border border-border bg-muted/30 text-sm text-foreground hover:bg-muted transition-all font-medium">
              Guardar rascunho
            </button>
            <button
              onClick={handleSave}
              className={`h-9 px-5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${saved ? "bg-emerald-500 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
            >
              {saved
                ? <><CheckCircle2 className="w-4 h-4" /> Submetido!</>
                : <><Send className="w-4 h-4" /> Submeter à Meta</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Card ──────────────────────────────────────────── */
function TemplateCard({ tpl, onView }: { tpl: Template; onView: () => void }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_CONFIG[tpl.category];
  const st  = STATUS_CONFIG[tpl.status];
  const CatIcon = cat.icon;
  const StIcon  = st.icon;
  const HdIcon  = HEADER_ICONS[tpl.headerType];

  const bodyPrev = tpl.body.replace(/{{(\d+)}}/g, "…").replace(/\*(.*?)\*/g, "$1").slice(0, 80) + (tpl.body.length > 80 ? "…" : "");

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all group relative">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
            <CatIcon className={`w-3.5 h-3.5 ${cat.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground font-mono truncate">{tpl.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${cat.bg} ${cat.color}`}>{tpl.category}</span>
              <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${st.bg} ${st.color}`}>
                <StIcon className="w-2.5 h-2.5" />{st.label}
              </span>
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                <Globe className="w-2.5 h-2.5" />{tpl.language}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {open && (
            <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 w-36" onMouseLeave={() => setOpen(false)}>
              {[
                { icon: Eye,    label: "Ver detalhes", action: () => { onView(); setOpen(false); } },
                { icon: Edit2,  label: "Editar",       action: () => setOpen(false) },
                { icon: Copy,   label: "Duplicar",     action: () => setOpen(false) },
                { icon: Trash2, label: "Eliminar",     danger: true, action: () => setOpen(false) },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors ${a.danger ? "text-red-500" : "text-foreground"}`}
                >
                  <a.icon className="w-3 h-3" />{a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Header type badge */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          <HdIcon className="w-2.5 h-2.5" />
          {tpl.headerType === "none" ? "Sem cabeçalho" : `Cabeçalho: ${tpl.headerType}`}
        </div>
        {tpl.buttons.length > 0 && (
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            <MousePointerClick className="w-2.5 h-2.5" />{tpl.buttons.length} botão{tpl.buttons.length !== 1 ? "ões" : ""}
          </div>
        )}
      </div>

      {/* Body preview */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">{bodyPrev}</p>

      {/* Stats */}
      {tpl.status === "Aprovado" && (
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground">Envios</p>
            <p className="text-sm font-bold text-foreground">{tpl.sentCount.toLocaleString("pt")}</p>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground">Leitura</p>
            <p className="text-sm font-bold text-foreground">{tpl.readRate}%</p>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground">Qualidade</p>
            <div className="flex items-center justify-center gap-0.5">
              <Star className={`w-3 h-3 ${tpl.quality >= 80 ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
              <p className="text-sm font-bold text-foreground">{tpl.quality}</p>
            </div>
          </div>
        </div>
      )}

      {tpl.status === "Pendente" && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400">Aguarda revisão da Meta — pode demorar até 24h</p>
        </div>
      )}

      {tpl.status === "Rejeitado" && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <XCircle className="w-3 h-3 text-red-500" />
          <p className="text-[10px] text-red-500">Rejeitado — clique em "Ver detalhes" para saber o motivo</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground">Editado {tpl.lastEdited}</p>
        <button onClick={onView} className="text-[10px] text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-all">Ver detalhes →</button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
type FilterStatus = "Todos" | Status;
const STATUS_FILTERS: FilterStatus[] = ["Todos", "Aprovado", "Pendente", "Rejeitado"];

export default function Templates() {
  const [showCreate, setShowCreate]       = useState(false);
  const [viewTpl, setViewTpl]             = useState<Template | null>(null);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>("Todos");
  const [filterCat, setFilterCat]         = useState<Category | "Todas">("Todas");

  const filtered = MOCK.filter(t => {
    const mS = filterStatus === "Todos"  || t.status === filterStatus;
    const mC = filterCat    === "Todas"  || t.category === filterCat;
    const mQ = !search || t.name.includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
    return mS && mC && mQ;
  });

  const approved  = MOCK.filter(t => t.status === "Aprovado").length;
  const pending   = MOCK.filter(t => t.status === "Pendente").length;
  const rejected  = MOCK.filter(t => t.status === "Rejeitado").length;
  const totalSent = MOCK.reduce((a, b) => a + b.sentCount, 0);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-[1400px] mx-auto space-y-4">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Templates WhatsApp</h1>
                <p className="text-xs text-muted-foreground">Mensagens pré-aprovadas pela Meta para envio em escala</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="h-8 text-xs bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white px-3 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Criar Template
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: LayoutTemplate, color: "text-primary",     bg: "bg-primary/10",     label: "Total de Templates",  val: MOCK.length,                    sub: `${approved} aprovados` },
              { icon: Send,           color: "text-blue-500",    bg: "bg-blue-500/10",    label: "Mensagens Enviadas",  val: totalSent.toLocaleString("pt"), sub: "com templates aprovados" },
              { icon: Clock,          color: "text-amber-500",   bg: "bg-amber-500/10",   label: "Em Revisão Meta",     val: pending,                        sub: "aguarda aprovação" },
              { icon: XCircle,        color: "text-red-500",     bg: "bg-red-500/10",     label: "Rejeitados",          val: rejected,                       sub: "requerem correção" },
            ].map((s, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                    <s.icon className={s.color} size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold leading-tight">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar templates…"
                className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              {STATUS_FILTERS.map(s => {
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${active ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                  >
                    {s}
                    {s !== "Todos" && (
                      <span className="ml-1.5 text-[9px] font-bold">
                        {MOCK.filter(t => t.status === s).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1 ml-auto">
              {(["Todas", "Marketing", "Utilidade", "Autenticação"] as const).map(c => {
                const active = filterCat === c;
                const cfg = c !== "Todas" ? CATEGORY_CONFIG[c as Category] : null;
                return (
                  <button key={c} onClick={() => setFilterCat(c)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${active ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                  >
                    {cfg && <cfg.icon className={`w-3 h-3 ${active ? "text-primary" : cfg.color}`} />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
            {filtered.map(t => (
              <TemplateCard key={t.id} tpl={t} onView={() => setViewTpl(t)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center text-muted-foreground">
                <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum template encontrado</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreate && <TemplatePanel mode="create" onClose={() => setShowCreate(false)} />}
      {viewTpl    && <TemplatePanel mode="view" template={viewTpl} onClose={() => setViewTpl(null)} />}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
