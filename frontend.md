# Merkron Academica — Documentação do Frontend

> **Plataforma de Comunicação Escolar** — Conecta escolas, alunos, professores e encarregados com assistentes IA, gestão de contactos, estrutura escolar e pagamentos.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Projeto](#3-arquitetura-do-projeto)
4. [Sistema de Roteamento](#4-sistema-de-roteamento)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Estado Global (Zustand)](#6-estado-global-zustand)
7. [Data Fetching (TanStack Query + Axios)](#7-data-fetching-tanstack-query--axios)
8. [Sistema de Design (shadcn/ui + Tailwind)](#8-sistema-de-design-shadcnui--tailwind)
9. [Funcionalidades por Página](#9-funcionalidades-por-página)
10. [Serviços (API Layer)](#10-serviços-api-layer)
11. [Fluxo de Dados Completo](#11-fluxo-de-dados-completo)
12. [Diagnóstico: Estado Atual da UX](#12-diagnóstico-estado-atual-da-ux)
13. [Plano de UX Monstruosa](#13-plano-de-ux-monstruosa)

---

## 1. Visão Geral

O **Merkron Academica** é uma plataforma SaaS para gestão escolar em Angola. Permite que escolas:

- **Gerenciem contactos** de alunos, professores, encarregados e funcionários.
- **Configurem a sua estrutura escolar** com cursos, classes, turnos e turmas.
- **Utilizem assistentes académicos com IA** para automatizar comunicação.
- **Controlem acessos da equipa** com papéis (admin/operador) e permissões granulares.
- **Façam a gestão de planos e pagamentos** de subscrição.

O frontend é uma **Single Page Application (SPA)** construída com **Next.js 15 (App Router)**, com renderização híbrida (server + client components) e comunicação com uma API REST em `localhost:8000`.

---

## 2. Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | Next.js (App Router) | 15.3+ |
| Linguagem | TypeScript | 5.8 |
| UI Library | React | 19.1 |
| Styling | Tailwind CSS v4 | 4.1 |
| Componentes | shadcn/ui (New York style) | latest |
| Ícones | Lucide React + React Icons | 0.487 / 5.4 |
| Estado Global | Zustand | 5.0 |
| Data Fetching | TanStack React Query | 5.71 |
| HTTP Client | Axios | 1.7 |
| Formulários | React Hook Form + Zod | 7.55 / 3.24 |
| Animações | Framer Motion | 11.18 |
| Gráficos | Recharts | 2.15 |
| Temas | next-themes | 0.4 |
| Notificações | Sonner | 2.0 |
| Datas | date-fns | 3.6 |
| Carrossel | Embla Carousel | 8.6 |

---

## 3. Arquitetura do Projeto

```
src/
├── app/                          # Next.js App Router (páginas e layouts)
│   ├── layout.tsx                # Root layout (html, body, metadata, providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── providers.tsx             # Client providers (QueryClient, Theme, Auth, Tooltip)
│   ├── globals.css               # Tailwind v4 + CSS custom properties (tema)
│   ├── (auth)/                   # Route group: autenticação
│   │   ├── layout.tsx            # Layout de auth (metadata)
│   │   ├── login/page.tsx        # Página de login
│   │   └── register/page.tsx     # Página de registo (4 passos)
│   └── (dashboard)/              # Route group: dashboard (protegido)
│       ├── layout.tsx            # Layout com ProtectedRoute + AppShell
│       ├── painel/page.tsx       # Painel principal (placeholder)
│       ├── assistentes/
│       │   ├── page.tsx          # Lista de assistentes (placeholder)
│       │   └── [id]/page.tsx     # Detalhe do assistente
│       ├── base-contactos/
│       │   ├── page.tsx          # Lista de bases + modal de criação (2 passos)
│       │   └── [id]/page.tsx     # Detalhe da base (3 tabs: contactos, estrutura, definições)
│       ├── planos/page.tsx       # Planos de subscrição (placeholder)
│       ├── equipa/page.tsx       # Gestão de operadores e convites
│       ├── pagamentos/page.tsx   # Histórico de pagamentos (placeholder)
│       └── perfil/page.tsx       # Perfil do utilizador + permissões
├── components/
│   ├── ui/                       # 55 componentes shadcn/ui base
│   ├── layout/
│   │   ├── AppShell.tsx          # Shell principal (Sidebar + conteúdo)
│   │   ├── Sidebar.tsx           # Sidebar colapsável com navegação
│   │   └── theme-provider.tsx    # Provider de tema (next-themes)
│   ├── auth/
│   │   ├── auth-provider.tsx     # Contexto de autenticação (AuthContext)
│   │   └── protected-route.tsx   # Guards: ProtectedRoute + AdminRoute
│   ├── landing/
│   │   └── LandingContent.tsx    # Landing page completa
│   └── page-state.tsx            # Componente de estados (loading, error, empty)
├── lib/
│   ├── api.ts                    # Configuração do Axios + interceptors
│   ├── auth-store.ts             # Zustand store de autenticação
│   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
├── hooks/
│   ├── use-api.ts                # Hook genérico de API (loading/error/data)
│   ├── use-mobile.tsx            # Hook de detecção de mobile
│   └── use-toast.ts              # Hook de toast (legacy)
├── services/                     # 10 serviços de API
│   ├── authService.ts            # Login, registo, verificação, reset password
│   ├── baseContactosService.ts   # CRUD de bases de contacto
│   ├── contactosService.ts       # CRUD de contactos + import CSV
│   ├── contactoService.ts        # Serviço auxiliar de contacto
│   ├── assistenteService.ts      # Listagem de assistentes
│   ├── estruturaEscolarService.ts # Cursos, classes, turnos, turmas, alunos, encarregados
│   ├── empresaService.ts         # Dados da empresa
│   ├── equipaService.ts          # Operadores, convites, permissões
│   ├── usuarioService.ts         # Perfil do utilizador, change password
│   └── billingService.ts         # Planos
└── assets/
    └── logo.png                  # Logo da Merkron
```

### Padrões Arquiteturais

- **Client Components por padrão**: Todas as páginas usam `"use client"` (não há RSC fora dos layouts).
- **Route Groups**: `(auth)` e `(dashboard)` organizam as rotas sem afetar a URL.
- **Services Layer**: Cada domínio tem o seu service, que encapsula as chamadas à API.
- **Componentes Compostos**: Modais e painéis laterais são definidos localmente na página que os utiliza.
- **Props Drilling Controlado**: Auth state desce via Context; dados de página sobem via fetch local.

---

## 4. Sistema de Roteamento

```
/                          → LandingPage (LandingContent)
/login                     → LoginPage
/register                  → RegisterPage (4 passos: empresa → admin → confirmar → verificação)
/painel                    → PainelPage (placeholder)
/assistentes               → AssistentesPage (placeholder)
/assistentes/[id]          → Detalhe do assistente
/base-contactos            → BaseContactosPage (lista + modal criar)
/base-contactos/[id]       → Detalhe da base (tabs: contactos | estrutura | definições)
/planos                    → PlanosPage (placeholder)
/equipa                    → EquipaPage (operadores + convites)
/pagamentos                → PagamentosPage (placeholder)
/perfil                    → PerfilPage (dados + password + permissões)
```

### Proteção de Rotas

- **`ProtectedRoute`**: Redireciona para `/login` se não autenticado.
- **`AdminRoute`**: Redireciona para `/assistentes` se o papel não for `"admin"`.
- O layout `(dashboard)` aplica `ProtectedRoute` globalmente.
- Páginas individuais (ex: `/equipa`) têm `layout.tsx` com `AdminRoute`.

---

## 5. Autenticação e Autorização

### Fluxo de Autenticação

```
1. Login: POST /api/v1/auth/login/ { email, password, empresa_slug }
   ↓
2. Resposta: { access_token, usuario } → Zustand store (setAuth)
   ↓
3. Access token vai no header Authorization: Bearer <token>
   ↓
4. Refresh automático: POST /api/v1/auth/refresh/ (cookie HttpOnly)
   ↓
5. Logout: POST /api/v1/auth/logout/ → clearAuth()
```

### Refresh Token (Fila de Requisições)

O interceptor de resposta do Axios implementa:

- **Fila de refresh**: Se múltiplas requisições recebem 401 simultaneamente, só uma dispara o refresh; as outras aguardam na fila.
- **Token revogado**: Código `TOKEN_REVOGADO` força logout imediato.
- **Fallback para fetch nativo**: O refresh usa `fetch()` nativo para maior fiabilidade com cookies HttpOnly.

### Papéis (Roles)

| Papel | Permissões |
|-------|-----------|
| `admin` | Acesso total: painel, planos, equipa, pagamentos, todas as bases/assistentes |
| `operador` | Acesso restrito: assistentes e bases atribuídos pelo admin |

### Inicialização da Sessão

O `AuthProvider` chama `/api/v1/auth/refresh/` no `useEffect` inicial para verificar se há uma sessão ativa (cookie HttpOnly). Se o refresh falhar, o estado é `isLoading: false, isAuthenticated: false`.

---

## 6. Estado Global (Zustand)

### `useAuthStore` (`lib/auth-store.ts`)

```typescript
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token, user) => void;
  setToken: (token) => void;
  setUser: (user) => void;
  setLoading: (loading) => void;
  clearAuth: () => void;
}
```

### Interface `User`

```typescript
interface User {
  uuid_publico: string;
  nome: string;
  email: string;
  telefone?: string | null;
  papel: "admin" | "operador";
  avatar_url?: string | null;
  estado: "ativo" | "suspenso" | "inativo";
  email_verificado: boolean;
  ultimo_login?: string | null;
  assistentes_permitidos?: number[];
  base_contactos_permitidas?: number[];
  empresa?: { uuid_publico: string; nome: string; slug: string };
}
```

### Outros estados (locais às páginas)

- Listas de dados (contactos, bases, operadores): `useState` local com fetch manual.
- TanStack Query é configurado mas **não é efetivamente utilizado nas páginas** — todas usam fetch manual com `useState` + `useEffect`.

---

## 7. Data Fetching (TanStack Query + Axios)

### Configuração do QueryClient

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,       // 30 segundos
      refetchOnWindowFocus: false,
    },
  },
});
```

### Realidade atual

Apesar do TanStack Query estar instalado e configurado, **nenhuma página o utiliza efetivamente**. Todas as páginas fazem fetch manual:

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);
```

O hook `useApi` (`hooks/use-api.ts`) existe como wrapper genérico mas também não é amplamente adotado.

### Axios

- Base URL: `/api/v1` (proxy reverso para `http://localhost:8000/api/v1`)
- Timeout: 10 segundos
- `withCredentials: true` (cookies HttpOnly)
- Interceptor de request: Adiciona `Authorization: Bearer <token>`
- Interceptor de response: Refresh automático em 401

### Proxy Reverso (next.config.js)

```javascript
async rewrites() {
  return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }];
}
```

---

## 8. Sistema de Design (shadcn/ui + Tailwind)

### Tema

- **Style**: New York (shadcn/ui)
- **Base color**: Neutral
- **CSS Variables**: Ativadas (`cssVariables: true`)
- **Tailwind v4**: Usa `@theme inline` com CSS custom properties
- **Primary**: Roxo (`hsl(262, 83%, 58%)`)
- **Secondary**: Ciano (`hsl(188, 94%, 43%)`)
- **Font**: Inter
- **Border radius**: `0.5rem`
- **Suporte a tema escuro**: Configurado via next-themes, mas apenas `light` está ativo por padrão

### Componentes UI Disponíveis (55)

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, ButtonGroup, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Empty, Field, Form, HoverCard, Input, InputGroup, InputOTP, Item, Kbd, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, ToggleGroup, Tooltip

### Design System da Sidebar

- Gradiente roxo → ciano na tag "Assistente Académico"
- Ícones com stroke condicional (ativo: 2.2, inativo: 1.75)
- Barra accent animada à esquerda do item ativo
- Transições CSS (não Framer Motion) para collapse/expand (300ms cubic-bezier)
- Tooltips nos itens quando colapsado

### Padrões Visuais Recorrentes

- **Botões primários**: `bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white`
- **Cards**: `shadow-sm` nos cards, `shadow-sm border-dashed border-2` nos placeholders
- **Ícones de secção**: Container `w-9 h-9 rounded-xl bg-gradient-to-br` com cor temática
- **Estados vazios**: Ícone grande opaco + mensagem + CTA (se admin)
- **Inputs**: `h-10 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/40`

---

## 9. Funcionalidades por Página

### 9.1 Landing Page (`/`)

- **Hero section**: Fundo escuro (`#0a0a1a`) com blobs gradientes (roxo, ciano, índigo) e grid pattern overlay
- **Features grid**: 6 cards com gradientes coloridos
- **CTA section**: Fundo cinza claro com call-to-action
- **Footer**: Links para login e registo
- **Navbar condicional**: Se autenticado → "Ir para o Painel"; se não → "Iniciar Sessão" + "Registar Escola"

### 9.2 Login (`/login`)

- **Split layout**: Painel esquerdo (brand) + painel direito (formulário)
- **Brand panel**: Fundo escuro com blobs, grid pattern, feature pills (Assistentes IA, Gestão de Contactos, Pagamentos)
- **Formulário**: Slug da escola, email, password com toggle de visibilidade
- **Validação**: Nativa do browser (`required`, `type="email"`)
- **Erro**: Banner vermelho acima do formulário
- **Redirecionamento pós-login**: Admin → `/painel`, Operador → `/assistentes`

### 9.3 Registo (`/register`)

- **4 passos**: Empresa → Admin → Confirmar → Verificação
- **Step indicator**: Círculos numerados com check para passos concluídos
- **Step 1 (Empresa)**: Nome, slug, NIF, email, telefone
- **Step 2 (Admin)**: Nome, email, password
- **Step 3 (Confirmar)**: Resumo dos dados + checkbox de aceitação de termos
- **Step 4 (Verificação)**: Input de código de 6 dígitos + reenvio

### 9.4 Painel (`/painel`) — Placeholder

- Card dashed com ícone `LayoutDashboard`
- Mensagem: "Em breve terá métricas e gráficos consolidados da sua escola."

### 9.5 Base de Contactos (`/base-contactos`)

#### Lista de Bases
- **Header**: Ícone + contagem de bases + botão "Criar Base" (admin only)
- **Grid de cards**: 3 colunas com nome, descrição, contadores (contactos, alunos, profs, funcs)
- **Estados**: Loading spinner, erro com retry, empty state com CTA
- **Modal de criação (2 passos)**:
  - **Passo 1**: Nome, descrição, toggles de Ensino Base/Médio
  - **Passo 2**: Configuração de turnos (Manhã/Tarde/Noite com horários), classes do ensino base (checkboxes), cursos do ensino médio (CRUD inline)

#### Detalhe da Base (`/base-contactos/[id]`)
- **3 Tabs**: Contactos | Estrutura | Definições
- **Tab Contactos**: Tabela com filtros (tipo, estado), search, modal CRUD, import CSV
- **Tab Estrutura**: Gestão de cursos, classes, turnos e turmas com modais dedicados
  - Modal de turmas: 2 passos (selecionar ensino → selecionar turmas por classe com toggle de letras A-F)
- **Tab Definições**: Editar nome/descrição/ensinos da base + botão de eliminar

### 9.6 Assistentes (`/assistentes`) — Placeholder

- Card dashed com ícone `Brain`
- Mensagem: "Esta secção está em desenvolvimento."

### 9.7 Planos (`/planos`) — Placeholder

- Card dashed com ícone `CreditCard`
- Mensagem: "Esta secção está em desenvolvimento."

### 9.8 Equipa (`/equipa`)

- **2 Tabs**: Operadores | Convites Pendentes
- **Tab Operadores**: Tabela com nome, email, estado (badge colorido), papel, permissões, ações
- **Tab Convites**: Tabela com email, papel, data de expiração, estado (pendente/expirado/usado)
- **Painel lateral "Convidar Operador"** (2 passos):
  - **Passo 1**: Email + papel (admin/operador)
  - **Passo 2**: Seleção de assistentes e bases (com switches) + envio
- **Painel lateral "Editar Operador"**: Dados do operador, alterar papel, permissões (switches), remover operador
- Animações de slide-in-right para painéis laterais

### 9.9 Pagamentos (`/pagamentos`) — Placeholder

- Card dashed com ícone `Receipt`
- Mensagem: "Esta secção está em desenvolvimento."

### 9.10 Perfil (`/perfil`)

- **Dados pessoais**: Nome editável, email (readonly), telefone
- **Alterar password**: Password atual + nova password com toggle de visibilidade
- **Permissões** (apenas operador): Lista de assistentes e bases atribuídos
- **Feedback**: Banners de sucesso (verde) / erro (vermelho)

---

## 10. Serviços (API Layer)

| Serviço | Endpoints | Descrição |
|---------|----------|-----------|
| `authService` | login, register, verifyEmail, resendVerification, forgotPassword, resetPassword | Autenticação |
| `baseContactosService` | getBases, getBase, createBase, updateBase, deleteBase | CRUD de bases |
| `contactosService` | getContactos, getContacto, createContacto, updateContacto, deleteContacto, importContactosCSV | CRUD de contactos |
| `contactoService` | getBasesContacto | Lista auxiliar de bases |
| `assistenteService` | getAssistentes | Lista de assistentes |
| `estruturaEscolarService` | Cursos, Classes, Turnos, Turmas (CRUD completo), Alunos, Encarregados | Estrutura escolar |
| `empresaService` | getMinhaEmpresa, updateMinhaEmpresa | Dados da empresa |
| `equipaService` | Operadores (CRUD), Convites (CRUD), Permissões (set/gerir) | Gestão de equipa |
| `usuarioService` | getMe, updateMe, changePassword, listarUsuarios, getUsuario, updateUsuario, etc. | Perfil e admin de utilizadores |
| `billingService` | getPlanos | Planos de subscrição |

---

## 11. Fluxo de Dados Completo

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Páginas  │───▶│   Services   │───▶│  Axios Instance   │  │
│  │ (Client   │    │  (Funções    │    │  (/lib/api.ts)    │  │
│  │  Comps)   │◀───│   async)     │◀───│                   │  │
│  └──────────┘    └──────────────┘    │  - Base URL:      │  │
│       │                              │    /api/v1         │  │
│       │                              │  - Interceptors:   │  │
│       ▼                              │    - Auth header   │  │
│  ┌──────────┐                        │    - Refresh 401   │  │
│  │ Zustand  │                        └─────────┬─────────┘  │
│  │ Store    │                                  │            │
│  │ (Auth)   │                                  │            │
│  └──────────┘                                  │            │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                        Next.js Rewrites
                                                 │
                                    /api/* → localhost:8000/api/*
                                                 │
┌────────────────────────────────────────────────┼────────────┐
│                    BACKEND (Django)             │            │
│                                          ┌─────▼──────────┐ │
│                                          │  API REST       │ │
│                                          │  (DRF)          │ │
│                                          └────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Diagnóstico: Estado Atual da UX

### Pontos Fortes

- ✅ Sidebar colapsável com animações suaves
- ✅ Barra de progresso visual nos passos (registo, criação de base, convite)
- ✅ Painéis laterais com slide-in-right animation
- ✅ Feedback visual de erros (banners coloridos)
- ✅ Estados de loading, erro e vazio implementados
- ✅ Landing page com design cuidado (hero com blobs, features, CTA)
- ✅ Login com split layout atrativo
- ✅ Switches e toggles para permissões
- ✅ Componente `PageState` reutilizável para loading/error/empty

### Fragilidades (O que dói na UX atual)

1. **4 páginas são placeholders vazios** (Painel, Assistentes, Planos, Pagamentos) — ocupam >40% da navegação
2. **Zero uso do TanStack Query** — dados nunca são cacheados, invalidados ou refetchados automaticamente
3. **Sem feedback otimista** — operações CRUD aguardam o servidor antes de atualizar a UI
4. **Sem confirmação de ações destrutivas** — apenas `confirm()` nativo em 1-2 lugares
5. **Sem undo/redo** — exclusões são permanentes sem possibilidade de desfazer
6. **Sem skeleton loading** — spinners simples em todo o lado
7. **Sem transições entre páginas** — Next.js sem `animatePresence` ou page transitions
8. **Sem atalhos de teclado** — navegação 100% dependente do rato
9. **Sem onboarding** — primeiro acesso não guia o utilizador
10. **Sem drag-and-drop** — reordenação manual inexistente
11. **Sem pesquisa instantânea (debounced)** — pesquisa nos contactos não tem debounce
12. **Sem infinite scroll/paginação virtual** — listas grandes carregam tudo
13. **Tema escuro configurado mas não funcional** — sempre `light`
14. **Sem responsividade adequada** — sidebar fixa, sem drawer mobile
15. **Sem breadcrumbs** — navegação profunda sem orientação
16. **Sem indicador de "a guardar"** — autosave inexistente
17. **Sem tour guiado** — funcionalidades complexas não são apresentadas
18. **Sem microinterações** — feedback háptico visual ausente (ripple, pulso, shake)
19. **Sem analytics de uso** — não há tracking de ações do utilizador
20. **Zero acessibilidade** — sem aria-labels, sem focus management, sem screen reader support

---

## 13. Plano de UX Monstruosa

> **Objetivo**: Transformar o Merkron Academica numa experiência de utilizador de classe mundial, com foco em performance percebida, microinterações, acessibilidade, e feedback visual rico.

---

### 🔥 NÍVEL 1 — IMPACTO IMEDIATO (Quick Wins)

#### 1.1 Remover Placeholders — Implementar as 4 Páginas Pendentes

**Painel (`/painel`)**
- Métricas consolidadas: total de contactos, alunos, professores, mensagens enviadas, taxa de entrega
- Gráfico de atividade (Recharts): envios por dia/semana/mês (bar chart + line chart)
- Últimas actividades: feed em tempo real (contactos adicionados, turmas criadas, convites aceites)
- Cards de acesso rápido: atalhos para ações frequentes (adicionar contacto, criar turma, convidar operador)
- Status do sistema: saúde dos assistentes IA, créditos restantes
- Widget de onboarding: progresso de configuração da escola (%)

**Assistentes (`/assistentes`)**
- Grid de cards com avatar, nome, tipo, modelo IA, status (online/offline)
- Métricas por assistente: interações hoje, taxa de sucesso, tempo médio de resposta
- Toggle de ativação/desativação com confirmação
- Chat preview ao vivo (últimas 3 mensagens)
- Configuração rápida: nome, personalidade, base de conhecimento

**Planos (`/planos`)**
- Cards de comparação (3 colunas): Básico, Profissional, Enterprise
- Destaque visual no plano atual + badge "Plano Atual"
- Feature comparison table com checkmarks
- CTA de upgrade com modal de confirmação
- Calculadora de preço: slider de contactos → preço estimado

**Pagamentos (`/pagamentos`)**
- Timeline de faturas com status (pago, pendente, vencido)
- Tabela com filtros por período e status
- Download de fatura em PDF
- Método de pagamento atual + botão de alterar
- Gráfico de gastos mensais (bar chart)

#### 1.2 Ativar Tema Escuro

```typescript
// Já existe next-themes configurado, basta ativar o toggle
// Adicionar na Sidebar ou no header
<ThemeToggle /> // Alternar entre light, dark, system
```

#### 1.3 Breadcrumbs

```typescript
// Exemplo: Base de Contactos > Base Principal > Contactos
<Breadcrumb>
  <BreadcrumbItem><Link href="/base-contactos">Base de Contactos</Link></BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>Base Principal</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>Contactos</BreadcrumbItem>
</Breadcrumb>
```

#### 1.4 Ativar TanStack Query

```typescript
// Substituir useState + useEffect por useQuery
const { data: bases, isLoading, error } = useQuery({
  queryKey: ['bases-contactos'],
  queryFn: getBases,
  staleTime: 30_000,
});

// Mutations com onMutate para optimistic updates
const createBaseMutation = useMutation({
  mutationFn: createBase,
  onMutate: async (newBase) => {
    // Cancel queries, snapshot, optimistic insert
  },
  onError: (err, newBase, context) => {
    // Rollback
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['bases-contactos'] });
  },
});
```

---

### ⚡ NÍVEL 2 — MICROINTERAÇÕES & FEEDBACK

#### 2.1 Skeleton Loading

```typescript
// Substituir spinners por skeletons com o componente Skeleton do shadcn/ui
function BaseCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="w-10 h-10 rounded-xl mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-4" />
        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Animações com Framer Motion

```typescript
// AnimatePresence para listas (stagger effect)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  <Card>...</Card>
</motion.div>

// Layout animations para reordenação
<motion.div layout>
  ...
</motion.div>

// Page transitions
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
>
  {children}
</motion.div>
```

#### 2.3 Ripple Effect em Botões

```css
/* Efeito de onda no clique */
.btn-ripple {
  position: relative;
  overflow: hidden;
}
.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10%);
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 1s;
}
.btn-ripple:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}
```

#### 2.4 Toast Melhorados (Sonner)

```typescript
// Rich toasts com ações
toast.success("Contacto criado", {
  description: "João Silva foi adicionado à base.",
  action: { label: "Desfazer", onClick: () => undoDelete() },
  duration: 5000,
});

toast.promise(createBase(novaBase), {
  loading: "A criar base...",
  success: (data) => `Base "${data.nome}" criada!`,
  error: "Erro ao criar base",
});
```

#### 2.5 Progresso Visual em Ações

```typescript
// Progress bar no topo da página durante navegação/saves
import { Progress } from "@/components/ui/progress";

function GlobalProgress({ isLoading }: { isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <Progress
        value={isLoading ? undefined : 100}
        className="h-0.5 rounded-none"
      />
    </motion.div>
  );
}
```

#### 2.6 Confetti em Marcos Importantes

```typescript
// Ao criar a primeira base, completar onboarding, etc.
import confetti from 'canvas-confetti';

function celebrate() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#7c3aed', '#06b6d4', '#10b981'],
  });
}
```

---

### 🧠 NÍVEL 3 — EXPERIÊNCIA AVANÇADA

#### 3.1 Modo Offline / Otimismo Total

```typescript
// Persistir estado no localStorage/indexedDB
// Operações offline-first com fila de sincronização

