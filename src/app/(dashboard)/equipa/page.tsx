"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, Plus, X, ChevronLeft, ArrowRight,
  Mail, Edit2, Trash2, Shield, Crown,
  RefreshCw, Loader2, Save, Send, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle, UserCog, Trash,
} from "lucide-react";
import {
  getOperadores,
  criarConvite,
  updateOperadorPapel,
  deleteOperador,
  deleteOperadorPermanente,
  setPermissoes as salvarPermissoesOperador,
  getOperador,
  promoverOperadorAdmin,
  despromoverOperador,
  transferirPosse,
  listarConvites,
  type OperadorLista,
  type ConvitePendente,
} from "@/services/equipaService";
import { getAssistentes, type Assistente } from "@/services/assistenteService";
import {
  PAPEIS_FUNCIONAIS,
  PERMISSAO_LABELS,
  type PapelFuncional,
  type PapelConta,
  type DespromoverOperadorRequest,
  type TransferirPosseRequest,
  podePromover,
  podeDespromover,
  podeRemoverMembro,
  podeTransferirPosse,
  isOwner,
} from "@/lib/papeis";
import { mensagemErro } from "@/lib/api-errors";
import { useAuth } from "@/components/auth/auth-provider";

/* ─── Helpers ──────────────────────────── */

const estadoBadge = (estado: string) =>
  estado === "ativo"
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : estado === "suspenso"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
      : "bg-red-500/10 text-red-500 border-red-500/20";

const estadoLabel = (estado: string) =>
  estado === "ativo" ? "Ativo" : estado === "suspenso" ? "Suspenso" : "Inativo";

const papelBadgeColor: Record<PapelFuncional, string> = {
  secretaria: "bg-purple-500/10 text-purple-600",
  coordenador: "bg-blue-500/10 text-blue-600",
  dp: "bg-indigo-500/10 text-indigo-600",
  financeiro: "bg-emerald-500/10 text-emerald-600",
};

