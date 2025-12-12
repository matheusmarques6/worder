'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  MousePointer,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ShoppingCart,
  Heart,
  Gift,
} from 'lucide-react'

// Mock data for Klaviyo metrics
const kpiData = [
  {
    title: 'Taxa de Abertura',
    value: '24.8%',
    change: '+2.3%',
    trend: 'up',
    icon: Eye,
    color: 'from-blue-500 to-blue-600',
    description: 'vs. período anterior',
  },
  {
    title: 'Taxa de Clique',
    value: '3.2%',
    change: '+0.5%',
    trend: 'up',
    icon: MousePointer,
    color: 'from-green-500 to-green-600',
    description: 'vs. período anterior',
  },
  {
    title: 'Taxa de Conversão',
    value: '1.8%',
    change: '-0.2%',
    trend: 'down',
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    description: 'vs. período anterior',
  },
  {
    title: 'Receita Gerada',
    value: 'R$ 45.890',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-primary-500 to-accent-500',
    description: 'vs. período anterior',
  },
  {
    title: 'ROI de Email',
    value: '4.2x',
    change: '+0.8x',
    trend: 'up',
    icon: TrendingUp,
    color: 'from-yellow-500 to-orange-500',
    description: 'retorno sobre investimento',
  },
  {
    title: 'Lista Ativa',
    value: '12.450',
    change: '+890',
    trend: 'up',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
    description: 'contatos ativos',
  },
  {
    title: 'Novos Inscritos',
    value: '234',
    change: '+45',
    trend: 'up',
    icon: UserPlus,
    color: 'from-emerald-500 to-green-600',
    description: 'este período',
  },
  {
    title: 'Unsubscribes',
    value: '18',
    change: '-5',
    trend: 'up',
    icon: UserMinus,
    color: 'from-red-500 to-rose-600',
    description: 'este período',
  },
]

// Funnel data
const funnelData = [
  { stage: 'Enviados', value: 25000, percent: 100, color: 'bg-blue-500' },
  { stage: 'Entregues', value: 24500, percent: 98, color: 'bg-cyan-500' },
  { stage: 'Abertos', value: 6200, percent: 24.8, color: 'bg-green-500' },
  { stage: 'Clicados', value: 800, percent: 3.2, color: 'bg-yellow-500' },
  { stage: 'Convertidos', value: 450, percent: 1.8, color: 'bg-primary-500' },
]

// Campaign data
const campaigns = [
  {
    id: 1,
    name: 'Black Friday - Early Access',
    status: 'sent',
    type: 'campaign',
    sent: 12500,
    delivered: 12250,
    opened: 4200,
    clicked: 890,
    converted: 156,
    revenue: 'R$ 12.340',
    openRate: '34.3%',
    clickRate: '7.3%',
    date: '2024-11-22',
  },
  {
    id: 2,
    name: 'Welcome Series - Email 1',
    status: 'active',
    type: 'flow',
    sent: 3200,
    delivered: 3150,
    opened: 1890,
    clicked: 567,
    converted: 89,
    revenue: 'R$ 5.670',
    openRate: '60%',
    clickRate: '18%',
    date: 'Automático',
  },
  {
    id: 3,
    name: 'Carrinho Abandonado',
    status: 'active',
    type: 'flow',
    sent: 1850,
    delivered: 1820,
    opened: 982,
    clicked: 456,
    converted: 234,
    revenue: 'R$ 18.920',
    openRate: '54%',
    clickRate: '25%',
    date: 'Automático',
  },
  {
    id: 4,
    name: 'Newsletter Semanal',
    status: 'sent',
    type: 'campaign',
    sent: 8900,
    delivered: 8720,
    opened: 1920,
    clicked: 234,
    converted: 45,
    revenue: 'R$ 3.450',
    openRate: '22%',
    clickRate: '2.7%',
    date: '2024-11-20',
  },
  {
    id: 5,
    name: 'Pós-Compra - Review',
    status: 'active',
    type: 'flow',
    sent: 2100,
    delivered: 2080,
    opened: 1456,
    clicked: 234,
    converted: 89,
    revenue: 'R$ 2.340',
    openRate: '70%',
    clickRate: '11%',
    date: 'Automático',
  },
]

