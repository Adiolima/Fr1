"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground">A carregar...</span>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoadingSpinner />;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!isLoading && isAuthenticated && user?.papel !== "admin") {
      router.replace("/assistentes");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoadingSpinner />;
  if (user?.papel !== "admin") return <LoadingSpinner />;

  return <>{children}</>;
}