// Exemplo: Adicionar contacto offline
function useOptimisticMutation() {
  return useMutation({
    mutationFn: createContacto,
    onMutate: async (newContacto) => {
      await queryClient.cancelQueries({ queryKey: ['contactos'] });
      const previous = queryClient.getQueryData(['contactos']);
      queryClient.setQueryData(['contactos'], (old) => [...old, { ...newContacto, id: 'temp-' + Date.now() }]);
      return { previous };
    },
    onError: (err, newContacto, context) => {
      queryClient.setQueryData(['contactos'], context.previous);
      toast.error("Falha ao guardar. Tente novamente.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] });
    },
  });
}
```

#### 3.2 Pesquisa Instantânea com Debounce

```typescript
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

function useContactSearch(baseUid: string) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['contactos', baseUid, debouncedSearch],
    queryFn: () => getContactos(baseUid, { search: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
    placeholderData: keepPreviousData, // manter dados antigos enquanto pesquisa
  });

  return { search, setSearch, ...query };
}
```

#### 3.3 Virtual Scrolling para Listas Grandes

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualContactTable({ contactos }: { contactos: Contacto[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: contactos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // altura estimada da linha
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ transform: `translateY(${virtualItem.start}px)` }}>
            <ContactoRow contacto={contactos[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.4 Comando Paleta (⌘K / Ctrl+K)

```typescript
// Usar cmdk do shadcn/ui
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Pesquisar na plataforma..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => router.push('/painel')}>Painel</CommandItem>
          <CommandItem onSelect={() => router.push('/base-contactos')}>Base de Contactos</CommandItem>
          <CommandItem onSelect={() => router.push('/assistentes')}>Assistentes</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => setShowCreateBase(true)}>Criar Base de Contactos</CommandItem>
          <CommandItem onSelect={() => router.push('/perfil')}>Editar Perfil</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

