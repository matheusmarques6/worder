'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ShoppingBag,
  Repeat,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, Badge, Button, Spinner } from '@/components/ui';

// Mock data
const revenueData = [
  { date: 'Nov 1', revenue: 12500, orders: 45, aov: 278 },
  { date: 'Nov 5', revenue: 18200, orders: 62, aov: 294 },
  { date: 'Nov 10', revenue: 15800, orders: 51, aov: 310 },
  { date: 'Nov 15', revenue: 22400, orders: 78, aov: 287 },
  { date: 'Nov 20', revenue: 28900, orders: 95, aov: 304 },
  { date: 'Nov 25', revenue: 35200, orders: 112, aov: 314 },
  { date: 'Nov 30', revenue: 31600, orders: 98, aov: 322 },
  { date: 'Dec 5', revenue: 42100, orders: 135, aov: 312 },
  { date: 'Dec 10', revenue: 38500, orders: 121, aov: 318 },
];

const channelData = [
  { name: 'Email', value: 42, revenue: 156800, color: '#8b5cf6' },
  { name: 'Organic', value: 28, revenue: 104500, color: '#06b6d4' },
  { name: 'Paid Ads', value: 18, revenue: 67200, color: '#f59e0b' },
  { name: 'Direct', value: 12, revenue: 44800, color: '#10b981' },
];

const topProducts = [
  { id: 1, name: 'Premium Wireless Headphones', sku: 'WH-PRO-001', revenue: 45600, units: 152, trend: 12.5 },
  { id: 2, name: 'Smart Watch Series X', sku: 'SW-X-002', revenue: 38200, units: 127, trend: 8.3 },
  { id: 3, name: 'Ultra Slim Laptop Stand', sku: 'LS-ULT-003', revenue: 22400, units: 224, trend: -3.2 },
  { id: 4, name: 'Mechanical Keyboard RGB', sku: 'KB-RGB-004', revenue: 18900, units: 189, trend: 15.8 },
  { id: 5, name: 'Ergonomic Mouse Pro', sku: 'MS-PRO-005', revenue: 15600, units: 312, trend: 5.4 },
];

const customerSegments = [
  { segment: 'New Customers', customers: 1245, revenue: 89400, percentage: 24 },
  { segment: 'Returning', customers: 2890, revenue: 198600, percentage: 53 },
  { segment: 'VIP (5+ orders)', customers: 456, revenue: 85200, percentage: 23 },
];

const conversionFunnel = [
  { stage: 'Store Visits', value: 45000, rate: 100 },
  { stage: 'Product Views', value: 28500, rate: 63 },
  { stage: 'Add to Cart', value: 8200, rate: 18 },
  { stage: 'Checkout Started', value: 4100, rate: 9 },
  { stage: 'Purchase', value: 2850, rate: 6.3 },
];

const hourlyOrders = [
  { hour: '00:00', orders: 12 },
  { hour: '03:00', orders: 8 },
  { hour: '06:00', orders: 15 },
  { hour: '09:00', orders: 45 },
  { hour: '12:00', orders: 62 },
  { hour: '15:00', orders: 58 },
  { hour: '18:00', orders: 71 },
  { hour: '21:00', orders: 48 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  subtitle?: string;
}

function StatCard({ title, value, change, icon, trend, subtitle }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend === 'up' ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

export default function EcommerceAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">E-commerce Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your store performance and customer behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card rounded-lg p-1 flex items-center">
            {['7d', '30d', '90d', '12m'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  dateRange === range
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="R$ 373.200"
          change={18.5}
          trend="up"
          icon={<DollarSign className="w-5 h-5 text-violet-400" />}
          subtitle="vs R$ 315.000 last period"
        />
        <StatCard
          title="Orders"
          value="1,247"
          change={12.3}
          trend="up"
          icon={<ShoppingCart className="w-5 h-5 text-cyan-400" />}
          subtitle="2.850 units sold"
        />
        <StatCard
          title="Average Order Value"
          value="R$ 299"
          change={5.2}
          trend="up"
          icon={<CreditCard className="w-5 h-5 text-amber-400" />}
          subtitle="↑ from R$ 284"
        />
        <StatCard
          title="Conversion Rate"
          value="6.33%"
          change={-0.8}
          trend="down"
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          subtitle="Industry avg: 2.5%"
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <p className="text-sm text-slate-400">Daily revenue and order trends</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-slate-400">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-slate-400">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                yAxisId={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Revenue by Channel</h3>
          <div className="flex items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {channelData.map((channel) => (
                <div key={channel.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-sm text-slate-300">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      R$ {(channel.revenue / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-500">{channel.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {stage.rate}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.rate}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Products</h3>
          <Button variant="ghost" size="sm">
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">SKU</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Units</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-sm font-medium text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-400 font-mono">{product.sku}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-white">
                      R$ {product.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm text-slate-300">{product.units}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                      product.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {product.trend >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(product.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
          <div className="space-y-4">
            {customerSegments.map((segment) => (
              <div key={segment.segment} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{segment.segment}</span>
                  <Badge variant="default">{segment.percentage}%</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{segment.customers.toLocaleString()} customers</span>
                  <span className="text-violet-400 font-medium">
                    R$ {(segment.revenue / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Orders by Hour</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Repeat className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Repeat Purchase Rate</p>
            <p className="text-xl font-bold text-white">34.5%</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Avg Items per Order</p>
            <p className="text-xl font-bold text-white">2.3</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Customer LTV</p>
            <p className="text-xl font-bold text-white">R$ 847</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
