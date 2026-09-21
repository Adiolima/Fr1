"use client";
import { AdminRoute } from "@/components/auth/protected-route";
export default function PainelLayout({ children }: { children: React.ReactNode }) { return <AdminRoute>{children}</AdminRoute>; }