#### 3.5 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+K` | Abrir paleta de comandos |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+N` | Novo contacto (contextual) |
| `Ctrl+F` | Foco na pesquisa |
| `Escape` | Fechar modal/painel |
| `Ctrl+Z` | Desfazer última ação |
| `Ctrl+Shift+Z` | Refazer |

#### 3.6 Drag-and-Drop

```typescript
// Reordenar contactos, turmas, etc.
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableContacto({ contacto }: { contacto: Contacto }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: contacto.uuid_publico });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ContactoRow contacto={contacto} />
    </div>
  );
}
```

---

### 🎨 NÍVEL 4 — ONBOARDING & DELIGHT

#### 4.1 Welcome Wizard (Primeiro Acesso)

```typescript
// Wizard de 4 passos após o primeiro login:
// 1. Bem-vindo → nome da escola, saudação personalizada
// 2. Criar primeira base de contactos (simplificado)
// 3. Adicionar primeiros contactos (upload CSV ou manual)
// 4. Explorar a plataforma → links rápidos

function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  return (
    <Dialog open={isFirstLogin} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                i < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        {/* Conteúdo do passo... */}
      </DialogContent>
    </Dialog>
  );
}
```

#### 4.2 Tooltips Contextuais e Tour Guiado

```typescript
// Usar driver.js ou react-joyride para tour interativo
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.sidebar-navigation',
    content: 'Aqui está a navegação principal. Pode recolher para ganhar mais espaço.',
    placement: 'right',
  },
  {
    target: '.create-base-button',
    content: 'Clique aqui para criar a sua primeira base de contactos!',
    placement: 'bottom',
  },
  // ...
];
```

