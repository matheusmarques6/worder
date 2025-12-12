'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Mail,
  MousePointerClick,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Target,
  Percent,
  Zap,
  Package,
  CreditCard,
  Receipt,
  PiggyBank,
  BarChart3,
  TrendingUp as Growth,
  Store,
  Facebook,
  Activity,
  ChevronDown
} from 'lucide-react'
import {
  AdsPlatformCard,
  AdsTrendChart,
  SpendDistributionChart,
  TopAdsList,
  AdsSummaryCards,
  FacebookIcon,
  GoogleIcon,
  TiktokIcon,
} from '@/components/ads'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line
} from 'recharts'

// Mock data - Profitfy style financial data
const financialSummary = [
  { date: '16/11', receita: 12500, custos: 4200, marketing: 2100, impostos: 850, lucro: 5350 },
  { date: '17/11', receita: 15800, custos: 5100, marketing: 2800, impostos: 1050, lucro: 6850 },
  { date: '18/11', receita: 14200, custos: 4800, marketing: 2400, impostos: 950, lucro: 6050 },
  { date: '19/11', receita: 16500, custos: 5500, marketing: 3200, impostos: 1100, lucro: 6700 },
  { date: '20/11', receita: 18900, custos: 6200, marketing: 3800, impostos: 1260, lucro: 7640 },
  { date: '21/11', receita: 17200, custos: 5800, marketing: 3100, impostos: 1150, lucro: 7150 },
  { date: '22/11', receita: 19500, custos: 6500, marketing: 3500, impostos: 1300, lucro: 8200 },
]

const storesData = [
  { name: 'Loja Principal', pedidos: 25606, receita: 1447806.48, custos: 567478.90, lucro: 880327.58, margem: 60.8 },
  { name: 'Loja Outlet', pedidos: 10738, receita: 570244.65, custos: 1159760.25, lucro: -589515.61, margem: -103.38 },
]

const attributionData = [
  { name: 'E-mail Marketing', value: 42, color: '#f97316' },
  { name: 'WhatsApp', value: 28, color: '#22c55e' },
  { name: 'Direto', value: 18, color: '#eab308' },
  { name: 'Pago', value: 12, color: '#3b82f6' },
]

const topCampaigns = [
  { id: 1, name: 'Black Friday 2024', sent: 45000, opens: 18500, clicks: 4200, revenue: 125000, conversion: 3.2 },
  { id: 2, name: 'Recuperação Carrinho', sent: 12000, opens: 7200, clicks: 2400, revenue: 89000, conversion: 8.5 },
  { id: 3, name: 'Welcome Series', sent: 38000, opens: 15200, clicks: 3800, revenue: 67000, conversion: 2.8 },
  { id: 4, name: 'Newsletter #48', sent: 42000, opens: 16800, clicks: 3200, revenue: 45000, conversion: 1.9 },
  { id: 5, name: 'Pós-Compra Upsell', sent: 8500, opens: 5100, clicks: 1800, revenue: 52000, conversion: 6.2 },
]

// Mock data for Ads Performance
const adsMetrics = {
  meta: { spend: 42300, revenue: 186400, roas: 4.41, cpa: 28.50, change: 12.5 },
  google: { spend: 31200, revenue: 142800, roas: 4.58, cpa: 22.10, change: -8.2 },
  tiktok: { spend: 18500, revenue: 67200, roas: 3.63, cpa: 35.20, change: 45.3 },
}

const adsTrendData = [
  { label: '16/11', meta: 4100, google: 3800, tiktok: 1900 },
  { label: '17/11', meta: 4500, google: 3900, tiktok: 2100 },
  { label: '18/11', meta: 3900, google: 3700, tiktok: 1800 },
  { label: '19/11', meta: 5200, google: 4200, tiktok: 2300 },
  { label: '20/11', meta: 5800, google: 4400, tiktok: 2500 },
  { label: '21/11', meta: 5500, google: 4300, tiktok: 2400 },
  { label: '22/11', meta: 6200, google: 4600, tiktok: 2700 },
]

