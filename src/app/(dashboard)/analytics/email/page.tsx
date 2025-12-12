'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointerClick,
  Eye,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Send,
  UserMinus,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock data
const deliveryData = [
  { date: 'Seg', sent: 4500, delivered: 4400, opened: 1800, clicked: 450 },
  { date: 'Ter', sent: 5200, delivered: 5100, opened: 2100, clicked: 520 },
  { date: 'Qua', sent: 4800, delivered: 4700, opened: 1950, clicked: 480 },
  { date: 'Qui', sent: 5500, delivered: 5400, opened: 2250, clicked: 560 },
  { date: 'Sex', sent: 6200, delivered: 6100, opened: 2550, clicked: 640 },
  { date: 'Sáb', sent: 3200, delivered: 3100, opened: 1300, clicked: 320 },
  { date: 'Dom', sent: 2800, delivered: 2700, opened: 1100, clicked: 280 },
];

const hourlyData = [
  { hour: '00h', opens: 120 }, { hour: '02h', opens: 80 }, { hour: '04h', opens: 60 },
  { hour: '06h', opens: 180 }, { hour: '08h', opens: 450 }, { hour: '10h', opens: 680 },
  { hour: '12h', opens: 520 }, { hour: '14h', opens: 380 }, { hour: '16h', opens: 420 },
  { hour: '18h', opens: 350 }, { hour: '20h', opens: 280 }, { hour: '22h', opens: 200 },
];

const campaigns = [
  { id: 1, name: 'Black Friday 2024', type: 'Campanha', sent: 45000, delivered: 44100, opens: 18500, clicks: 4200, revenue: 125000, status: 'sent' },
  { id: 2, name: 'Lançamento Verão', type: 'Campanha', sent: 38000, delivered: 37200, opens: 15200, clicks: 3800, revenue: 98000, status: 'sent' },
  { id: 3, name: 'Newsletter #48', type: 'Newsletter', sent: 42000, delivered: 41160, opens: 16800, clicks: 3200, revenue: 45000, status: 'sent' },
  { id: 4, name: 'Promo de Natal', type: 'Campanha', sent: 0, delivered: 0, opens: 0, clicks: 0, revenue: 0, status: 'scheduled' },
];

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EmailAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const stats = [
    { label: 'Emails Enviados', value: '1.2M', change: 8.5, trend: 'up', icon: Send, color: 'violet' },
    { label: 'Taxa de Entrega', value: '98.2%', change: 0.3, trend: 'up', icon: Target, color: 'emerald' },
    { label: 'Taxa de Abertura', value: '42.3%', change: 3.2, trend: 'up', icon: Eye, color: 'cyan' },
    { label: 'Taxa de Cliques', value: '8.5%', change: -0.8, trend: 'down', icon: MousePointerClick, color: 'amber' },
    { label: 'Descadastros', value: '0.12%', change: -0.02, trend: 'up', icon: UserMinus, color: 'red' },
    { label: 'Receita', value: 'R$ 342k', change: 15.2, trend: 'up', icon: DollarSign, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">E-mail Marketing</h1>
          <p className="text-slate-400 mt-1">Métricas detalhadas de suas campanhas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/50 rounded-xl p-1">
            {['7d', '30d', '90d', '12m'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  dateRange === range ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  stat.color === 'violet' && 'bg-violet-500/10',
                  stat.color === 'emerald' && 'bg-emerald-500/10',
                  stat.color === 'cyan' && 'bg-cyan-500/10',
                  stat.color === 'amber' && 'bg-amber-500/10',
                  stat.color === 'red' && 'bg-red-500/10'
                )}>
                  <stat.icon className={cn(
                    'w-4 h-4',
                    stat.color === 'violet' && 'text-violet-400',
                    stat.color === 'emerald' && 'text-emerald-400',
                    stat.color === 'cyan' && 'text-cyan-400',
                    stat.color === 'amber' && 'text-amber-400',
                    stat.color === 'red' && 'text-red-400'
                  )} />
                </div>
                <div className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  stat.trend === 'up' && stat.label !== 'Descadastros' ? 'text-emerald-400' : 
                  stat.trend === 'up' && stat.label === 'Descadastros' ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Performance de Entrega</h3>
                <p className="text-sm text-slate-400">Enviados, entregues, abertos e clicados</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deliveryData}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sent" name="Enviados" stroke="#8b5cf6" strokeWidth={2} fill="url(#sentGrad)" />
                  <Area type="monotone" dataKey="opened" name="Abertos" stroke="#06b6d4" strokeWidth={2} fill="url(#openedGrad)" />
                  <Line type="monotone" dataKey="clicked" name="Clicados" stroke="#10b981" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Best Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" className="p-6 h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Melhores Horários</h3>
              <p className="text-sm text-slate-400">Aberturas por hora</p>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="hour" stroke="#64748b" fontSize={11} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    formatter={(value: number) => [formatNumber(value), 'Aberturas']}
                  />
                  <Bar dataKey="opens" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Campanhas Recentes</h3>
              <p className="text-sm text-slate-400">Desempenho detalhado</p>
            </div>
            <Button variant="ghost" size="sm">Ver todas</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Campanha</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Enviados</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Entrega</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Abertura</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Cliques</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Receita</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white">{campaign.name}</p>
                        <p className="text-xs text-slate-400">{campaign.type}</p>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 text-white">
                      {formatNumber(campaign.sent)}
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className="text-emerald-400">
                        {campaign.sent > 0 ? formatPercent((campaign.delivered / campaign.sent) * 100) : '-'}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className="text-cyan-400">
                        {campaign.delivered > 0 ? formatPercent((campaign.opens / campaign.delivered) * 100) : '-'}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className="text-amber-400">
                        {campaign.opens > 0 ? formatPercent((campaign.clicks / campaign.opens) * 100) : '-'}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4 font-semibold text-emerald-400">
                      {campaign.revenue > 0 ? formatCurrency(campaign.revenue) : '-'}
                    </td>
                    <td className="text-center py-4 px-4">
                      <Badge variant={campaign.status === 'sent' ? 'success' : 'warning'}>
                        {campaign.status === 'sent' ? 'Enviada' : 'Agendada'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Health Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alertas de Saúde</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Taxa de bounce aumentou 0.5%</p>
                <p className="text-xs text-slate-400">Verifique a qualidade da lista de emails</p>
              </div>
              <Button variant="ghost" size="sm">Ver detalhes</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Reputação de envio: Excelente</p>
                <p className="text-xs text-slate-400">Todos os indicadores estão saudáveis</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  );
}