#### 4.3 Empty States com Ilustrações

```typescript
// Em vez de ícones simples, usar ilustrações SVG animadas
function EmptyState({ type }: { type: 'contacts' | 'bases' | 'assistants' }) {
  const illustrations = {
    contacts: <EmptyContactsIllustration />,
    bases: <EmptyBasesIllustration />,
    assistants: <EmptyAssistantsIllustration />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-16"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {illustrations[type]}
      </motion.div>
      <h3 className="text-lg font-semibold mt-6">Vamos começar!</h3>
      <p className="text-muted-foreground text-sm mt-1 mb-4">
        Crie o seu primeiro {type === 'contacts' ? 'contacto' : type === 'bases' ? 'base' : 'assistente'}.
      </p>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        {type === 'contacts' ? 'Adicionar Contacto' : type === 'bases' ? 'Criar Base' : 'Configurar Assistente'}
      </Button>
    </motion.div>
  );
}
```

#### 4.4 Indicador de Força da Senha

```typescript
function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const labels = ['Fraca', 'Razoável', 'Boa', 'Forte'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}
            className={cn("h-1 flex-1 rounded-full transition-all", i < strength ? colors[strength - 1] : "bg-muted")}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">{labels[Math.max(0, strength - 1)]}</p>
    </div>
  );
}
```