const spendDistribution = [
  { name: 'Facebook Ads', value: 42300, color: '#1877F2' },
  { name: 'Google Ads', value: 31200, color: '#EA4335' },
  { name: 'TikTok Ads', value: 18500, color: '#18181B' },
]

const topAds = [
  { id: '1', name: 'Retargeting - Carrinho Abandonado', platform: 'meta' as const, spend: 12450, revenue: 89200, roas: 7.16 },
  { id: '2', name: 'Shopping - Bestsellers', platform: 'google' as const, spend: 8900, revenue: 52300, roas: 5.87 },
  { id: '3', name: 'UGC - Produto Viral', platform: 'tiktok' as const, spend: 5200, revenue: 28400, roas: 5.46 },
  { id: '4', name: 'Lookalike - Compradores', platform: 'meta' as const, spend: 15800, revenue: 67200, roas: 4.25 },
  { id: '5', name: 'Search - Marca', platform: 'google' as const, spend: 3200, revenue: 41500, roas: 12.96 },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatCompact = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value)
}

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`
}

interface MetricCardProps {
  title: string
  value: string
  change?: number
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
  highlight?: boolean
  onClick?: () => void
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconBg = 'bg-dark-700/50',
  iconColor = 'text-primary-400',
  highlight = false,
  onClick
}: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    onClick={onClick}
    className={`
      relative rounded-xl p-5 cursor-pointer transition-all duration-300
      ${highlight 
        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20' 
        : 'bg-dark-800/60 border border-dark-700/50 hover:border-dark-600'
      }
    `}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${highlight ? 'bg-white/20' : iconBg}`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-white' : iconColor}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${highlight ? 'text-white/80' : 'text-dark-400'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-0.5 ${highlight ? 'text-white' : 'text-white'}`}>{value}</p>
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          highlight 
            ? change >= 0 ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-200'
            : change >= 0 ? 'bg-success-500/10 text-success-400' : 'bg-error-500/10 text-error-400'
        }`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  </motion.div>
)

interface SmallMetricCardProps {
  title: string
  value: string
  change?: number
  icon: React.ElementType
  iconColor?: string
}

const SmallMetricCard = ({ title, value, change, icon: Icon, iconColor = 'text-primary-400' }: SmallMetricCardProps) => (
  <div className="bg-dark-800/60 rounded-xl p-4 border border-dark-700/40 hover:border-dark-600 transition-all">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-dark-700/50">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-dark-400">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-bold text-white">{value}</span>
          {change !== undefined && (
            <span className={`text-xs font-medium ${change >= 0 ? 'text-success-400' : 'text-error-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/95 backdrop-blur-sm border border-dark-700/50 rounded-xl p-4 shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-dark-400">{entry.name}:</span>
            <span className="text-white font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('7 Dias')
  const [selectedStore, setSelectedStore] = useState('all')

  // Calculate totals
  const totalReceita = 66337.24
  const totalLucro = 2203.35
  const totalCustos = 45713.53
  const totalReceitaAprovada = 45713.53

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-dark-400 mt-1">Visão geral das suas métricas financeiras</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-300 hover:text-white hover:border-dark-600 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          
          {/* Date Range Selector - Profitfy style */}
          <div className="flex items-center bg-dark-800/50 border border-dark-700 rounded-xl p-1">
            {['Hoje', 'Ontem', '7 Dias', 'Este mês', 'Customizado'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === range
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Actions dropdown */}
          <button className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-300 hover:text-white hover:border-dark-600 transition-all">
            Ações
            <ArrowDownRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Metrics Row - Profitfy/BK style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(7410.52)}
          change={15.7}
          icon={DollarSign}
          iconBg="bg-success-500/10"
          iconColor="text-success-400"
          highlight={true}
        />
        <MetricCard
          title="Custo dos Produtos"
          value={formatCurrency(2699.58)}
          change={12.5}
          icon={Package}
          iconBg="bg-primary-500/10"
          iconColor="text-primary-400"
        />
        <MetricCard
          title="Marketing"
          value={formatCurrency(2070.51)}
          change={294.9}
          icon={Facebook}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Taxas e Impostos"
          value={formatCurrency(437.08)}
          change={5.9}
          icon={Receipt}
          iconBg="bg-primary-500/10"
          iconColor="text-primary-400"
        />
        <div className="bg-dark-800/60 rounded-xl p-5 border border-dark-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-dark-400">Margem</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              true ? 'bg-error-500/10 text-error-400' : 'bg-success-500/10 text-success-400'
            }`}>
              ↓ 137%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">14,4%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary Chart - Stacked Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Resumo Financeiro</h3>
              <p className="text-sm text-dark-400">Receita vs Custos</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-dark-400">Receita Bruta</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalReceita)}</p>
              </div>
              <div className="text-right">
                <p className="text-dark-400">Receita total pela data de aprovação</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalReceitaAprovada)}</p>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="custos" name="Custos" stackId="a" fill="#ea580c" radius={[0, 0, 0, 0]} />
                <Bar dataKey="marketing" name="Marketing" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="impostos" name="Impostos" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="#f97316" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {[
              { name: 'Custos', color: '#ea580c' },
              { name: 'Marketing', color: '#22c55e' },
              { name: 'Impostos', color: '#3b82f6' },
              { name: 'Lucro', color: '#eab308' },
              { name: 'Receita', color: '#f97316' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-dark-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lucro Líquido Card - BK style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Lucro Líquido</h3>
            <button className="text-xs text-primary-400 hover:text-primary-300">Ver detalhes →</button>
          </div>
          <div className="mb-6">
            <p className="text-4xl font-bold text-primary-400">{formatCurrency(totalLucro)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-error-500/10 text-error-400 text-xs font-medium rounded-full flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                28,14%
              </span>
              <span className="text-xs text-dark-400">a menos neste período</span>
            </div>
          </div>
          
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-20 mb-6">
            {[40, 65, 55, 80, 70, 90, 75, 60, 85, 95, 70, 80].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-success-600 to-success-400 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
            <span className="text-sm text-dark-400">Incluir valores adicionais</span>
            <button className="w-10 h-5 bg-dark-700 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stores Table - BK Multi-Store style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">TODAS AS LOJAS</h3>
            <span className="px-2 py-0.5 bg-dark-700 text-dark-300 text-xs font-medium rounded-full">2</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-dark-700">
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Loja</th>
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Pedidos</th>
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Receita</th>
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Custo Total</th>
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Lucro</th>
                <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Margem de Lucro</th>
              </tr>
            </thead>
            <tbody>
              {storesData.map((store, index) => (
                <tr key={store.name} className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                        <Store className="w-4 h-4 text-accent-400" />
                      </div>
                      <span className="font-medium text-white">{store.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium text-dark-200">{formatNumber(store.pedidos)}</td>
                  <td className="py-4 text-right font-medium text-dark-200">{formatCurrency(store.receita)}</td>
                  <td className="py-4 text-right font-medium text-dark-200">{formatCurrency(store.custos)}</td>
                  <td className={`py-4 text-right font-medium ${store.lucro >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                    {formatCurrency(store.lucro)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-medium ${store.margem >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                        {formatPercent(store.margem)}
                      </span>
                      <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${store.margem >= 0 ? 'bg-success-500' : 'bg-error-500'}`}
                          style={{ width: `${Math.min(Math.abs(store.margem), 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ADS PERFORMANCE SECTION */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">NOVO</span>
          <h2 className="text-xl font-bold text-white">Performance de Ads</h2>
          <div className="flex items-center gap-2 ml-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
              <FacebookIcon className="w-3 h-3" /> Facebook
            </span>
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded flex items-center gap-1">
              <GoogleIcon className="w-3 h-3" /> Google
            </span>
            <span className="px-2 py-1 bg-dark-700 text-white text-xs rounded flex items-center gap-1">
              <TiktokIcon className="w-3 h-3" /> TikTok
            </span>
          </div>
        </div>

        {/* Ads Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdsPlatformCard
            platform="meta"
            spend={adsMetrics.meta.spend}
            spendChange={adsMetrics.meta.change}
            revenue={adsMetrics.meta.revenue}
            roas={adsMetrics.meta.roas}
            cpa={adsMetrics.meta.cpa}
            isConnected={true}
          />
          <AdsPlatformCard
            platform="google"
            spend={adsMetrics.google.spend}
            spendChange={adsMetrics.google.change}
            revenue={adsMetrics.google.revenue}
            roas={adsMetrics.google.roas}
            cpa={adsMetrics.google.cpa}
            isConnected={true}
          />
          <AdsPlatformCard
            platform="tiktok"
            spend={adsMetrics.tiktok.spend}
            spendChange={adsMetrics.tiktok.change}
            revenue={adsMetrics.tiktok.revenue}
            roas={adsMetrics.tiktok.roas}
            cpa={adsMetrics.tiktok.cpa}
            isConnected={true}
          />
        </div>

        {/* Ads Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2">
            <AdsTrendChart data={adsTrendData} />
          </div>
          
          {/* Top Ads */}
          <TopAdsList ads={topAds} />
        </div>
      </div>

      {/* Marketing Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SmallMetricCard
          title="Anúncios"
          value="R$ 933.712"
          change={-3}
          icon={Facebook}
          iconColor="text-blue-400"
        />
        <SmallMetricCard
          title="CPA"
          value="R$ 25,69"
          change={-56}
          icon={Target}
          iconColor="text-primary-400"
        />
        <SmallMetricCard
          title="ROI"
          value="16,8%"
          change={-160}
          icon={TrendingUp}
          iconColor="text-success-400"
        />
        <SmallMetricCard
          title="ROAS"
          value="116,1%"
          change={-309}
          icon={BarChart3}
          iconColor="text-accent-400"
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SmallMetricCard
          title="C. de Produto"
          value="R$ 645.106"
          change={115}
          icon={Package}
          iconColor="text-success-400"
        />
        <SmallMetricCard
          title="Pedidos"
          value="36.344"
          change={120}
          icon={ShoppingCart}
          iconColor="text-primary-400"
        />
        <SmallMetricCard
          title="Ticket Médio"
          value="R$ 55,53"
          change={-5}
          icon={CreditCard}
          iconColor="text-error-400"
        />
        <SmallMetricCard
          title="Unidades Vendidas"
          value="51.212"
          change={114}
          icon={Activity}
          iconColor="text-success-400"
        />
      </div>

      {/* Bottom Row - Attribution & Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Atribuição de Receita</h3>
              <p className="text-sm text-dark-400">Por canal de aquisição</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {attributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-dark-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Campanhas</h3>
              <p className="text-sm text-dark-400">Por receita gerada</p>
            </div>
            <button className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {topCampaigns.slice(0, 5).map((campaign, index) => (
              <div
                key={campaign.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-400">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{campaign.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-dark-500">{formatNumber(campaign.sent)} enviados</span>
                    <span className="text-xs text-dark-500">{formatPercent(campaign.opens/campaign.sent*100)} abertura</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success-400">{formatCurrency(campaign.revenue)}</p>
                  <p className="text-xs text-dark-500">{formatPercent(campaign.conversion)} conv.</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Goals Card - BK Metas style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-dark-800/40 rounded-2xl border border-dark-700/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Meta de Faturamento</h3>
            <p className="text-sm text-dark-400">Progresso mensal</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Goal Progress Circle */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#goalGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${100 * 2.51} ${100 * 2.51}`}
                  strokeDashoffset={(100 - 100) * 2.51}
                />
                <defs>
                  <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-success-400">100%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-400">Meta</p>
              <p className="text-2xl font-bold text-primary-400">R$ 1.652.000</p>
              <button className="mt-2 text-xs text-primary-400 hover:text-primary-300">
                Cadastrar meta →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
