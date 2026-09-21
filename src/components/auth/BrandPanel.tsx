"use client";

import React from "react";
import { Sparkles, BookUser } from "lucide-react";
import logoSrc from "@/assets/logo.png";

/**
 * Painel de marca exibido no lado esquerdo dos ecrãs de autenticação.
 * Fundo transparente — o gradiente/blur é desenhado pelo AuthShell.
 */
export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 xl:p-16">
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo + nome */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src={logoSrc.src}
            alt="Merkron"
            className="w-11 h-11 rounded-xl object-contain"
          />
          <div>
            <p className="text-[22px] font-bold text-white leading-none tracking-tight">
              Merkron
            </p>
            <p className="text-[11px] text-white/40 mt-1 tracking-wide">
              Infraestrutura de Comunicação Académica
            </p>
          </div>
        </div>

        {/* Badge com dot pulsante */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            Plataforma SaaS · Angola
          </span>
        </div>

        {/* Headline com gradiente */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white mb-4">
            A infraestrutura que{" "}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              unifica a sua escola
            </span>
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Uma única plataforma para todos os contactos, assistentes IA e
            comunicação com encarregados e alunos.
          </p>

          {/* Feature rows */}
          <div className="mt-10 space-y-4">
            <FeatureRow
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
              title="Assistentes IA"
              desc="Atendimento automático via WhatsApp, 24h por dia."
            />
            <FeatureRow
              icon={<BookUser className="w-4 h-4 text-cyan-400" />}
              title="Base de Contactos"
              desc="Alunos, encarregados, professores e funcionários num só lugar."
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-[11px] mt-10">
          &copy; {new Date().getFullYear()} Merkron. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-[12px] text-white/50 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

export default BrandPanel;
