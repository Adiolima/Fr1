"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Brain,
  BookUser,
  CreditCard,
  Users,
  Receipt,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import logoSrc from "@/assets/logo.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isAdmin, temPermissao } from "@/lib/papeis";

const STORAGE_KEY = "merkron-sidebar-collapsed";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
  adminOnly?: boolean;
  permissao?: string;
  matchPaths?: string[];
}

const allNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Painel",              href: "/painel",          description: "Visão geral do sistema", adminOnly: true },
  { icon: Brain,           label: "Assistente Académico", href: "/assistentes",     description: "Assistentes académicos", matchPaths: ["/assistentes", "/assistente-academico"] },
  { icon: CreditCard,      label: "Planos",              href: "/planos",          description: "Planos de subscrição", adminOnly: true },
  { icon: Users,           label: "Equipa",              href: "/equipa",          description: "Gestão de operadores", adminOnly: true },
  { icon: Receipt,         label: "Pagamentos",          href: "/pagamentos",      description: "Histórico de pagamentos", adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = allNavItems.filter((item) => {
    if (item.adminOnly) return isAdmin(user);
    if (item.permissao) return temPermissao(user, item.permissao);
    return true;
  });

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const empresaNome = "Merkron";

  const W = collapsed ? 68 : 240;

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        willChange: "width",
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="h-screen bg-white text-gray-900 flex flex-col border-r border-gray-200 z-20 sticky top-0 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div
        className="flex items-center py-3.5 border-b border-gray-100 min-h-[56px]"
        style={{
          justifyContent: collapsed ? "center" : "flex-start",
          paddingLeft: collapsed ? undefined : 12,
          paddingRight: collapsed ? undefined : 12,
          transition: "justify-content 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <img
          src={logoSrc.src}
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
            <p className="font-bold text-gray-900 text-[15px] tracking-tight leading-tight truncate">{empresaNome}</p>
            <p className="text-[9px] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold tracking-wide uppercase mt-0.5">
              Assistente Académico
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = item.matchPaths
            ? item.matchPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
            : pathname === item.href;
          return (
            <Tooltip key={item.label} delayDuration={150} disableHoverableContent={!collapsed}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`relative flex items-center rounded-lg group overflow-hidden select-none
                    ${isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
                        ? "text-purple-600"
                        : "text-gray-400 group-hover:text-gray-600"
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
                    <span className={`ml-3 text-[13px] font-medium whitespace-nowrap ${isActive ? "text-purple-700" : ""}`}>
                      {item.label}
                    </span>
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
      <div className="px-2 py-3 border-t border-gray-100 space-y-1">
        {/* Collapse toggle */}
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className="flex items-center w-full rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 overflow-hidden"
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
        <Link
          href="/perfil"
          className="flex items-center rounded-lg hover:bg-gray-50 cursor-pointer overflow-hidden"
          style={{
            padding: "6px 8px",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 180ms ease",
          }}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border border-gray-200 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">
              {user?.nome?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div
            className="overflow-hidden flex flex-col flex-1"
            style={{
              maxWidth: collapsed ? 0 : 160,
              opacity: collapsed ? 0 : 1,
              transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
              transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
            }}
          >
            <div className="ml-2.5 min-w-0">
              <span className="text-xs font-semibold text-gray-900 leading-tight whitespace-nowrap block truncate">
                {user?.nome ?? "Utilizador"}
              </span>
              <span className="text-[9px] text-gray-400 whitespace-nowrap block truncate">
                {user?.email ?? ""}
              </span>
            </div>
          </div>
        </Link>

        {/* Logout */}
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex items-center w-full rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 overflow-hidden"
              style={{
                padding: "6px 8px",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 180ms ease, color 180ms ease",
              }}
            >
              <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
              <div
                className="overflow-hidden"
                style={{
                  maxWidth: collapsed ? 0 : 160,
                  opacity: collapsed ? 0 : 1,
                  transition: "max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease",
                  transitionDelay: collapsed ? "0ms, 0ms" : "70ms, 70ms",
                }}
              >
                <span className="ml-2.5 text-xs whitespace-nowrap">Sair</span>
              </div>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={12} className="text-xs">
              Sair
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
