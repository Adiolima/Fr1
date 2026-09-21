"use client";

import React from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function PageState({
  loading,
  error,
  onRetry,
  empty,
  emptyMessage = "Nenhum dado encontrado.",
  children,
}: PageStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">A carregar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-foreground">Erro ao carregar</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-2 gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
