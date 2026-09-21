import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Calendar as CalendarIcon, ChevronDown, Download, Filter, TrendingUp, Users, CheckCircle2, Clock, Send, Star, AlertCircle, MessageSquare, Sparkles, AlertTriangle, FileText, HelpCircle, BarChart3, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

const lineChartData = [
  { date: '1 Jun', entregas: 92, lidas: 85, interacoes: 60 },
  { date: '2 Jun', entregas: 95, lidas: 88, interacoes: 62 },
  { date: '3 Jun', entregas: 94, lidas: 89, interacoes: 65 },
  { date: '4 Jun', entregas: 98, lidas: 90, interacoes: 68 },
  { date: '5 Jun', entregas: 97, lidas: 92, interacoes: 72 },
  { date: '6 Jun', entregas: 99, lidas: 91, interacoes: 70 },
  { date: '7 Jun', entregas: 98.7, lidas: 91.2, interacoes: 67.8 },
];

const pieData = [
  { name: 'Pais / Encarregados', value: 1250, color: '#3B82F6' },
  { name: 'Alunos', value: 892, color: '#8B5CF6' },
  { name: 'Professores', value: 458, color: '#6D28D9' },
  { name: 'Outros', value: 247, color: '#64748B' },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-[1600px] mx-auto space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 py-1">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Olá, Administrador! 👋</h1>
              <p className="text-muted-foreground text-xs mt-0.5">Aqui está o panorama inteligente da comunicação da sua escola.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 text-xs border-border bg-card px-3">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                01 - 07 Jun, 2025
                <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-muted-foreground" />
              </Button>
              <Button variant="outline" className="h-8 text-xs border-border bg-card px-3">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                Filtros
              </Button>
              <Button className="h-8 text-xs bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-3">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Exportar Relatório
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-3">
            {/* Card 1 */}
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-md">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wide">Esta semana</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <h3 className="text-2xl font-bold leading-none">2.847</h3>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />18,3%
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground mb-2">Utilizadores Ativos</p>
                <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>1.250 Pais</span>
                  <span>892 Alunos</span>
                  <span>458 Profs</span>
                  <span>247 Outros</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-purple-500/10 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wide">Esta semana</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <h3 className="text-2xl font-bold leading-none">92,6%</h3>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />6,4%
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground mb-2">Taxa de Resolução (IA)</p>
                <div className="text-[10px] text-muted-foreground flex gap-2">
                  <span><span className="text-foreground font-semibold">3.421</span> Respondidas</span>
                  <span><span className="text-foreground font-semibold">278</span> Encam.</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-md">
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wide">Este mês</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <h3 className="text-2xl font-bold leading-none">127h</h3>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />23%
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground mb-2">Horas Poupadas</p>
                <div className="text-[10px] text-muted-foreground flex gap-2">
                  <span>Secretaria <span className="text-foreground font-semibold">98h</span></span>
                  <span>Profs <span className="text-foreground font-semibold">29h</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-cyan-500/10 rounded-md">
                    <Send className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wide">Este mês</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <h3 className="text-2xl font-bold leading-none">48</h3>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />14%
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground mb-2">Comunicados Enviados</p>
                <div className="text-[10px] text-muted-foreground flex gap-2">
                  <span>Entregues <span className="text-foreground font-semibold">98,7%</span></span>
                  <span>Leitura <span className="text-foreground font-semibold">91,2%</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Card 5 */}
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-md">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wide">Esta semana</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <h3 className="text-2xl font-bold leading-none">4,8/5</h3>
                  <span className="text-[10px] font-medium text-emerald-500 flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />0,4
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground mb-1.5">Satisfação Geral</p>
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                    <Star className="w-3 h-3 fill-current opacity-40" />
                  </div>
                  <span className="text-[9px] text-muted-foreground">1.248 aval.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-4 gap-3">

            {/* Line Chart */}
            <Card className="col-span-2 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-sm font-semibold">Visão Geral da Comunicação</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 border border-border">
                  Últimos 7 dias <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} tickFormatter={(val) => val + '%'} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="entregas" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="lidas" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="interacoes" stroke="#EC4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-border/50">
                  {[
                    { color: 'bg-blue-500', label: 'Entregas', val: '98,7%', pct: '↑3,2%' },
                    { color: 'bg-purple-500', label: 'Lidas', val: '91,2%', pct: '↑5,6%' },
                    { color: 'bg-pink-500', label: 'Interações', val: '67,8%', pct: '↑7,1%' },
                    { color: 'bg-emerald-500', label: 'Enc. Informados', val: '94,6%', pct: '↑4,8%' },
                  ].map((m, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                        <span className={'w-1.5 h-1.5 rounded-full shrink-0 ' + m.color} /> {m.label}
                      </p>
                      <p className="text-sm font-bold">{m.val} <span className="text-[9px] font-medium text-emerald-500">{m.pct}</span></p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Donut Chart */}
            <Card className="shadow-sm">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-semibold">Distribuição por Utilizador</CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex flex-col items-center">
                <div className="h-[160px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={'cell-' + index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-muted-foreground">Total ativos</span>
                    <span className="text-base font-bold">2.847</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-1">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[9px] text-muted-foreground leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-semibold">{item.value} <span className="font-normal opacity-50">{((item.value/2847)*100).toFixed(1)}%</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  Alertas Inteligentes
                  <span className="bg-red-500/20 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold">4</span>
                </CardTitle>
                <a href="#" className="text-[10px] text-primary font-medium hover:underline">Ver todos</a>
              </CardHeader>
              <CardContent className="p-3 flex-1">
                <div className="space-y-2.5 mt-1">
                  {[
                    { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', msg: '27 encarregados não receberam o último comunicado importante.', time: 'Há 15 min' },
                    { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', msg: 'Taxa de leitura caiu 8% em relação à semana anterior.', time: 'Há 1 hora' },
                    { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', msg: 'Aumento de 23% nas perguntas sobre propinas.', time: 'Há 2 horas' },
                    { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', msg: 'Reunião de Pais ainda não lida por 53 encarregados.', time: 'Há 3 horas' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 group cursor-pointer">
                      <div className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ' + alert.bg}>
                        <alert.icon className={'w-3.5 h-3.5 ' + alert.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground leading-snug group-hover:text-primary transition-colors">{alert.msg}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{alert.time}</p>
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom: 3 columns */}
          <div className="grid grid-cols-3 gap-3">

            {/* Top Perguntas */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="text-sm font-semibold">Top Perguntas (Este mês)</CardTitle>
                <a href="#" className="text-[10px] text-primary font-medium hover:underline">Ver todas</a>
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-1 flex flex-col">
                <div className="space-y-2.5 flex-1">
                  {[
                    { label: "Propinas e Pagamentos", val: 842, pct: 100 },
                    { label: "Horários de Aulas", val: 615, pct: 73 },
                    { label: "Calendário Escolar", val: 402, pct: 47 },
                    { label: "Faltas e Justificações", val: 311, pct: 36 },
                    { label: "Reuniões e Eventos", val: 287, pct: 34 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-foreground">{item.label}</span>
                        <span className="text-xs text-muted-foreground font-semibold">{item.val}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: item.pct + '%' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Total de Perguntas</span>
                  <span className="text-sm font-bold">3.421</span>
                </div>
              </CardContent>
            </Card>

            {/* Atividade em Tempo Real */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  Atividade em Tempo Real
                </CardTitle>
                <a href="#" className="text-[10px] text-primary font-medium hover:underline">Ver todas</a>
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-1">
                <div className="space-y-2">
                  {[
                    { name: "Aluno - 10ªA", msg: "Qual é a data da próxima prova de Matemática?", time: "agora", initial: "A", color: "bg-blue-500" },
                    { name: "Pai - 6ºB", msg: "Como posso emitir a segunda via do boleto?", time: "1m", initial: "P", color: "bg-purple-500" },
                    { name: "Professor - História", msg: "Enviou o comunicado: Trabalho de Pesquisa", time: "2m", initial: "P", color: "bg-emerald-500" },
                    { name: "Aluno - 8ºC", msg: "Como justificar uma falta?", time: "3m", initial: "A", color: "bg-blue-500" },
                  ].map((chat, i) => (
                    <div key={i} className="flex gap-2">
                      <div className={'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ' + chat.color}>
                        {chat.initial}
                      </div>
                      <div className="flex-1 bg-muted/40 rounded-md px-2 py-1.5 border border-border/50 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-bold text-foreground truncate">{chat.name}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0 ml-1">{chat.time}</span>
                        </div>
                        <p className="text-[10px] text-foreground/70 truncate">{chat.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impacto */}
            <Card className="shadow-sm bg-gradient-to-br from-primary/10 via-background to-cyan-500/10 border-primary/20 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Rocket className="w-24 h-24 text-primary" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 relative z-10">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Impacto Gerado Este Mês
                </CardTitle>
                <a href="#" className="text-[10px] text-primary font-medium hover:underline">Ver tudo</a>
              </CardHeader>
              <CardContent className="p-3 pt-1 flex-1 flex flex-col relative z-10">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[
                    { val: '3.421', color: 'text-primary', label: 'Perguntas respondidas pela IA' },
                    { val: '1.742', color: 'text-cyan-500', label: 'Atendimentos evitados' },
                    { val: '127h', color: 'text-emerald-500', label: 'Horas de trabalho poupadas' },
                    { val: '2.316', color: 'text-purple-500', label: 'Interações com comunicados' },
                  ].map((m, i) => (
                    <div key={i} className="bg-background/80 backdrop-blur-sm border border-border p-2 rounded-lg">
                      <h4 className={'text-lg font-bold mb-0.5 ' + m.color}>{m.val}</h4>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight block">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-1.5 px-2 rounded-lg flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-semibold">Redução de 38% na carga de trabalho da secretaria</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table + Quick Access */}
          <div className="grid grid-cols-4 gap-3 pb-4">
            <Card className="col-span-3 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-border">
                <CardTitle className="text-sm font-semibold">Comunicações Recentes</CardTitle>
                <a href="#" className="text-[10px] text-primary font-medium hover:underline">Ver todos</a>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-muted-foreground bg-muted/40 uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-2 font-medium">Comunicado</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Data</th>
                      <th className="px-3 py-2 font-medium">Entregue</th>
                      <th className="px-3 py-2 font-medium">Lido</th>
                      <th className="px-3 py-2 font-medium">Interações</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { title: 'Reunião de Pais - 2º Trimestre', tipo: 'Importante', tipoColor: 'bg-orange-500/10 text-orange-600', date: '06 Jun, 2025', ent: '99,2%', lido: '92,1%', int: 312 },
                      { title: 'Calendário de Provas', tipo: 'Informativo', tipoColor: 'bg-blue-500/10 text-blue-600', date: '05 Jun, 2025', ent: '98,7%', lido: '94,3%', int: 278 },
                      { title: 'Informações sobre Férias', tipo: 'Informativo', tipoColor: 'bg-blue-500/10 text-blue-600', date: '04 Jun, 2025', ent: '97,1%', lido: '90,2%', int: 198 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground">{row.title}</td>
                        <td className="px-3 py-2.5">
                          <span className={'text-[10px] px-2 py-0.5 rounded font-medium ' + row.tipoColor}>{row.tipo}</span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.date}</td>
                        <td className="px-3 py-2.5 font-semibold">{row.ent}</td>
                        <td className="px-3 py-2.5 font-semibold">{row.lido}</td>
                        <td className="px-3 py-2.5 font-semibold">{row.int}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Send, color: 'text-purple-500', bg: 'bg-purple-500/10', hover: 'hover:border-purple-500/30', label: 'Novo Comunicado' },
                    { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/30', label: 'Aviso Rápido' },
                    { icon: HelpCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', hover: 'hover:border-emerald-500/30', label: 'Perguntas Freq.' },
                    { icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10', hover: 'hover:border-amber-500/30', label: 'Relatórios Av.' },
                  ].map((btn, i) => (
                    <button key={i} className={'h-16 flex flex-col gap-1 items-center justify-center border border-border rounded-lg bg-card transition-all group ' + btn.hover + ' hover:bg-muted/30'}>
                      <div className={'w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ' + btn.bg}>
                        <btn.icon className={'w-3.5 h-3.5 ' + btn.color} />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight px-1">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
