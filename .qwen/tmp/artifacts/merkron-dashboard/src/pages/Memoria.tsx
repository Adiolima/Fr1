import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Brain, Plus, Search, Filter, BookOpen, Globe, FileText, Tag, Clock,
  Sparkles, ChevronDown, X, CheckCircle2, Zap, Database, TrendingUp,
  MoreHorizontal, Edit2, Trash2, Eye, Upload, Link, AlignLeft,
  GraduationCap, Calendar, Users, Shield, BookMarked, HelpCircle, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KnowledgeItem = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  type: "texto" | "url" | "ficheiro";
  tags: string[];
  addedAt: string;
  usageCount: number;
  status: "active" | "draft";
};

const CATEGORIES = [
  { label: "Todos", icon: Layers, color: "text-foreground" },
  { label: "Regulamento", icon: Shield, color: "text-red-500" },
  { label: "Calendário", icon: Calendar, color: "text-blue-500" },
  { label: "Propinas", icon: BookOpen, color: "text-amber-500" },
  { label: "Currículo", icon: GraduationCap, color: "text-purple-500" },
  { label: "FAQ", icon: HelpCircle, color: "text-emerald-500" },
  { label: "Pessoal", icon: Users, color: "text-cyan-500" },
];

const mockData: KnowledgeItem[] = [
  { id: 1, title: "Regulamento Interno 2024/2025", excerpt: "O regulamento interno define as normas de conduta, direitos e deveres de todos os membros da comunidade escolar, incluindo alunos, professores e funcionários.", category: "Regulamento", type: "ficheiro", tags: ["regras", "conduta", "normas"], addedAt: "02 Jun, 2025", usageCount: 341, status: "active" },
  { id: 2, title: "Calendário de Provas — 3.º Período", excerpt: "Datas e horários de todos os exames e testes do terceiro período letivo. Inclui disciplinas do ensino básico e secundário.", category: "Calendário", type: "texto", tags: ["provas", "datas", "período"], addedAt: "01 Jun, 2025", usageCount: 289, status: "active" },
  { id: 3, title: "Tabela de Propinas 2024/2025", excerpt: "Valores das propinas por nível de ensino, modalidades de pagamento, datas limite e informações sobre bolsas de estudo e isenções.", category: "Propinas", type: "texto", tags: ["pagamento", "bolsas", "isenção"], addedAt: "30 Mai, 2025", usageCount: 512, status: "active" },
  { id: 4, title: "Programa de Matemática — 10.º Ano", excerpt: "Conteúdos programáticos, competências essenciais, critérios de avaliação e recursos didáticos para o 10.º ano de escolaridade.", category: "Currículo", type: "url", tags: ["matemática", "programa", "10.º ano"], addedAt: "28 Mai, 2025", usageCount: 178, status: "active" },
  { id: 5, title: "Perguntas Frequentes — Matrículas", excerpt: "Respostas às dúvidas mais comuns sobre o processo de matrícula e renovação de matrícula para o ano letivo 2025/2026.", category: "FAQ", type: "texto", tags: ["matrícula", "inscrição", "documentos"], addedAt: "25 Mai, 2025", usageCount: 423, status: "active" },
  { id: 6, title: "Contactos do Corpo Docente", excerpt: "Lista atualizada de todos os professores, departamentos, horários de atendimento e emails institucionais.", category: "Pessoal", type: "texto", tags: ["professores", "contactos", "email"], addedAt: "20 Mai, 2025", usageCount: 96, status: "draft" },
  { id: 7, title: "Horários de Atendimento — Secretaria", excerpt: "Horários de funcionamento da secretaria escolar, serviços disponíveis presencialmente e online, e tempos médios de resposta.", category: "FAQ", type: "texto", tags: ["secretaria", "horários", "atendimento"], addedAt: "18 Mai, 2025", usageCount: 267, status: "active" },
  { id: 8, title: "Política de Faltas e Justificações", excerpt: "Procedimentos para justificação de faltas, limites de absentismo, consequências disciplinares e formulários necessários.", category: "Regulamento", type: "ficheiro", tags: ["faltas", "justificação", "absentismo"], addedAt: "15 Mai, 2025", usageCount: 198, status: "active" },
];

const TYPE_ICON = {
  texto: AlignLeft,
  url: Globe,
  ficheiro: FileText,
};

const TYPE_LABEL = { texto: "Texto", url: "URL", ficheiro: "Ficheiro" };
const TYPE_COLOR = { texto: "text-purple-500 bg-purple-500/10", url: "text-blue-500 bg-blue-500/10", ficheiro: "text-amber-500 bg-amber-500/10" };

const CAT_COLOR: Record<string, string> = {
  Regulamento: "bg-red-500/10 text-red-500",
  Calendário: "bg-blue-500/10 text-blue-500",
  Propinas: "bg-amber-500/10 text-amber-600",
  Currículo: "bg-purple-500/10 text-purple-500",
  FAQ: "bg-emerald-500/10 text-emerald-600",
  Pessoal: "bg-cyan-500/10 text-cyan-600",
};

