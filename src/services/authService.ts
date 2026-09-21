import api from "@/lib/api";
import type { User } from "@/lib/auth-store";

export const authService = {
  async login(email: string, password: string, empresa_slug: string) {
    const { data } = await api.post("/auth/login", { email, password, empresa_slug });
    return data.dados as { access_token: string; usuario: User };
  },

  async register(dados: {
    escola: { nome: string; slug: string; email: string; telefone: string; nif: string };
    administrador: { nome: string; email: string; password: string };
  }) {
    const { data } = await api.post("/empresas", dados);
    return data.dados;
  },

  async verifyEmail(email: string, codigo: string) {
    const { data } = await api.post("/auth/verify-email", { email, codigo });
    return data.dados as { access_token: string; usuario: User };
  },

  async resendVerification(email: string) {
    await api.post("/auth/resend-verification", { email });
  },

  async forgotPassword(email: string) {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(email: string, codigo: string, nova_password: string) {
    await api.post("/auth/reset-password", { email, codigo, nova_password });
  },
};
