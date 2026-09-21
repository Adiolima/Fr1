"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTrialCountdown } from "@/hooks/use-trial-countdown";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  status: "trial";
  trial_termina_em?: string;
  trial_interacoes_restantes?: number;
  trial_comunicados_restantes?: number;
  onSubscribe?: () => void;
}

export function TrialBanner({
  trial_termina_em,
  trial_interacoes_restantes,
  trial_comunicados_restantes,
  onSubscribe,
}: TrialBannerProps) {
  const countdown = useTrialCountdown(trial_termina_em ?? null);
  const isUrgent = (trial_interacoes_restantes ?? 99) <= 3;

  return (
    <div
      className={cn(
        "px-4 py-2.5 rounded-xl flex items-center justify-between text-sm border transition-colors",
        isUrgent
          ? "bg-[#1A1A2E] border-[#FF6B6B]"
          : "bg-[#1A1A2E] border-[#FFB347]",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles
          className={cn(
            "w-4 h-4 shrink-0",
            isUrgent ? "text-[#FF6B6B] animate-pulse" : "text-[#FFB347]",
          )}
        />
        <span className="font-medium text-white whitespace-nowrap">Trial activo</span>
        {countdown && !countdown.expirado && (
          <span className="text-gray-400 truncate">
            — termina em {countdown.formatted}
          </span>
        )}
        {countdown?.expirado && (
          <span className="text-[#FF6B6B] font-medium">— Expirado</span>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <span>
            Interacções:{" "}
            <strong className={cn(isUrgent && "text-[#FF6B6B] animate-pulse")}>
              {trial_interacoes_restantes ?? "—"}/15
            </strong>
          </span>
          <span>
            Comunicados:{" "}
            <strong className="text-white">
              {trial_comunicados_restantes ?? "—"}/15
            </strong>
          </span>
        </div>
        <Button
          onClick={onSubscribe}
          className="h-7 text-xs bg-[#FFB347] hover:bg-[#FFB347]/90 text-black font-semibold px-3 cursor-pointer border-0"
        >
          Subscrever Agora →
        </Button>
      </div>
    </div>
  );
}
