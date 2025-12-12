'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  BarChart3,
  Mail,
  ShoppingCart,
  HelpCircle,
  Moon,
  Sun,
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Store
} from 'lucide-react'

// Worder Logo Component
const WorderLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { pill: 'w-2 h-5', circle: 'w-2 h-2', gap: 'gap-0.5' },
    md: { pill: 'w-2.5 h-7', circle: 'w-2.5 h-2.5', gap: 'gap-0.5' },
    lg: { pill: 'w-3 h-8', circle: 'w-3 h-3', gap: 'gap-0.5' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-end ${s.gap}`}>
      <div className={`${s.pill} rounded-full bg-gradient-to-b from-primary-500 to-primary-600`} />
      <div className={`flex flex-col ${s.gap} mb-0.5`}>
        <div className={`flex ${s.gap}`}>
          <div className={`${s.circle} rounded-full bg-gradient-to-br from-accent-400 to-accent-500`} />
          <div className={`${s.circle} rounded-full bg-gradient-to-br from-accent-300 to-accent-400`} />
        </div>
        <div className={`flex ${s.gap}`}>
          <div className={`${s.circle} rounded-full bg-gradient-to-br from-primary-400 to-primary-500`} />
          <div className={`${s.circle} rounded-full bg-gradient-to-br from-accent-400 to-accent-500`} />
        </div>
      </div>
    </div>
  );
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Automações', href: '/automations', icon: Zap },
]

const analyticsNav = [
  { name: 'E-mail Marketing', href: '/analytics/email', icon: Mail },
  { name: 'E-commerce', href: '/analytics/ecommerce', icon: ShoppingCart },
  { name: 'Relatórios', href: '/analytics/reports', icon: BarChart3 },
]

const systemNav = [
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Ajuda', href: '/help', icon: HelpCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const NavLink = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <Link href={item.href}>
        <motion.div
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
            ${isActive
              ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-white'
              : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
            }
          `}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full"
            />
          )}
          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-dark-800/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <WorderLogo size="md" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-1"
              >
                <h1 className="text-xl font-bold text-white">
                  Worder
                </h1>
                <p className="text-[10px] text-dark-500 -mt-0.5">by Convertfy</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">
              Principal
            </p>
          )}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Analytics */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">
              Analytics
            </p>
          )}
          <nav className="space-y-1">
            {analyticsNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* System */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">
              Sistema
            </p>
          )}
          <nav className="space-y-1">
            {systemNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-dark-800/50">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">João Demo</p>
                <p className="text-xs text-dark-400 truncate">joao@convertfy.com</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button className="p-1.5 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse button - Desktop only */}
      <div className="hidden lg:block p-3 pt-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 text-dark-400 hover:text-white transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-dark-800/50 text-dark-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <WorderLogo size="sm" />
            <span className="font-semibold text-white">Worder</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-dark-800/50 text-dark-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-dark-900/95 backdrop-blur-xl border-r border-dark-800/50 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-dark-800/50 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-dark-900/50 backdrop-blur-xl border-r border-dark-800/50 z-40"
      >
        <SidebarContent />
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        className="min-h-screen lg:ml-[280px] pt-[72px] lg:pt-0"
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-6 py-4 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Buscar em tudo..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-dark-700/50 rounded text-[10px] text-dark-400 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700/50 transition-all relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {notifications}
                </span>
              )}
            </button>
            <div className="w-px h-8 bg-dark-800" />
            <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-dark-800/50 transition-all">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">João Demo</p>
                <p className="text-xs text-dark-400">Admin</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
