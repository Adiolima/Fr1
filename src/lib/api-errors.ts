export class ApiError extends Error {
  constructor(
    public codigo: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: {
      codigo?: string;
      erro?: string | { codigo?: string; mensagem?: string };
      mensagem?: string;
      message?: string;
    };
  };
  message?: string;
};

export function parseApiError(err: unknown): ApiError {
  const ax = err as AxiosLikeError;
  const data = ax.response?.data;
  const rawErro = data?.erro;

  let codigo =
    data?.codigo ??
    (typeof rawErro === "object" && rawErro?.codigo ? rawErro.codigo : undefined) ??
    "ERRO_DESCONHECIDO";

  let message =
    (typeof rawErro === "string" ? rawErro : undefined) ??
    (typeof rawErro === "object" ? rawErro?.mensagem : undefined) ??
    data?.mensagem ??
    data?.message ??
    ax.message ??
    "Erro inesperado";

  return new ApiError(codigo, message, ax.response?.status ?? 500);
}

export const ERRO_MESSAGES: Record<string, string> = {
  CONVITE_NAO_EXISTE: "Convite inválido.",
  CONVITE_ACEITE: "Este convite já foi aceite.",
  CONVITE_EXPIRADO: "Este convite expirou.",
  CONVITE_CANCELADO: "Este convite foi cancelado.",
  CONVITE_PENDENTE_EXISTENTE: "Já existe um convite pendente para este email.",
  EMAIL_JA_USUARIO: "Este email já está registado.",
  PASSWORD_FRACA: "A password não cumpre os requisitos de segurança.",
  PAPEL_FUNCIONAL_INVALIDO: "Papel funcional inválido.",
  ASSISTENTES_OBRIGATORIOS: "Seleccione pelo menos um assistente.",
  ASSISTENTE_NAO_EXISTE: "Assistente não encontrado.",
  PERMISSAO_NEGADA: "Não tem permissão para esta acção.",
  USUARIO_NAO_OPERADOR: "Utilizador não é operador.",
  TENANT_VIOLACAO: "Operador não pertence à sua escola.",
  OPERADOR_NAO_EXISTE: "Operador não encontrado.",
  CREDENCIAIS_INVALIDAS: "Email ou password incorrectos.",
  CONTA_INACTIVA: "Conta suspensa. Contacte o administrador.",
  EMAIL_NAO_VERIFICADO: "Email ainda não verificado.",
  NAO_STAFF: "Este login é exclusivo para staff Merkron.",
  EMAIL_JA_STAFF: "Este email já está registado como staff.",
  OWNER_NAO_REMOVIDO: "O proprietário da conta não pode ser removido.",
  OWNER_NAO_DESPROMOVIDO: "O proprietário da conta não pode ser despromovido. Transfira a posse primeiro.",
  ADMIN_REMOVE_ADMIN_NEGADO: "Apenas o proprietário da conta pode remover outro administrador.",
  ADMIN_DESPROMOVE_ADMIN_NEGADO: "Apenas o proprietário da conta pode despromover outro administrador.",
  JA_EH_OPERADOR: "Este usuário já é operador.",
  SO_PROMOVER_OPERADORES: "Só é possível promover operadores a administrador.",
  TRANSFERIR_PARA_ADMIN: "Só é possível transferir a posse para um administrador existente.",
  TRANSFERIR_SI_MESMO: "Não pode transferir a posse para si mesmo.",
};

export function mensagemErro(err: unknown): string {
  const apiErr = parseApiError(err);
  return ERRO_MESSAGES[apiErr.codigo] ?? apiErr.message;
}