#### 4.5 Easter Eggs

```typescript
// Sequência Konami (↑↑↓↓←→←→BA)
// Modo festa com confetti
// Frases motivacionais aleatórias no footer da sidebar
// Avatar animado que reage ao scroll
```

---

### ♿ NÍVEL 5 — ACESSIBILIDADE

#### 5.1 Navegação por Teclado

```typescript
// Focus trap em modais e painéis
// Tab index management
// Arrow key navigation em tabelas e listas
// Skip-to-content link
```

#### 5.2 ARIA Labels e Roles

```typescript
// Todos os elementos interativos devem ter:
// - aria-label ou aria-labelledby
// - role apropriado
// - estado (aria-expanded, aria-selected, aria-current)

<button
  aria-label="Criar nova base de contactos"
  aria-haspopup="dialog"
  onClick={() => setShowCreate(true)}
>
  <Plus className="w-4 h-4" /> Criar Base
</button>
```

#### 5.3 Contraste e Legibilidade

```typescript
// Verificar rácios de contraste WCAG AA (4.5:1 para texto normal)
// Suporte a prefers-reduced-motion (desativar animações)
// Suporte a prefers-contrast
// Texto escalável (rem/em em vez de px fixos)
```

#### 5.4 Screen Reader

```typescript
// Anúncios de mudanças de estado
// Live regions para updates assíncronos
// Descrições significativas para gráficos
```