type ContentType = "texto" | "url" | "ficheiro";

function AddKnowledgePanel({ onClose }: { onClose: () => void }) {
  const [contentType, setContentType] = useState<ContentType>("texto");
  const [category, setCategory] = useState("FAQ");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="w-[520px] h-full bg-card border-l border-border flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Adicionar Conhecimento</h2>
              <p className="text-[10px] text-muted-foreground">Expanda a memória do assistente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">Tipo de Conteúdo</label>
            <div className="grid grid-cols-3 gap-2">
              {(["texto", "url", "ficheiro"] as ContentType[]).map((t) => {
                const Icon = TYPE_ICON[t];
                const active = contentType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setContentType(t)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {TYPE_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Título <span className="text-red-400">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Regulamento de Faltas 2024/2025"
              className="w-full h-9 px-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Categoria</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.slice(1).map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-3 h-3 shrink-0 ${active ? "text-primary" : cat.color}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area */}
          {contentType === "texto" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Conteúdo <span className="text-red-400">*</span></label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Insira o conhecimento que o assistente deve memorizar. Seja específico e claro para melhores resultados."
                rows={7}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{content.length} / 5000 caracteres</p>
            </div>
          )}

          {contentType === "url" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">URL da Fonte <span className="text-red-400">*</span></label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://escola.pt/regulamento-interno"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-[11px] text-blue-500 font-medium flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> O assistente irá indexar automaticamente o conteúdo desta página.
                </p>
              </div>
            </div>
          )}

          {contentType === "ficheiro" && (
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Ficheiro <span className="text-red-400">*</span></label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-foreground">Arraste ou clique para carregar</p>
                <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, TXT — máx. 10MB</p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="regulamento, normas, conduta (separados por vírgula)"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* AI hint */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/8 to-cyan-500/8 border border-primary/15">
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

        {/* Panel footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Guardado!</>
            ) : (
              <><Brain className="w-4 h-4" /> Guardar na Memória</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Memoria() {
  const [showPanel, setShowPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = mockData.filter(item => {
    const matchCat = activeCategory === "Todos" || item.category === activeCategory;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const totalUsage = mockData.reduce((a, b) => a + b.usageCount, 0);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-[1400px] mx-auto space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Memória do Assistente</h1>
                <p className="text-xs text-muted-foreground">Base de conhecimento que alimenta as respostas automáticas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 text-xs border-border bg-card px-3 gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filtrar
              </Button>
              <Button
                className="h-8 text-xs bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white px-3 gap-1.5"
                onClick={() => setShowPanel(true)}
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Conhecimento
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Database, color: "text-primary", bg: "bg-primary/10", label: "Itens na Memória", val: mockData.length, sub: `${mockData.filter(d => d.status === "active").length} ativos` },
              { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", label: "Interações Geradas", val: totalUsage.toLocaleString("pt"), sub: "este mês" },
              { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Taxa de Acerto", val: "94,2%", sub: "↑ 3,1% vs mês anterior" },
              { icon: Sparkles, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Respostas Automáticas", val: "3.421", sub: "ativadas pela memória" },
            ].map((s, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color}`} size={18} />
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

          {/* Search + Categories */}
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
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${active ? "text-primary" : cat.color}`} />
                    {cat.label}
                    {cat.label !== "Todos" && (
                      <span className={`text-[9px] font-bold ml-0.5 ${active ? "text-primary/70" : "text-muted-foreground"}`}>
                        {mockData.filter(d => d.category === cat.label).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Knowledge grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
            {/* Add new card */}
            <button
              onClick={() => setShowPanel(true)}
              className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm font-semibold">Novo Conhecimento</p>
              <p className="text-[10px] text-center leading-relaxed max-w-[160px]">Adicione texto, URL ou ficheiro à memória do assistente</p>
            </button>

            {filtered.map((item) => {
              const TypeIcon = TYPE_ICON[item.type];
              return (
                <div
                  key={item.id}
                  className="relative bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-border/80 hover:shadow-md transition-all group"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLOR[item.type]}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-semibold text-foreground leading-tight truncate">{item.title}</h3>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${CAT_COLOR[item.category] || "bg-muted text-muted-foreground"}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {openMenu === item.id && (
                        <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 w-36">
                          {[
                            { icon: Eye, label: "Ver detalhes" },
                            { icon: Edit2, label: "Editar" },
                            { icon: Trash2, label: "Eliminar", danger: true },
                          ].map((action) => (
                            <button
                              key={action.label}
                              onClick={() => setOpenMenu(null)}
                              className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors ${action.danger ? "text-red-500" : "text-foreground"}`}
                            >
                              <action.icon className="w-3 h-3" /> {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {item.excerpt}
                  </p>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.addedAt}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold text-foreground">{item.usageCount}</span> usos
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${item.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {item.status === "active" ? "Ativo" : "Rascunho"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {showPanel && <AddKnowledgePanel onClose={() => setShowPanel(false)} />}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