// Flow performance data
const flows = [
  {
    name: 'Welcome Series',
    icon: Heart,
    emails: 3,
    subscribers: 890,
    revenue: 'R$ 8.450',
    openRate: '58%',
    conversionRate: '4.2%',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Carrinho Abandonado',
    icon: ShoppingCart,
    emails: 3,
    subscribers: 456,
    revenue: 'R$ 18.920',
    openRate: '54%',
    conversionRate: '12.8%',
    color: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Browse Abandonment',
    icon: Eye,
    emails: 2,
    subscribers: 234,
    revenue: 'R$ 4.560',
    openRate: '42%',
    conversionRate: '3.1%',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Pós-Compra',
    icon: Gift,
    emails: 4,
    subscribers: 678,
    revenue: 'R$ 6.780',
    openRate: '68%',
    conversionRate: '8.5%',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Win-back',
    icon: Zap,
    emails: 3,
    subscribers: 123,
    revenue: 'R$ 2.340',
    openRate: '32%',
    conversionRate: '2.4%',
    color: 'from-purple-500 to-violet-500',
  },
]

// Heatmap data
const heatmapData = [
  { day: 'Seg', hours: [12, 18, 25, 32, 45, 52, 48, 42, 38, 35, 28, 22, 18, 25, 32, 45, 52, 48, 42, 38, 35, 28, 22, 15] },
  { day: 'Ter', hours: [15, 22, 28, 35, 48, 55, 52, 45, 40, 38, 32, 25, 20, 28, 35, 48, 55, 52, 45, 40, 38, 32, 25, 18] },
  { day: 'Qua', hours: [14, 20, 26, 34, 46, 54, 50, 44, 39, 36, 30, 24, 19, 26, 34, 46, 54, 50, 44, 39, 36, 30, 24, 16] },
  { day: 'Qui', hours: [16, 24, 30, 38, 50, 58, 54, 48, 42, 40, 34, 28, 22, 30, 38, 50, 58, 54, 48, 42, 40, 34, 28, 20] },
  { day: 'Sex', hours: [18, 26, 32, 40, 52, 60, 56, 50, 44, 42, 36, 30, 24, 32, 40, 52, 60, 56, 50, 44, 42, 36, 30, 22] },
  { day: 'Sáb', hours: [10, 14, 18, 24, 32, 38, 35, 30, 26, 24, 20, 16, 12, 18, 24, 32, 38, 35, 30, 26, 24, 20, 16, 10] },
  { day: 'Dom', hours: [8, 12, 15, 20, 28, 34, 32, 28, 24, 22, 18, 14, 10, 15, 20, 28, 34, 32, 28, 24, 22, 18, 14, 8] },
]

// Segments data
const segments = [
  { name: 'Clientes VIP', size: 1250, engagement: 'Alto', lastUpdated: '2h atrás', growth: '+12%' },
  { name: 'Compradores Recentes', size: 3400, engagement: 'Alto', lastUpdated: '1h atrás', growth: '+8%' },
  { name: 'Engajados 30 dias', size: 5600, engagement: 'Médio', lastUpdated: '3h atrás', growth: '+5%' },
  { name: 'Inativos 60 dias', size: 2100, engagement: 'Baixo', lastUpdated: '1d atrás', growth: '-3%' },
  { name: 'Novos Inscritos', size: 890, engagement: 'Alto', lastUpdated: '30min atrás', growth: '+25%' },
]

