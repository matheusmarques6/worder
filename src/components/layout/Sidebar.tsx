'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  BarChart3,
  Workflow,
  Store,
  HelpCircle,
  LogOut,
  Bell,
} from 'lucide-react'
import { Avatar, Tooltip } from '@/components/ui'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'CRM', href: '/crm', icon: Users },
  { title: 'WhatsApp', href: '/whatsapp', icon: MessageSquare, badge: 3 },
  { title: 'Automações', href: '/automations', icon: Zap },
]

const analyticsNavItems: NavItem[] = [
  { title: 'E-mail Marketing', href: '/analytics/email', icon: Mail },
  { title: 'Relatórios', href: '/analytics/reports', icon: BarChart3 },
  { title: 'Flows', href: '/analytics/flows', icon: Workflow },
]

const settingsNavItems: NavItem[] = [
  { title: 'Integrações', href: '/settings/integrations', icon: Store },
  { title: 'Configurações', href: '/settings', icon: Settings },
  { title: 'Ajuda', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    const content = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          'hover:bg-dark-800',
          isActive && 'bg-primary-500/10 text-primary-400',
          !isActive && 'text-dark-400 hover:text-dark-100'
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-400')} />
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
        {item.badge && !sidebarCollapsed && (
          <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {item.badge && sidebarCollapsed && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
        )}
      </Link>
    )

    if (sidebarCollapsed) {
      return (
        <Tooltip content={item.title} side="right">
          <div className="relative">{content}</div>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Worder Logo - Stylized W with pills and circles */}
          <div className="flex items-end gap-0.5">
            {/* Orange pill (vertical) */}
            <div className="w-2.5 h-7 rounded-full bg-gradient-to-b from-primary-500 to-primary-600" />
            {/* Yellow circles */}
            <div className="flex flex-col gap-0.5 mb-0.5">
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-accent-400 to-accent-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-accent-300 to-accent-400" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400 to-primary-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-accent-400 to-accent-500" />
              </div>
            </div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-white overflow-hidden ml-1"
              >
                Worder
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main */}
        <div>
          {!sidebarCollapsed && (
            <p className="px-4 mb-2 text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Principal
            </p>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div>
          {!sidebarCollapsed && (
            <p className="px-4 mb-2 text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Analytics
            </p>
          )}
          <div className="space-y-1">
            {analyticsNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          {!sidebarCollapsed && (
            <p className="px-4 mb-2 text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Sistema
            </p>
          )}
          <div className="space-y-1">
            {settingsNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-dark-700/50">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <Avatar
            fallback="JD"
            size="sm"
            status="online"
          />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium text-dark-100 truncate">João Silva</p>
                <p className="text-xs text-dark-500 truncate">joao@convertfy.com</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

export function Header() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-dark-950/80 backdrop-blur-xl border-b border-dark-700/50 z-30 flex items-center justify-between px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-[280px]'
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar clientes, pedidos, conversas..."
            className="w-full bg-dark-800/50 border border-dark-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-500 bg-dark-700 px-2 py-1 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Quick Actions */}
        <button className="btn-primary text-sm">
          <Zap className="w-4 h-4" />
          Nova Automação
        </button>
      </div>
    </header>
  )
}
