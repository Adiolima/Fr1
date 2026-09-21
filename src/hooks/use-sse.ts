"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";

export type SSEEvento =
  | { tipo: "nova_mensagem"; assistente_id: string; contacto_tipo: string; preview: string }
  | { tipo: "resposta_enviada"; assistente_id: string; conversa_id: string }
  | { tipo: "digitando"; assistente_id: string; conversa_id: string; valor: boolean }
  | { tipo: "trial_expirado"; assistente_id: string }
  | { tipo: "trial_limite_proximo"; assistente_id: string; interacoes_restantes: number }
  | { tipo: "comunicado_concluido"; comunicado_id: string; tci_pct: number }
  | { tipo: "qualidade_caiu"; assistente_id: string; tr_anterior: number; tr_actual: number }
  | { tipo: "lacuna_detectada"; assistente_id: string; tipo_informacao: string; total: number };

type EventHandler = (evento: SSEEvento) => void;

export function useSSE(onEvent: EventHandler) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const url = `/api/v1/eventos?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvento;
        onEventRef.current(data);
      } catch {
        // Ignora eventos mal formatados
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      // Reconectar após 5 segundos
      reconnectTimeout.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);
}
