export type PapelConta = "owner" | "admin" | "operador";
export type PapelFuncional = "secretaria" | "coordenador" | "dp" | "financeiro";
export type EstadoUsuario = "ativo" | "suspenso" | "inativo";

export const PAPEIS_FUNCIONAIS: {
  value: PapelFuncional;
  label: string;
  descricao: string;
}[] = [
  {
    value: "secretaria",
    label: "Secretaria",
    descricao: "Gere conversas, contactos, comunicados e memórias.",
  },
  {
    value: "coordenador",
    label: "Coordenador",
    descricao: "Supervisiona, aprova e consulta relatórios.",
  },
  {
    value: "dp",
    label: "Director Pedagógico",
    descricao: "Mesmo que coordenador, com permissões especiais.",
  },
  {
    value: "financeiro",
    label: "Financeiro",
    descricao: "Acesso apenas a facturas, pagamentos e consumo.",
  },
];

export const PERMISSAO_LABELS: Record<string, string> = {
  gerir_contactos: "Gerir contactos",
  ver_contactos: "Ver contactos",
  gerir_estrutura_escolar: "Gerir estrutura escolar",
  gerir_definicoes_base: "Gerir definições da base",
  ver_conversas: "Ver conversas",
  responder_conversas: "Responder conversas",
  gerir_comunicados: "Gerir comunicados",
  ver_comunicados: "Ver comunicados",
  gerir_memorias: "Gerir memórias",
  ver_memorias: "Ver memórias",
  ver_assistente: "Ver assistente",
  ver_templates: "Ver templates",
  ver_relatorios: "Ver relatórios",
  ver_financeiro: "Ver financeiro",
  gerir_financeiro: "Gerir financeiro",
};

export interface OperadorPerfil {
  uuid_publico: string;
  papel_funcional: PapelFuncional;
  papel_label: string;
  ativo: boolean;
  permissoes: string[];
  assistentes_uuids: string[];
  criado_em: string;
}

export interface OperadorLista {
  uuid_publico: string;
  operador_uuid: string | null;
  papel: PapelConta;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  papel_funcional: PapelFuncional | null;
  papel_label: string | null;
  assistentes_uuids: string[];
  estado: EstadoUsuario;
  ativo: boolean;
  email_verificado: boolean;
  ultimo_login: string | null;
  criado_em: string;
}

export interface OperadorDetalhe {
  uuid_publico: string;
  papel: PapelConta;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  estado: EstadoUsuario;
  email_verificado: boolean;
  ultimo_login: string | null;
  operador: OperadorPerfil | null;
}

export interface CriarConviteRequest {
  email: string;
  papel_funcional: PapelFuncional;
  assistentes_uuids: string[];
}

export interface AceitarConviteRequest {
  nome: string;
  password: string;
}

export interface ConvitePublico {
  uuid_publico: string;
  email: string;
  empresa_nome: string;
  empresa_slug: string | null;
  papel_funcional: PapelFuncional;
  papel_label: string;
  expira_em: string;
}

export interface ConvitePendente {
  uuid_publico: string;
  email: string;
  papel_funcional: PapelFuncional;
  papel_label: string;
  expira_em: string;
  criado_em?: string;
  usado_em?: string | null;
}

export function labelPapelFuncional(papel: string | undefined | null): string {
  const found = PAPEIS_FUNCIONAIS.find((p) => p.value === papel);
  return found?.label ?? papel ?? "—";
}

export function isAdmin(user: { papel?: PapelConta } | null | undefined): boolean { return user?.papel === "admin" || user?.papel === "owner"; }

/**
 * Mapeamento de permissões por papel funcional (v6).
 * Usado como fallback quando o backend não envia `operador.permissoes`.
 */
export const PERMISSOES_POR_PAPEL: Record<PapelFuncional, string[]> = {
  secretaria: [
    "gerir_estrutura_escolar", "ver_contactos", "gerir_contactos", "gerir_definicoes_base",
    "ver_assistente", "ver_templates", "ver_memorias", "gerir_memorias",
    "ver_comunicados", "gerir_comunicados", "ver_conversas", "responder_conversas",
  ],
  coordenador: [
    "ver_contactos", "ver_assistente", "ver_templates", "ver_memorias", "gerir_memorias",
    "ver_comunicados", "ver_conversas", "ver_relatorios",
  ],
  dp: [
    "ver_contactos", "ver_assistente", "ver_templates", "ver_memorias", "gerir_memorias",
    "ver_comunicados", "ver_conversas", "ver_relatorios",
  ],
  financeiro: [
    "ver_financeiro", "gerir_financeiro",
  ],
};

/**
 * Devolve as permissões efectivas do utilizador.
 * Se `operador.permissoes` existir, usa-o. Caso contrário, deriva do `papel_funcional`.
 */
export function obterPermissoes(user: { papel?: PapelConta; operador?: OperadorPerfil | null; papel_funcional?: PapelFuncional | null } | null | undefined): string[] {
  if (!user) return [];
  if (user.papel === "admin" || user.papel === "owner") {
    return Object.values(PERMISSOES_POR_PAPEL).flat();
  }
  if (user.operador?.permissoes && user.operador.permissoes.length > 0) {
    return user.operador.permissoes;
  }
  // Fallback: derivar do papel_funcional (pode vir no operador OU directamente no user)
  const pf = user.operador?.papel_funcional ?? user.papel_funcional;
  if (pf && pf in PERMISSOES_POR_PAPEL) {
    return PERMISSOES_POR_PAPEL[pf];
  }
  return [];
}

/** Admin/Owner têm acesso total. Operador usa permissoes do perfil OU derivadas do papel_funcional. */
export function temPermissao(
  user: { papel?: PapelConta; operador?: OperadorPerfil | null } | null | undefined,
  permissao: string,
): boolean {
  if (!user) return false;
  if (user.papel === "admin" || user.papel === "owner") return true;
  return obterPermissoes(user).includes(permissao);
}

export function temAssistente(
  user: { papel?: PapelConta; operador?: OperadorPerfil | null } | null | undefined,
  uuid: string,
): boolean {
  if (!user) return false;
  if (user.papel === "admin" || user.papel === "owner") return true;
  return user.operador?.assistentes_uuids?.includes(uuid) ?? false;
}

export function labelPapelConta(p: any) { if (p === "owner") return "Proprietário"; if (p === "admin") return "Administrador"; if (p === "operador") return "Operador"; return "—"; }
export function isOwner(u: any) { return u?.papel === "owner"; }
export function podeGerirEquipa(p: any) { return p === "owner" || p === "admin"; }
export function podePromover(m: any, a: any) { return (m === "owner" || m === "admin") && a === "operador"; }
export function podeDespromover(m: any, a: any) { if (a === "owner") return false; if (a === "admin") return m === "owner"; return false; }
export function podeRemoverMembro(m: any, a: any) { if (a === "owner") return false; if (a === "admin") return m === "owner"; return m === "owner" || m === "admin"; }
export function podeTransferirPosse(m: any, a: any) { return m === "owner" && a === "admin"; }
export interface TransferirPosseRequest { novo_owner_usuario_uuid: string; }
export interface DespromoverOperadorRequest { papel_funcional: PapelFuncional; assistentes_uuids: string[]; }
export interface HardDeleteRequest { motivo: string; }