function PapelContaBadge({ papel }: { papel: PapelConta }) {
  if (papel === "owner") {
    return (
      <Badge className="text-[10px] h-5 px-1.5 font-normal gap-1 bg-amber-500/15 text-amber-600 border border-amber-500/30">
        <Crown className="w-3 h-3" /> Proprietário
      </Badge>
    );
  }
  if (papel === "admin") {
    return (
      <Badge className="text-[10px] h-5 px-1.5 font-normal gap-1 bg-blue-500/15 text-blue-600 border border-blue-500/30">
        <Shield className="w-3 h-3" /> Administrador
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
      Operador
    </Badge>
  );
}

/* ─── Criar Convite — painel lateral ─── */

type CreateStep = "dados" | "permissoes";

function CriarConvitePanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<CreateStep>("dados");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [papelFuncional, setPapelFuncional] = useState<PapelFuncional>("secretaria");

  const [assistentes, setAssistentes] = useState<Assistente[]>([]);
  const [selectedAssistentes, setSelectedAssistentes] = useState<string[]>([]);

  const isFinanceiro = papelFuncional === "financeiro";

  const toggleAssistente = (id: string) =>
    setSelectedAssistentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const asts = await getAssistentes().then((r) => r.dados).catch(() => [] as Assistente[]);
      setAssistentes(asts);
      if (isFinanceiro) {
        await criarConvite({
          email,
          papel_funcional: papelFuncional,
          assistentes_uuids: [],
        });
        onCreated();
        onClose();
      } else {
        setStep("permissoes");
      }
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    if (!isFinanceiro && selectedAssistentes.length === 0) {
      setError("Seleccione pelo menos um assistente. Lista vazia = nenhum acesso.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await criarConvite({
        email,
        papel_funcional: papelFuncional,
        assistentes_uuids: selectedAssistentes,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-5">
      {(["dados", "permissoes"] as CreateStep[]).map((s, i) => (
        <React.Fragment key={s}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              step === s
                ? "bg-primary text-white shadow shadow-primary/40"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          {i < 1 && !isFinanceiro && <div className="w-6 h-px bg-border" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-[480px] h-full bg-card border-l border-border flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Convidar Operador</h2>
              <p className="text-[10px] text-muted-foreground">
                {isFinanceiro ? "1 passo" : `Passo ${step === "dados" ? "1" : "2"} de 2`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!isFinanceiro && <StepIndicator />}

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          {step === "dados" && (
            <form onSubmit={handleDados} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@escola.com"
                    required
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Papel funcional <span className="text-red-400">*</span>
                </label>
                <select
                  value={papelFuncional}
                  onChange={(e) => setPapelFuncional(e.target.value as PapelFuncional)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                >
                  {PAPEIS_FUNCIONAIS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {PAPEIS_FUNCIONAIS.find((p) => p.value === papelFuncional)?.descricao}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                O operador receberá um email com um link para definir a password (validade 48h).
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold"
              >
                {loading ? "A processar..." : isFinanceiro ? "Enviar Convite" : "Continuar"}{" "}
                {!isFinanceiro && <ArrowRight className="w-4 h-4 ml-1.5" />}
                {isFinanceiro && <Send className="w-4 h-4 ml-1.5" />}
              </Button>
            </form>
          )}

          {step === "permissoes" && !isFinanceiro && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setStep("dados")}
                className="flex items-center text-xs text-muted-foreground hover:text-foreground mb-1"
              >
                <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
              </button>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  Assistentes autorizados
                </h3>
                {assistentes.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum assistente disponível.</p>
                ) : (
                  <div className="space-y-1.5">
                    {assistentes.map((a) => (
                      <label
                        key={a.uuid_publico}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{a.modelo_ia}</p>
                        </div>
                        <Switch
                          checked={selectedAssistentes.includes(a.uuid_publico)}
                          onCheckedChange={() => toggleAssistente(a.uuid_publico)}
                        />
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-amber-600 mt-2 font-medium">
                  Lista vazia = nenhum acesso (obrigatório seleccionar pelo menos um).
                </p>
              </div>

              <Button
                onClick={handleFinalizar}
                disabled={loading}
                className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold"
              >
                {loading ? "A enviar..." : "Enviar Convite"} <Send className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: Despromover Admin → Operador ─── */

function DespromoverModal({
  operador,
  onClose,
  onDone,
}: {
  operador: OperadorLista;
  onClose: () => void;
  onDone: () => void;
}) {
  const [papelFuncional, setPapelFuncional] = useState<PapelFuncional>("secretaria");
  const [assistentes, setAssistentes] = useState<Assistente[]>([]);
  const [selectedAssistentes, setSelectedAssistentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAssistentes()
      .then((r) => r.dados)
      .catch(() => [] as Assistente[])
      .then(setAssistentes);
  }, []);

  const toggle = (id: string) =>
    setSelectedAssistentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const submit = async () => {
    if (selectedAssistentes.length === 0) {
      setError("Selecciona pelo menos 1 assistente para o novo operador.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload: DespromoverOperadorRequest = {
        papel_funcional: papelFuncional,
        assistentes_uuids: selectedAssistentes,
      };
      await despromoverOperador(operador.uuid_publico, payload);
      toast.success("Operador despromovido", {
        description: `${operador.nome} passou a operador (${papelFuncional}).`,
      });
      onDone();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Despromover para Operador" onClose={onClose} wide>
      <div className="space-y-4">
        {error && (
          <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          <strong>{operador.nome}</strong> vai deixar de ser administrador e passar a
          operador. Escolhe o papel funcional e os assistentes autorizados.
        </p>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Papel funcional <span className="text-red-400">*</span>
          </label>
          <select
            value={papelFuncional}
            onChange={(e) => setPapelFuncional(e.target.value as PapelFuncional)}
            className="w-full h-9 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {PAPEIS_FUNCIONAIS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" /> Assistentes autorizados
          </h3>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {assistentes.map((a) => (
              <label
                key={a.uuid_publico}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{a.nome}</p>
                  <p className="text-[10px] text-muted-foreground">{a.modelo_ia}</p>
                </div>
                <Switch
                  checked={selectedAssistentes.includes(a.uuid_publico)}
                  onCheckedChange={() => toggle(a.uuid_publico)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-9 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className="flex-1 h-9 text-xs bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white"
          >
            {loading ? "A despromover…" : "Despromover"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Modal: Transferir Posse (owner) ─── */

function TransferirPosseModal({
  operadores,
  onClose,
  onDone,
}: {
  operadores: OperadorLista[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [novoOwnerUuid, setNovoOwnerUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // apenas admins podem receber a posse
  const candidatos = operadores.filter((o) => o.papel === "admin" && o.estado === "ativo");

  const submit = async () => {
    if (!novoOwnerUuid) {
      setError("Escolhe o novo proprietário (admin).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload: TransferirPosseRequest = {
        novo_owner_usuario_uuid: novoOwnerUuid,
      };
      await transferirPosse(payload);
      toast.success("Posse transferida", {
        description: "Agora és administrador e o novo proprietário controla a conta.",
      });
      onDone();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Transferir posse da conta" onClose={onClose} wide>
      <div className="space-y-4">
        {error && (
          <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Esta acção transfere a posse da conta para outro administrador. Depois
          disso, passas a administrador e perdes o controlo de gestão da equipa.
        </p>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Novo proprietário <span className="text-red-400">*</span>
          </label>
          {candidatos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Nenhum administrador elegível. Promove primeiro um operador a admin.
            </p>
          ) : (
            <select
              value={novoOwnerUuid}
              onChange={(e) => setNovoOwnerUuid(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">Seleccionar…</option>
              {candidatos.map((o) => (
                <option key={o.uuid_publico} value={o.uuid_publico}>
                  {o.nome} — {o.email}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-9 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={loading || candidatos.length === 0}
            className="flex-1 h-9 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            {loading ? "A transferir…" : "Transferir posse"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Modal genérico ─── */

function Modal({
  title,
  subtitle,
  onClose,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full p-6 z-10 max-h-[calc(100vh-20px)] overflow-y-auto ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Editar Operador — painel lateral ─── */

function EditarOperadorPanel({
  operador,
  meuPapel,
  todosOperadores,
  onClose,
  onUpdated,
}: {
  operador: OperadorLista;
  meuPapel: PapelConta;
  todosOperadores: OperadorLista[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [showDespromover, setShowDespromover] = useState(false);
  const [showTransferir, setShowTransferir] = useState(false);

  // Fix: papelFuncional com fallback ?? "secretaria"
  const [papelFuncional, setPapelFuncional] = useState<PapelFuncional>(
    operador.papel_funcional ?? "secretaria",
  );
  const [permissoes, setPermissoes] = useState<string[]>([]);

  const [assistentes, setAssistentes] = useState<Assistente[]>([]);
  const [selectedAssistentes, setSelectedAssistentes] = useState<string[]>(
    operador.assistentes_uuids ?? [],
  );

  // Flags de hierarquia
  const isMeOwner = isOwner({ papel: meuPapel });
  const isMeAltoNivel = meuPapel === "owner" || meuPapel === "admin";
  const alvoPapel: PapelConta = operador.papel;
  const podeProm = podePromover(meuPapel, alvoPapel);
  const podeDesp = podeDespromover(meuPapel, alvoPapel);
  const podeRem = podeRemoverMembro(meuPapel, alvoPapel);
  const podeTrans = podeTransferirPosse(meuPapel, alvoPapel);

  // Admin/owner vê contagem total (acesso total). Operador vê switches.
  const isAlvoAltoNivel = alvoPapel === "owner" || alvoPapel === "admin";

  const isFinanceiro = papelFuncional === "financeiro";

  useEffect(() => {
    Promise.all([
      getOperador(operador.uuid_publico).catch(() => null),
      getAssistentes().then((r) => r.dados).catch(() => [] as Assistente[]),
    ]).then(([detalhe, asts]) => {
      if (detalhe?.operador) {
        // Fix: papel_funcional pode vir null; usar fallback
        setPapelFuncional(detalhe.operador.papel_funcional ?? "secretaria");
        setSelectedAssistentes(detalhe.operador.assistentes_uuids ?? []);
        setPermissoes(detalhe.operador.permissoes ?? []);
      }
      setAssistentes(asts);
      setLoadingDetail(false);
    });
  }, [operador.uuid_publico]);

  const toggleAssistente = (id: string) =>
    setSelectedAssistentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSavePapel = async () => {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const detalhe = await updateOperadorPapel(operador.uuid_publico, {
        papel_funcional: papelFuncional,
      });
      if (detalhe.operador) {
        setPermissoes(detalhe.operador.permissoes ?? []);
      }
      setMsg("Papel actualizado. Permissões recalculadas automaticamente.");
      onUpdated();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePerms = async () => {
    if (!isFinanceiro && selectedAssistentes.length === 0) {
      setError("Seleccione pelo menos um assistente.");
      return;
    }
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const detalhe = await salvarPermissoesOperador(operador.uuid_publico, {
        papel_funcional: papelFuncional,
        assistentes_uuids: isFinanceiro ? [] : selectedAssistentes,
      });
      if (detalhe.operador) {
        setPermissoes(detalhe.operador.permissoes ?? []);
      }
      setMsg("Permissões actualizadas.");
      onUpdated();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePromover = async () => {
    if (!confirm(`Promover ${operador.nome} a administrador?`)) return;
    setLoading(true);
    try {
      await promoverOperadorAdmin(operador.uuid_publico);
      toast.success("Operador promovido", { description: `${operador.nome} é agora administrador.` });
      onUpdated();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remover este operador? Será desactivado e todas as sessões revogadas.")) return;
    setLoading(true);
    try {
      await deleteOperador(operador.uuid_publico);
      toast.success("Operador removido");
      onUpdated();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async () => {
    const motivo = prompt(`Eliminar PERMANENTEMENTE ${operador.nome}? Esta acção é irreversível. Indica o motivo:`);
    if (!motivo?.trim()) return;
    setLoading(true);
    try {
      await deleteOperadorPermanente(operador.uuid_publico, motivo.trim());
      toast.success("Operador eliminado permanentemente");
      onUpdated();
      onClose();
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-[480px] h-full bg-card border-l border-border flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{operador.nome}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <PapelContaBadge papel={operador.papel} />
                <p className="text-[10px] text-muted-foreground">{operador.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {(error || msg) && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                msg
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                  : "bg-red-500/10 border border-red-500/20 text-red-500"
              }`}
            >
              {error || msg}
            </div>
          )}

          {loadingDetail ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <>
              {/* Papel funcional (só faz sentido para operadores; admin/owner são só de leitura) */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Papel funcional{" "}
                  {isAlvoAltoNivel && (
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">
                      (só leitura — administrador/proprietário)
                    </span>
                  )}
                </h3>
                {isAlvoAltoNivel ? (
                  <p className="text-xs text-muted-foreground italic">
                    Este membro tem acesso total — não depende de papel funcional.
                  </p>
                ) : (
                  <>
                    <select
                      value={papelFuncional}
                      onChange={(e) => setPapelFuncional(e.target.value as PapelFuncional)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {PAPEIS_FUNCIONAIS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Alterar o papel recalcula as permissões. Os assistentes mantêm-se até guardar permissões.
                    </p>
                    <Button
                      onClick={handleSavePapel}
                      disabled={loading}
                      className="mt-3 h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4"
                    >
                      <Save className="w-4 h-4 mr-1.5" /> Guardar Papel
                    </Button>
                  </>
                )}
              </div>

              {/* Permissões activas */}
              {permissoes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2">Permissões activas</h3>
                  <div className="flex flex-wrap gap-1">
                    {permissoes.map((p) => (
                      <Badge key={p} variant="outline" className="text-[9px]">
                        {PERMISSAO_LABELS[p] ?? p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border" />

              {/* Assistentes */}
              {!isAlvoAltoNivel && !isFinanceiro && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" /> Assistentes autorizados
                  </h3>
                  {assistentes.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nenhum assistente disponível.</p>
                  ) : (
                    <div className="space-y-1">
                      {assistentes.map((a) => (
                        <label
                          key={a.uuid_publico}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{a.modelo_ia}</p>
                          </div>
                          <Switch
                            checked={selectedAssistentes.includes(a.uuid_publico)}
                            onCheckedChange={() => toggleAssistente(a.uuid_publico)}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={handleSavePerms}
                    disabled={loading}
                    className="mt-3 w-full h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold"
                  >
                    <Save className="w-4 h-4 mr-1.5" /> Guardar Assistentes
                  </Button>
                </div>
              )}

              {/* Owner/admin: acesso total (read-only) */}
              {isAlvoAltoNivel && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" /> Assistentes
                  </h3>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-xs font-medium text-emerald-600">
                      Todos (acesso total)
                    </p>
                  </div>
                </div>
              )}

              {/* ─── Zona de Administração ─── */}
              {isMeAltoNivel && (podeProm || podeDesp || podeTrans || podeRem) && (
                <>
                  <div className="border-t border-border" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                      <UserCog className="w-4 h-4 text-primary" /> Zona de administração
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {podeProm && (
                        <Button
                          onClick={handlePromover}
                          disabled={loading}
                          variant="outline"
                          className="w-full h-9 text-xs gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
                        >
                          <ArrowUpCircle className="w-4 h-4" /> Promover a Administrador
                        </Button>
                      )}
                      {podeDesp && (
                        <Button
                          onClick={() => setShowDespromover(true)}
                          disabled={loading}
                          variant="outline"
                          className="w-full h-9 text-xs gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                        >
                          <ArrowDownCircle className="w-4 h-4" /> Despromover a Operador
                        </Button>
                      )}
                      {podeTrans && (
                        <Button
                          onClick={() => setShowTransferir(true)}
                          disabled={loading}
                          variant="outline"
                          className="w-full h-9 text-xs gap-1.5 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700"
                        >
                          <Crown className="w-4 h-4" /> Transferir Posse
                        </Button>
                      )}
                      {podeRem && (
                        <Button
                          onClick={handleDelete}
                          disabled={loading}
                          variant="outline"
                          className="w-full h-9 text-xs gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" /> Remover Membro
                        </Button>
                      )}
                      {isMeOwner && (
                        <Button
                          onClick={handleHardDelete}
                          disabled={loading}
                          variant="outline"
                          className="w-full h-9 text-xs gap-1.5 border-red-700/40 text-red-700 hover:bg-red-700/10"
                        >
                          <Trash className="w-4 h-4" /> Eliminar Permanente
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showDespromover && (
        <DespromoverModal
          operador={operador}
          onClose={() => setShowDespromover(false)}
          onDone={onUpdated}
        />
      )}
      {showTransferir && (
        <TransferirPosseModal
          operadores={todosOperadores}
          onClose={() => setShowTransferir(false)}
          onDone={onUpdated}
        />
      )}
    </div>
  );
}

/* ─── Página Equipa ────────────────────── */

type Tab = "operadores" | "convites";

function EquipaPage() {
  const { user } = useAuth();
  const meuPapel: PapelConta = user?.papel ?? "operador";

  const [tab, setTab] = useState<Tab>("operadores");
  const [operadores, setOperadores] = useState<OperadorLista[]>([]);
  const [convites, setConvites] = useState<ConvitePendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingOp, setEditingOp] = useState<OperadorLista | null>(null);
  const [verInactivos, setVerInactivos] = useState(false);

  const fetchOperadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOperadores({ incluir_inactivos: verInactivos });
      setOperadores(result.dados);
    } catch (err) {
      setError(mensagemErro(err));
      setOperadores([]);
    } finally {
      setLoading(false);
    }
  }, [verInactivos]);

  const fetchConvites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listarConvites();
      setConvites(result.dados);
    } catch (err) {
      setError(mensagemErro(err));
      setConvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "operadores") fetchOperadores();
    else fetchConvites();
  }, [tab, fetchOperadores, fetchConvites]);

  // só owner/admin vê o botão de convidar
  const podeGerir = meuPapel === "owner" || meuPapel === "admin";

  return (
    <>
      <div className="p-4 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Equipa</h1>
              <p className="text-xs text-muted-foreground">
                {operadores.length} operador{operadores.length !== 1 ? "es" : ""} ·{" "}
                {convites.length} convite{convites.length !== 1 ? "s" : ""} pendente
                {convites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {podeGerir && tab === "operadores" && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Switch checked={verInactivos} onCheckedChange={setVerInactivos} />
                Ver inactivos
              </label>
            )}
            <button
              onClick={() => (tab === "operadores" ? fetchOperadores() : fetchConvites())}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {podeGerir && (
              <Button
                onClick={() => setShowCreate(true)}
                className="h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4 gap-1.5"
              >
                <Plus className="w-4 h-4" /> Convidar Operador
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab("operadores")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "operadores"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Operadores ({operadores.length})
          </button>
          {podeGerir && (
            <button
              onClick={() => setTab("convites")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === "convites"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Convites Pendentes ({convites.length})
            </button>
          )}
        </div>

        {tab === "operadores" && (
          <Card className="shadow-sm border-border overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar</p>
                  <p className="text-xs text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchOperadores} variant="outline" size="sm" className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                  </Button>
                </div>
              ) : operadores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Users className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Nenhum operador encontrado</p>
                  <p className="text-xs mt-1">Convide o primeiro operador.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground bg-muted/40 uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome</th>
                      <th className="px-3 py-3 font-medium">Email</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                      <th className="px-3 py-3 font-medium">Papel</th>
                      <th className="px-3 py-3 font-medium">Assistentes</th>
                      <th className="px-3 py-3 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {operadores.map((op) => {
                      const isAltoNivel = op.papel === "owner" || op.papel === "admin";
                      return (
                        <tr
                          key={op.uuid_publico}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{op.nome}</td>
                          <td className="px-3 py-3 text-muted-foreground">{op.email}</td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className={`text-[10px] border ${estadoBadge(op.estado)}`}>
                              {estadoLabel(op.estado)}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            {op.papel === "operador" ? (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  papelBadgeColor[op.papel_funcional ?? "secretaria"] ?? "bg-muted text-muted-foreground"
                                }`}
                              >
                                {op.papel_label ?? labelPapelFuncionalSafe(op.papel_funcional)}
                              </span>
                            ) : (
                              <PapelContaBadge papel={op.papel} />
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {isAltoNivel ? (
                              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                Todos (acesso total)
                              </span>
                            ) : op.papel_funcional === "financeiro" ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-foreground">
                                  {op.assistentes_uuids?.length ?? 0}
                                </span>
                                <span className="text-muted-foreground ml-1">assistente(s)</span>
                              </>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setEditingOp(op)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Editar operador"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "convites" && podeGerir && (
          <Card className="shadow-sm border-border overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar</p>
                  <p className="text-xs text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchConvites} variant="outline" size="sm" className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                  </Button>
                </div>
              ) : convites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Send className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Nenhum convite pendente</p>
                  <p className="text-xs mt-1">Todos os convites foram aceites.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground bg-muted/40 uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-3 py-3 font-medium">Papel</th>
                      <th className="px-3 py-3 font-medium">Expira em</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convites.map((c) => (
                      <tr
                        key={c.uuid_publico}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{c.email}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              papelBadgeColor[c.papel_funcional] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.papel_label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {new Date(c.expira_em).toLocaleDateString("pt-AO")}
                        </td>
                        <td className="px-3 py-3">
                          {c.usado_em ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            >
                              Aceite
                            </Badge>
                          ) : new Date(c.expira_em) < new Date() ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border bg-red-500/10 text-red-500 border-red-500/20"
                            >
                              Expirado
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] border bg-amber-500/10 text-amber-600 border-amber-500/20"
                            >
                              Pendente
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showCreate && podeGerir && (
        <CriarConvitePanel onClose={() => setShowCreate(false)} onCreated={fetchOperadores} />
      )}

      {editingOp && (
        <EditarOperadorPanel
          operador={editingOp}
          meuPapel={meuPapel}
          todosOperadores={operadores}
          onClose={() => setEditingOp(null)}
          onUpdated={fetchOperadores}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
}

function labelPapelFuncionalSafe(p: PapelFuncional | null): string {
  return PAPEIS_FUNCIONAIS.find((x) => x.value === p)?.label ?? p ?? "—";
}

export default EquipaPage;