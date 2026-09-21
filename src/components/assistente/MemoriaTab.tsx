"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus, RefreshCw, Loader2, AlertTriangle,
  Search, Edit2, Trash2, X, Upload, FileText,
  BookOpen, Building2, MessageSquare, Megaphone,
  FileUp, Eye, MoreHorizontal, Clock, Zap,
  Database, TrendingUp, Sparkles, Brain, CheckCircle2,
  Filter, Tag, Globe, AlignLeft, Link, Layers,
} from "lucide-react";
import {
  getMemorias, createMemoria, updateMemoria, deleteMemoria,
  actualizarAssistente, uploadDocumento,
  type Memoria, type MemoriaTipo, type MemoriaCreatePayload, type MemoriaUpdatePayload,
} from "@/services/memoriaService";
import { toast } from "sonner";

/* ─── Constantes ─── */

const TIPOS: { value: MemoriaTipo | ""; label: string; icon: typeof BookOpen; color: string; bg: string }[] = [
  { value: "", label: "Todos", icon: Layers, color: "text-foreground", bg: "bg-muted" },
  { value: "institucional", label: "Institucional", icon: Building2, color: "text-red-500", bg: "bg-red-500/10" },
  { value: "academica", label: "Académica", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
  { value: "faq", label: "FAQ", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "comunicado", label: "Comunicado", icon: Megaphone, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "documento", label: "Documento", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const POR_PAGINA = 20;

function tipoInfo(tipo: MemoriaTipo) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[1];
}

/* ─── Slide-in Panel Criar/Editar ─── */

function MemoriaFormPanel({
  assistenteUid, memoria, onClose, onSaved,
}: {
  assistenteUid: string; memoria?: Memoria; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!memoria;
  const [tipo, setTipo] = useState<MemoriaTipo>(memoria?.tipo ?? "institucional");
  const [titulo, setTitulo] = useState(memoria?.titulo ?? "");
  const [conteudo, setConteudo] = useState(memoria?.conteudo ?? "");
  const [resumo, setResumo] = useState(memoria?.resumo ?? "");
  const [validoDe, setValidoDe] = useState(memoria?.valido_de?.split("T")[0] ?? "");
  const [validoAte, setValidoAte] = useState(memoria?.valido_ate?.split("T")[0] ?? "");
  const [ativo, setAtivo] = useState(memoria?.ativo ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (isEdit) {
        await updateMemoria(memoria!.uuid_publico, { tipo, titulo: titulo.trim(), conteudo: conteudo.trim(), resumo: resumo.trim() || undefined, valido_de: validoDe || undefined, valido_ate: validoAte || null, ativo });
      } else {
        await createMemoria({ assistente_uid: assistenteUid, tipo, titulo: titulo.trim(), conteudo: conteudo.trim(), resumo: resumo.trim() || undefined, valido_de: validoDe || undefined, valido_ate: validoAte || null, ativo });
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); onSaved(); }, 1200);
    } catch (err: any) { setError(err?.response?.data?.erro || err?.message || "Erro."); }
    finally { setLoading(false); }
  };

  const info = tipoInfo(tipo);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-[520px] h-full bg-card border-l border-border flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{isEdit ? "Editar Memória" : "Adicionar Conhecimento"}</h2>
              <p className="text-[10px] text-muted-foreground">{isEdit ? "Actualize a memória" : "Expanda a memória do assistente"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && <div className="text-xs px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">{error}</div>}

          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Tipo de Conteúdo</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.filter(t => t.value).map((t) => {
                const Icon = t.icon;
                const active = tipo === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTipo(t.value as MemoriaTipo)}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-xs font-medium ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Título <span className="text-red-400">*</span></label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Horário de funcionamento da secretaria"
              className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Conteúdo <span className="text-red-400">*</span></label>
            <textarea
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              placeholder="Insira o conhecimento que o assistente deve memorizar. Seja específico e claro para melhores resultados."
              rows={7}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{conteudo.length} caracteres</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Resumo</label>
            <input
              value={resumo}
              onChange={e => setResumo(e.target.value)}
              placeholder="Resumo curto (opcional)"
              className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Válido de</label>
              <input
                type="date" value={validoDe} onChange={e => setValidoDe(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Válido até</label>
              <input
                type="date" value={validoAte} onChange={e => setValidoAte(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={ativo} onCheckedChange={setAtivo} />
            <span className="text-sm text-foreground">{ativo ? "Activo" : "Inactivo"}</span>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/8 to-secondary/8 border border-primary/15">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-foreground mb-0.5">Dica do Assistente</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Conteúdos bem estruturados e específicos melhoram em até 3× a precisão das respostas automáticas. Use títulos claros e evite informação ambígua.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !titulo.trim() || !conteudo.trim()}
            className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Guardado!</>
            ) : (
              <><Brain className="w-4 h-4" /> {isEdit ? "Guardar Alterações" : "Guardar na Memória"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Upload ─── */

function UploadModal({ assistenteUid, onClose, onUploaded }: { assistenteUid: string; onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleUpload = async () => { if (!file) return; setError(""); setLoading(true); try { await uploadDocumento(assistenteUid, file); toast.success("Documento carregado"); onUploaded(); onClose(); } catch (err: any) { setError(err?.response?.data?.erro || "Erro."); } finally { setLoading(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[440px] p-6 z-10">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-foreground">Carregar Documento</h2><button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button></div>
        {error && <div className="text-xs px-3 py-2 rounded-lg mb-4 bg-destructive/10 border border-destructive/20 text-destructive">{error}</div>}
        <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
          <FileUp className="w-10 h-10 text-muted-foreground" />
          <div className="text-center"><p className="text-sm font-medium text-foreground">{file ? file.name : "Seleccionar ficheiro"}</p><p className="text-[11px] text-muted-foreground mt-0.5">PDF, DOC ou DOCX · max 25 MB</p></div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
        </label>
        <Button onClick={handleUpload} disabled={loading || !file}
          className="w-full h-10 mt-4 text-sm bg-gradient-to-r from-primary to-secondary hover:opacity-90 border-0 text-white font-semibold cursor-pointer">
          {loading ? "A carregar..." : <><Upload className="w-4 h-4 mr-1.5" /> Carregar Documento</>}
        </Button>
      </div>
    </div>
  );
}

/* ─── Modal Confirmar Delete ─── */

function DeleteConfirmModal({ memoria, onClose, onDeleted }: { memoria: Memoria; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[400px] p-6 z-10 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3"><Trash2 className="w-6 h-6 text-destructive" /></div>
        <h2 className="text-lg font-bold text-foreground mb-1">Apagar memória?</h2>
        <p className="text-sm text-muted-foreground mb-4">"{memoria.titulo}" será removida permanentemente.</p>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-sm border-border cursor-pointer">Cancelar</Button>
          <Button onClick={async () => { setLoading(true); try { await deleteMemoria(memoria.uuid_publico); toast.success("Memória apagada"); onDeleted(); onClose(); } catch (err: any) { toast.error(err?.response?.data?.erro || "Erro."); } finally { setLoading(false); } }}
            disabled={loading} className="flex-1 h-9 text-sm bg-destructive hover:bg-destructive/90 border-0 text-white cursor-pointer">{loading ? "A apagar..." : "Apagar"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente Principal ─── */

interface MemoriaTabProps { assistenteUid: string; }

export default function MemoriaTab({ assistenteUid }: MemoriaTabProps) {
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<MemoriaTipo | "">("");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Memoria | null>(null);
  const [deleting, setDeleting] = useState<Memoria | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  const fetchMemorias = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: any = { assistente_id: assistenteUid, pagina, por_pagina: POR_PAGINA };
      if (filtroTipo) params.tipo = filtroTipo;
      const res = await getMemorias(params);
      setMemorias(res.dados); setTotal(res.paginacao.total); setTotalPaginas(res.paginacao.total_paginas);
    } catch (err: any) { setError(err?.response?.data?.erro || "Erro ao carregar."); }
    finally { setLoading(false); }
  }, [assistenteUid, pagina, filtroTipo]);

  useEffect(() => { fetchMemorias(); }, [fetchMemorias]);

  const handleActualizar = async () => {
    setActualizando(true);
    try { const res = await actualizarAssistente(assistenteUid); toast.success("Cache invalidada", { description: `${res.dados.memorias_activas} memórias activas.` }); }
    catch (err: any) { toast.error(err?.response?.data?.erro || "Erro."); }
    finally { setActualizando(false); }
  };

  const filtered = search
    ? memorias.filter((m) => m.titulo.toLowerCase().includes(search.toLowerCase()) || (m.resumo && m.resumo.toLowerCase().includes(search.toLowerCase())))
    : memorias;

  const ativos = memorias.filter(m => m.ativo).length;

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Memória do Assistente</h1>
            <p className="text-xs text-muted-foreground">Base de conhecimento que alimenta as respostas automáticas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleActualizar} disabled={actualizando} variant="outline" className="h-8 text-xs border-border bg-card px-3 gap-1.5 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? "animate-spin" : ""}`} />{actualizando ? "A actualizar..." : "Actualizar"}
          </Button>
          <Button onClick={() => setShowUpload(true)} variant="outline" className="h-8 text-xs border-border bg-card px-3 gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />Carregar Documento
          </Button>
          <Button
            className="h-8 text-xs bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-3 gap-1.5 cursor-pointer"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-3.5 h-3.5" />Adicionar Conhecimento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Database, color: "text-primary", bg: "bg-primary/10", label: "Itens na Memória", val: memorias.length, sub: `${ativos} activos` },
          { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", label: "Interacções Geradas", val: total.toLocaleString("pt"), sub: "total" },
          { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Taxa de Acerto", val: "—", sub: "em breve" },
          { icon: Sparkles, color: "text-secondary", bg: "bg-secondary/10", label: "Respostas Automáticas", val: "—", sub: "activadas pela memória" },
        ].map((s, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-[18px] h-[18px] ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground leading-tight">{s.val}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Categorias */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar na memória..."
            className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIPOS.map((cat) => {
            const Icon = cat.icon;
            const active = filtroTipo === cat.value;
            const count = cat.value ? memorias.filter(m => m.tipo === cat.value).length : memorias.length;
            return (
              <button
                key={cat.value || "todos"}
                onClick={() => { setFiltroTipo(cat.value as MemoriaTipo | ""); setPagina(1); }}
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  active
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-3 h-3 ${active ? "text-primary" : cat.color}`} />
                {cat.label}
                <span className={`text-[9px] font-bold ml-0.5 ${active ? "text-primary/70" : "text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-muted-foreground animate-spin" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-8 h-8 text-destructive/60 mb-2" /><p className="text-sm text-foreground mb-1">Erro ao carregar</p><p className="text-xs text-muted-foreground mb-3">{error}</p>
          <Button onClick={fetchMemorias} variant="outline" size="sm" className="cursor-pointer"><RefreshCw className="w-3.5 h-3.5 mr-1" />Tentar novamente</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
          {/* Add new card */}
          <button
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group min-h-[160px] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-semibold">Novo Conhecimento</p>
            <p className="text-[10px] text-center leading-relaxed max-w-[160px]">Adicione texto ou documento à memória do assistente</p>
          </button>

          {filtered.map((item) => {
            const info = tipoInfo(item.tipo);
            const Icon = info.icon;
            return (
              <div
                key={item.uuid_publico}
                className="relative bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-border/80 hover:shadow-md transition-all group"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${info.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-semibold text-foreground leading-tight truncate">{item.titulo}</h3>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${info.bg} ${info.color}`}>
                        {info.label}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === item.uuid_publico ? null : item.uuid_publico)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenu === item.uuid_publico && (
                      <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 w-36">
                        {[
                          { icon: Eye, label: "Ver detalhes", action: () => { setEditing(item); setOpenMenu(null); } },
                          { icon: Edit2, label: "Editar", action: () => { setEditing(item); setOpenMenu(null); } },
                          { icon: Trash2, label: "Eliminar", action: () => { setDeleting(item); setOpenMenu(null); }, danger: true },
                        ].map((a) => (
                          <button
                            key={a.label}
                            onClick={a.action}
                            className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer ${a.danger ? "text-destructive" : "text-foreground"}`}
                          >
                            <a.icon className="w-3 h-3" />{a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                  {item.resumo || item.conteudo || "Sem conteúdo"}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(item.criado_em).toLocaleDateString("pt")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${item.ativo ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {item.ativo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina <= 1} variant="outline" size="sm" className="h-8 text-xs cursor-pointer">Anterior</Button>
          <span className="text-xs text-muted-foreground">Página {pagina} de {totalPaginas}</span>
          <Button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina >= totalPaginas} variant="outline" size="sm" className="h-8 text-xs cursor-pointer">Seguinte</Button>
        </div>
      )}

      {/* Modais / Panels */}
      {showCreate && <MemoriaFormPanel assistenteUid={assistenteUid} onClose={() => setShowCreate(false)} onSaved={fetchMemorias} />}
      {editing && <MemoriaFormPanel assistenteUid={assistenteUid} memoria={editing} onClose={() => setEditing(null)} onSaved={fetchMemorias} />}
      {deleting && <DeleteConfirmModal memoria={deleting} onClose={() => setDeleting(null)} onDeleted={fetchMemorias} />}
      {showUpload && <UploadModal assistenteUid={assistenteUid} onClose={() => setShowUpload(false)} onUploaded={fetchMemorias} />}
    </div>
  );
}
