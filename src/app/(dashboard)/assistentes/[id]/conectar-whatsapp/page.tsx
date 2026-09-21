"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertTriangle,
  MessageSquare,
  Phone,
  CheckCircle2,
  Wifi,
  KeyRound,
  Send,
  Info,
} from "lucide-react";
import {
  getAssistente,
  type Assistente,
} from "@/services/assistenteService";

const STEPS = [
  {
    key: "qr",
    label: "QR Code",
    desc: "Abra o WhatsApp Business no telemóvel e digitalize o QR code exibido.",
  },
  {
    key: "telefone",
    label: "Verificar telefone",
    desc: "Introduza o número de telefone associado ao WhatsApp Business.",
  },
  {
    key: "codigo",
    label: "Código de 6 dígitos",
    desc: "Insira o código recebido por SMS para confirmar a posse do número.",
  },
  {
    key: "meta",
    label: "Meta Business",
    desc: "Ligue a conta WABA (WhatsApp Business API) via Meta for Developers.",
  },
];

export default function ConectarWhatsAppPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const uid = id ?? "";

  const [assistente, setAssistente] = useState<Assistente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAssistente(uid);
      setAssistente(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.erro ||
          err?.message ||
          "Erro ao carregar assistente.",
      );
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error && !assistente) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-foreground">Erro ao carregar</p>
        <p className="text-xs text-muted-foreground text-center">{error}</p>
        <Button onClick={fetch} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
        </Button>
      </div>
    );
  }

  if (!assistente) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Assistente não encontrado ({uid}).
        </p>
        <Button
          onClick={() => router.push("/assistentes")}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Assistentes
        </Button>
      </div>
    );
  }

  const isSemConexao =
    !assistente.conexao ||
    assistente.conexao.status === "sem_conexao" ||
    assistente.conexao_status === "sem_conexao";

  return (
    <div className="max-w-[720px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() => router.push(`/assistentes/${uid}`)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o assistente
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Conectar WhatsApp — {assistente.nome}
          </h1>
          <p className="text-xs text-muted-foreground">
            Ligue o assistente ao WhatsApp Business para o activar.
          </p>
        </div>
      </div>

      {/* Status banner */}
      {isSemConexao && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">
              Sem conexão WhatsApp
            </p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              O assistente ainda não está ligado a um número. Siga os passos
              abaixo para o activar.
            </p>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((s, i) => {
          const Icon =
            s.key === "qr"
              ? KeyRound
              : s.key === "telefone"
                ? Phone
                : s.key === "codigo"
                  ? CheckCircle2
                  : Wifi;
          return (
            <Card key={s.key} className="shadow-sm">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Passo {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {s.label}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {s.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA disabled */}
      <Button
        disabled
        className="w-full h-11 text-sm mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold gap-1.5 opacity-60 cursor-not-allowed border-0"
      >
        <Send className="w-4 h-4" /> Iniciar conexão
      </Button>
      <p className="text-[11px] text-muted-foreground text-center mt-2">
        A ligação directa estará disponível em breve. Contacte o suporte para
        activar manualmente.
      </p>

      {/* Info card */}
      <Card className="shadow-sm mt-6 bg-muted/20">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">
              O que acontece depois?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>O assistente fica online e responde a mensagens automaticamente.</li>
              <li>Poderá enviar comunicados em massa via WhatsApp.</li>
              <li>Toda a comunicação fica registada na memória do assistente.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer back button */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(`/assistentes/${uid}`)}
          className="h-9 text-sm gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao assistente
        </Button>
        <Badge variant="outline" className="text-[10px] gap-1">
          <MessageSquare className="w-3 h-3" />
          {assistente.conexao_numero || "sem número"}
        </Badge>
      </div>
    </div>
  );
}