---

### 📱 NÍVEL 6 — RESPONSIVIDADE & MOBILE

#### 6.1 Sidebar → Drawer Mobile

```typescript
// Em mobile (<768px), a sidebar vira um Sheet/Drawer
import { useMediaQuery } from "@/hooks/use-mobile";

function ResponsiveSidebar() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return <Sidebar />; // Desktop sidebar
}
```

#### 6.2 Tabelas → Cards em Mobile

```typescript
// Em mobile, tabelas de dados viram cards empilhados
function ResponsiveTable({ data }: { data: Contacto[] }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="space-y-2">
        {data.map((item) => (
          <Card key={item.uuid_publico}>
            <CardContent className="p-4">
              <h4>{item.nome}</h4>
              <p className="text-sm text-muted-foreground">{item.telefone}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return <Table>...</Table>;
}
```

#### 6.3 Touch-Friendly

```typescript
// Áreas de toque mínimas de 44x44px (WCAG)
// Gestos: swipe para ações (ex: swipe left → delete)
// Pull-to-refresh em listas
// Haptic feedback em ações críticas (navigator.vibrate)
```

---

### 📊 NÍVEL 7 — ANALYTICS & MEDIÇÃO

#### 7.1 Tracking de Eventos

```typescript
// Implementar analytics (PostHog, Plausible, etc.)
function trackEvent(name: string, properties?: Record<string, unknown>) {
  // Enviar para o backend
  api.post('/analytics/events/', { name, properties, timestamp: new Date().toISOString() });
}

// Exemplos:
trackEvent('base_created', { nome, tem_ensino_base, tem_ensino_medio });
trackEvent('contact_added', { tipo, base_uid });
trackEvent('sidebar_toggled', { collapsed: true });
```