export default function EmailMarketingPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [selectedTab, setSelectedTab] = useState<'campaigns' | 'flows' | 'segments'>('campaigns')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Enviada</span>
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">Ativa</span>
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Rascunho</span>
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">Agendada</span>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'campaign':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">Campanha</span>
      case 'flow':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400">Flow</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">E-mail Marketing</h1>
          <p className="text-dark-400 mt-1">Performance completa do Klaviyo</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-dark-800/50 rounded-xl p-1">
            {['Hoje', 'Ontem', '7 Dias', '30 Dias', 'Este Mês'].map((range, idx) => (
              <button
                key={range}
                onClick={() => setDateRange(['today', 'yesterday', '7d', '30d', 'month'][idx])}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  dateRange === ['today', 'yesterday', '7d', '30d', 'month'][idx]
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 hover:bg-dark-700/50 rounded-xl text-dark-300 hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 hover:bg-dark-700/50 rounded-xl text-dark-300 hover:text-white transition-all">
            <Download className="w-4 h-4" />
            Exportar
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-all">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-4 hover:border-dark-600/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-dark-500 ml-1">{kpi.description}</span>
                </div>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color} opacity-80`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Funil de Conversão</h3>
              <p className="text-sm text-dark-400">Jornada do email até a conversão</p>
            </div>
          </div>

          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={item.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-dark-400">{item.value.toLocaleString()}</span>
                    <span className="text-sm font-medium text-white">{item.percent}%</span>
                  </div>
                </div>
                <div className="h-8 bg-dark-700/50 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-full ${item.color} rounded-lg`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Performance */}
        <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Performance dos Flows</h3>
              <p className="text-sm text-dark-400">Automações ativas</p>
            </div>
          </div>

          <div className="space-y-4">
            {flows.map((flow) => (
              <div key={flow.name} className="p-3 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${flow.color}`}>
                    <flow.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{flow.name}</p>
                    <p className="text-xs text-dark-400">{flow.emails} emails • {flow.subscribers} ativos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">{flow.revenue}</p>
                    <p className="text-xs text-dark-400">{flow.conversionRate} conv.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Time Heatmap */}
      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Melhor Horário para Envio</h3>
            <p className="text-sm text-dark-400">Taxa de abertura por dia e hora</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex mb-2">
              <div className="w-12" />
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-dark-500">{i}h</div>
              ))}
            </div>

            {heatmapData.map((row) => (
              <div key={row.day} className="flex items-center mb-1">
                <div className="w-12 text-sm text-dark-400">{row.day}</div>
                <div className="flex-1 flex gap-0.5">
                  {row.hours.map((value, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-6 rounded-sm transition-all hover:scale-110"
                      style={{ backgroundColor: `rgba(255, 107, 53, ${value / 100})` }}
                      title={`${row.day} ${idx}h: ${value}% abertura`}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end mt-4 gap-2">
              <span className="text-xs text-dark-500">Baixo</span>
              <div className="flex gap-0.5">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                  <div key={opacity} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(255, 107, 53, ${opacity})` }} />
                ))}
              </div>
              <span className="text-xs text-dark-500">Alto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl">
        <div className="flex border-b border-dark-700/50">
          {[
            { id: 'campaigns', label: 'Campanhas', count: campaigns.length },
            { id: 'flows', label: 'Flows', count: flows.length },
            { id: 'segments', label: 'Segmentos', count: segments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                selectedTab === tab.id ? 'text-white border-primary-500' : 'text-dark-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
              <span className="px-2 py-0.5 text-xs rounded-full bg-dark-700">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {selectedTab === 'campaigns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-dark-400 border-b border-dark-700/50">
                    <th className="pb-4 font-medium">Campanha</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Tipo</th>
                    <th className="pb-4 font-medium text-right">Enviados</th>
                    <th className="pb-4 font-medium text-right">Abertos</th>
                    <th className="pb-4 font-medium text-right">Taxa Abertura</th>
                    <th className="pb-4 font-medium text-right">Receita</th>
                    <th className="pb-4 font-medium text-right">Data</th>
                    <th className="pb-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                      <td className="py-4"><p className="font-medium text-white">{campaign.name}</p></td>
                      <td className="py-4">{getStatusBadge(campaign.status)}</td>
                      <td className="py-4">{getTypeBadge(campaign.type)}</td>
                      <td className="py-4 text-right text-dark-300">{campaign.sent.toLocaleString()}</td>
                      <td className="py-4 text-right text-dark-300">{campaign.opened.toLocaleString()}</td>
                      <td className="py-4 text-right"><span className="text-green-400 font-medium">{campaign.openRate}</span></td>
                      <td className="py-4 text-right"><span className="text-white font-semibold">{campaign.revenue}</span></td>
                      <td className="py-4 text-right text-dark-400 text-sm">{campaign.date}</td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-dark-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTab === 'flows' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map((flow) => (
                <div key={flow.name} className="p-4 bg-dark-700/30 rounded-xl hover:bg-dark-700/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${flow.color}`}>
                      <flow.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{flow.name}</p>
                      <p className="text-sm text-dark-400">{flow.emails} emails na sequência</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-dark-500">Receita</p>
                      <p className="text-lg font-semibold text-green-400">{flow.revenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Taxa de Abertura</p>
                      <p className="text-lg font-semibold text-white">{flow.openRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Conversão</p>
                      <p className="text-lg font-semibold text-white">{flow.conversionRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Ativos</p>
                      <p className="text-lg font-semibold text-white">{flow.subscribers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'segments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-dark-400 border-b border-dark-700/50">
                    <th className="pb-4 font-medium">Segmento</th>
                    <th className="pb-4 font-medium text-right">Tamanho</th>
                    <th className="pb-4 font-medium text-center">Engajamento</th>
                    <th className="pb-4 font-medium text-right">Crescimento</th>
                    <th className="pb-4 font-medium text-right">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment) => (
                    <tr key={segment.name} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                      <td className="py-4"><p className="font-medium text-white">{segment.name}</p></td>
                      <td className="py-4 text-right text-dark-300">{segment.size.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          segment.engagement === 'Alto' ? 'bg-green-500/20 text-green-400' :
                          segment.engagement === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                        }`}>{segment.engagement}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`font-medium ${segment.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{segment.growth}</span>
                      </td>
                      <td className="py-4 text-right text-dark-400 text-sm">{segment.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
