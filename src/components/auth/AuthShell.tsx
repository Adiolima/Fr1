"use client";

import React from "react";
import { BrandPanel } from "@/components/auth/BrandPanel";

/**
 * Shell partilhado pelos ecrãs de autenticação.
 * Fornece fundo escuro com gradientes, camadas de blur e grelha.
 * Contém o BrandPanel à esquerda e children (formulário) à direita.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#070713]">
      {/* Camada de gradiente */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #0a0a1f 0%, #0d0a20 50%, #081218 100%)",
        }}
      />

      {/* Camadas de blur decorativas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-fuchsia-500/10 blur-[80px]" />
      </div>

      {/* Grelha overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Conteúdo */}
      <BrandPanel />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        {children}
      </div>
    </div>
  );
}

export default AuthShell;