#### 7.2 Métricas de Performance

```typescript
// Core Web Vitals: LCP, FID, CLS
// Tempo de carregamento por página
// Taxa de erro por endpoint
// Uso de memória
```

#### 7.3 Heatmaps e Session Recording

```typescript
// Integrar ferramenta como Microsoft Clarity ou Hotjar
// Gravar sessões anonimizadas para identificar pontos de fricção
```

---

### 🧪 NÍVEL 8 — TESTES & QUALIDADE

#### 8.1 Testes Automatizados

```typescript
// Testes unitários (Vitest + Testing Library)
// Testes de integração (Playwright / Cypress)
// Testes de acessibilidade (axe-core)
// Testes visuais (Chromatic / Percy)
```

#### 8.2 Error Tracking

```typescript
// Sentry para capturar erros em produção
// Error boundaries por secção (já existe um na página de [id])
// Fallback UI elegante quando algo falha
```

---

### 📋 IMPLEMENTAÇÃO RECOMENDADA (Por Prioridade)

| Prioridade | Tarefa | Esforço | Impacto |
|-----------|--------|---------|---------|
| 🔴 P0 | Implementar Painel com métricas reais | 3 dias | Alto |
| 🔴 P0 | Implementar Assistentes | 3 dias | Alto |
| 🔴 P0 | Implementar Planos | 2 dias | Alto |
| 🔴 P0 | Implementar Pagamentos | 2 dias | Alto |
| 🔴 P0 | Migrar para TanStack Query | 2 dias | Alto |
| 🟠 P1 | Breadcrumbs + navegação contextual | 1 dia | Médio |
| 🟠 P1 | Skeleton loading + AnimatePresence | 2 dias | Médio |
| 🟠 P1 | Atalhos de teclado + Command Palette | 1 dia | Médio |
| 🟠 P1 | Tema escuro funcional | 0.5 dia | Médio |
| 🟠 P1 | Debounce na pesquisa | 0.5 dia | Médio |
| 🟠 P1 | Responsividade mobile (sidebar drawer) | 1 dia | Médio |
| 🟡 P2 | Toast melhorados com ações | 0.5 dia | Médio |
| 🟡 P2 | Otimismo em mutações CRUD | 1 dia | Médio |
| 🟡 P2 | Onboarding wizard | 2 dias | Médio |
| 🟡 P2 | Empty states com ilustrações | 1 dia | Médio |
| 🟡 P2 | Confirmação em ações destrutivas | 0.5 dia | Médio |
| 🟢 P3 | Drag-and-drop para reordenação | 1 dia | Baixo |
| 🟢 P3 | Virtual scrolling | 1 dia | Baixo |
| 🟢 P3 | Tour guiado (Joyride) | 1 dia | Baixo |
| 🟢 P3 | Confetti / Easter eggs | 0.5 dia | Baixo |
| 🟢 P3 | Acessibilidade completa (WCAG AA) | 3 dias | Médio |
| 🔵 P4 | Analytics + tracking | 2 dias | Baixo |
| 🔵 P4 | Error tracking (Sentry) | 0.5 dia | Baixo |
| 🔵 P4 | Testes automatizados | 5 dias | Alto |

---

### 🎯 Objetivo Final

> O utilizador deve sentir que a plataforma **responde antes de ele terminar de pensar**. Cada clique deve ter feedback imediato. Cada transição deve ser suave. Cada estado (vazio, loading, erro, sucesso) deve ser tratado com elegância. A plataforma deve ser **acessível a todos**, independentemente do dispositivo ou capacidade.

---

_Este documento serve como referência viva da arquitetura e do plano de evolução do frontend Merkron Academica. Atualizar à medida que as funcionalidades forem implementadas._
