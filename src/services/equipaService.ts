import api from "@/lib/api";
import type { CriarConviteRequest, ConvitePublico, ConvitePendente, OperadorDetalhe, OperadorLista, PapelFuncional, DespromoverOperadorRequest, TransferirPosseRequest } from "@/lib/papeis";
export interface Paginacao { total: number; pagina: number; por_pagina: number; total_paginas: number; }
export type { OperadorLista, OperadorDetalhe, ConvitePublico, ConvitePendente };
export async function getOperadores(params?: { pagina?: number; por_pagina?: number; incluir_inactivos?: boolean; }): Promise<{ dados: OperadorLista[]; paginacao: Paginacao }> { const { data } = await api.get("/equipa", { params }); return { dados: data.dados ?? data, paginacao: data.paginacao }; }
export async function getOperador(uid: string): Promise<OperadorDetalhe> { const { data } = await api.get(`/equipa/${uid}`); return data.dados ?? data; }
export async function criarConvite(payload: CriarConviteRequest): Promise<{ uuid_publico: string; email: string; papel_funcional: PapelFuncional; papel_label: string; expira_em: string }> { const { data } = await api.post("/equipa", payload); return data.dados ?? data; }
export async function listarConvites(params?: { pagina?: number; por_pagina?: number }): Promise<{ dados: ConvitePendente[]; paginacao: Paginacao }> { const { data } = await api.get("/equipa/convites", { params }); return { dados: data.dados ?? data, paginacao: data.paginacao }; }
export async function getConvitePublico(token: string): Promise<ConvitePublico> { const { data } = await api.get(`/equipa/convites/${token}`); return data.dados ?? data; }
export async function aceitarConvite(token: string, payload: { nome: string; password: string }) { const { data } = await api.post(`/equipa/convites/${token}/aceitar`, payload); return data.dados ?? data; }
export async function reactivacaoDefinirPassword(token: string, payload: { nova_password: string }): Promise<void> { await api.post(`/equipa/reactivacao/${token}/definir-password`, payload); }
export async function updateOperadorPapel(uid: string, payload: { papel_funcional: PapelFuncional }): Promise<OperadorDetalhe> { const { data } = await api.patch(`/equipa/${uid}`, payload); return data.dados ?? data; }
export async function promoverOperadorAdmin(uid: string): Promise<{ uuid_publico_usuario: string }> { const { data } = await api.patch(`/equipa/${uid}/promover-admin`); return data.dados ?? data; }
export async function despromoverOperador(uid: string, payload: DespromoverOperadorRequest): Promise<{ uuid_publico_usuario: string }> { const { data } = await api.patch(`/equipa/${uid}/despromover-operador`, payload); return data.dados ?? data; }
export async function transferirPosse(payload: TransferirPosseRequest): Promise<{ uuid_publico_usuario: string }> { const { data } = await api.patch(`/equipa/transferir-posse`, payload); return data.dados ?? data; }
export async function setPermissoes(uid: string, payload: { papel_funcional: PapelFuncional; assistentes_uuids: string[] }): Promise<OperadorDetalhe> { const { data } = await api.put(`/equipa/${uid}/permissoes`, payload); return data.dados ?? data; }
export async function deleteOperador(uid: string): Promise<void> { await api.delete(`/equipa/${uid}`); }
export async function deleteOperadorPermanente(uid: string, motivo: string): Promise<void> { await api.delete(`/equipa/${uid}/permanente`, { data: { motivo } }); }
