import React, { useState } from "react";
import {
  LayoutDashboard,
  BellRing,
  Brain,
  BarChart2,
  BookUser,
  Activity,
  LayoutTemplate,
  Puzzle,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import logoSrc from "@assets/download_1780671327101.png";
import { Link, useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STORAGE_KEY = "merkron-sidebar-collapsed";

const navItems = [
  { icon: LayoutDashboard, label: "Painel",            href: "/",            description: "Visão geral do sistema" },
  { icon: BellRing,        label: "Comunicados",       href: "/comunicados", description: "Gerir comunicados" },
  { icon: Brain,           label: "Memória",           href: "/memoria",     description: "Base de conhecimento IA" },
  { icon: BarChart2,       label: "Relatórios",        href: "/relatorios",  description: "Análise e relatórios" },
  { icon: BookUser,        label: "Base de Contactos", href: "/contactos",   description: "Gestão de contactos" },
  { icon: Activity,        label: "Atividade ao Vivo", href: "/atividade",   description: "Monitorização em tempo real", live: true },
  { icon: LayoutTemplate,  label: "Templates",         href: "/templates",   description: "Modelos de comunicados" },
  { icon: Puzzle,          label: "Integrações",       href: "/integracoes", description: "Conectar ferramentas externas" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  };

  const W = collapsed ? 68 : 240;

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        willChange: "width",
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-20 sticky top-0 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center px-3 py-3.5 border-b border-sidebar-border/40 min-h-[56px]">
        <img
          src={logoSrc}
          alt="Merkron"
          className="w-7 h-7 rounded-md object-contain shrink-0"
        />
        <div
          className="overflow-hidden"
          style={{
            maxWidth: collapsed ? 0 : 180,
            opacity: collapsed ? 0 : 1,
            transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
            transitionDelay: collapsed ? "0ms, 0ms" : "60ms, 60ms",
          }}
        >
          <div className="pl-2.5 whitespace-nowrap">
            <p className="font-bold text-white text-[15px] tracking-tight leading-tight">Merkron</p>
            <p className="text-[9px] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold tracking-wide uppercase mt-0.5">
              Assistente Acadêmico
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Tooltip key={item.label} delayDuration={150} disableHoverableContent={!collapsed}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`relative flex items-center rounded-lg group overflow-hidden select-none
                    ${isActive
                      ? "bg-gradient-to-r from-primary/25 to-primary/5 text-white"
                      : "text-sidebar-foreground/55 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  style={{
                    padding: "7px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "background 180ms ease, color 180ms ease, justify-content 300ms ease",
                  }}
                >
                  {/* Active accent bar */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-primary"
                    style={{
                      width: 3,
                      height: isActive ? 20 : 0,
                      opacity: isActive ? 1 : 0,
                      transition: "height 240ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease",
                    }}
                  />

                  {/* Icon */}
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className={`shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                        : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/90"
                    }`}
                    style={{
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1), color 180ms ease",
                    }}
                  />

                  {/* Label */}
                  <div
                    className="overflow-hidden flex items-center justify-between flex-1"
                    style={{
                      maxWidth: collapsed ? 0 : 180,
                      opacity: collapsed ? 0 : 1,
                      transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                      transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                    }}
                  >
                    <span className={`ml-3 text-[13px] font-medium whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                      {item.label}
                    </span>
                    {item.live && (
                      <span className="relative flex h-1.5 w-1.5 shrink-0 ml-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={12} className="text-xs">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-muted-foreground text-[10px]">{item.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-sidebar-border/40 space-y-1">

        {/* Collapse toggle */}
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className="flex items-center w-full rounded-lg text-sidebar-foreground/45 hover:text-white hover:bg-white/[0.07] overflow-hidden"
              style={{
                padding: "6px 8px",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 180ms ease, color 180ms ease",
              }}
            >
              {collapsed
                ? <PanelLeftOpen size={16} strokeWidth={1.8} className="shrink-0" />
                : <PanelLeftClose size={16} strokeWidth={1.8} className="shrink-0" />
              }
              <div
                className="overflow-hidden"
                style={{
                  maxWidth: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                  transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                }}
              >
                <span className="ml-2.5 text-xs whitespace-nowrap">Recolher painel</span>
              </div>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={12} className="text-xs">
              Expandir painel
            </TooltipContent>
          )}
        </Tooltip>

        {/* User */}
        <div
          className="flex items-center rounded-lg hover:bg-white/[0.05] cursor-pointer overflow-hidden"
          style={{
            padding: "6px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 180ms ease",
          }}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-cyan-500/40 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">AD</span>
          </div>
          <div
            className="overflow-hidden flex items-center flex-1"
            style={{
              maxWidth: collapsed ? 0 : 160,
              opacity: collapsed ? 0 : 1,
              transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
              transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
            }}
          >
            <div className="ml-2.5 flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-white leading-tight whitespace-nowrap">Administrador</span>
              <span className="text-[9px] text-sidebar-foreground/40 whitespace-nowrap">admin@colegio.com</span>
            </div>
            <ChevronDown size={13} className="text-sidebar-foreground/35 shrink-0 ml-1" />
          </div>
        </div>

        {/* Theme */}
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center w-full rounded-lg text-sidebar-foreground/45 hover:text-white hover:bg-white/[0.07] overflow-hidden"
              style={{
                padding: "6px 8px",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 180ms ease, color 180ms ease",
              }}
            >
              {theme === "dark"
                ? <Sun size={16} strokeWidth={1.8} className="shrink-0" />
                : <Moon size={16} strokeWidth={1.8} className="shrink-0" />
              }
              <div
                className="overflow-hidden"
                style={{
                  maxWidth: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                  transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                }}
              >
                <span className="ml-2.5 text-xs whitespace-nowrap">
                  Modo {theme === "dark" ? "Claro" : "Escuro"}
                </span>
              </div>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={12} className="text-xs">
              Modo {theme === "dark" ? "Claro" : "Escuro"}
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
