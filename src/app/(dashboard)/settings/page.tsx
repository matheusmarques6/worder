'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Plug,
  Mail,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Globe,
  Palette,
  Moon,
  Sun,
} from 'lucide-react';
import { Button, Input, Card, Badge, Avatar, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';

// Integration icons (simulated)
const ShopifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#95BF47]">
    <path d="M15.337 3.415c-.042-.33-.378-.504-.63-.504-.252 0-.504.042-.504.042s-1.092.126-1.512.168c-.084.084-.168.21-.294.378-.378.63-.882 1.512-.882 1.512l-2.31 1.092c-.126.042-.252.084-.378.168-.168.084-.294.21-.378.378-.126.21-.168.462-.168.714v.042l-1.344 10.458c-.084.714.462 1.344 1.176 1.386.042 0 .084 0 .126 0h.042l6.888-.378c.714-.042 1.26-.672 1.218-1.386l-.84-12.6c-.042 0-.126-.042-.21-.084z"/>
  </svg>
);

const KlaviyoIcon = () => (
  <div className="w-6 h-6 bg-[#2a2a2a] rounded flex items-center justify-center">
    <span className="text-[#28c76f] font-bold text-xs">K</span>
  </div>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.188 8.188 0 01-1.26-4.38c.01-4.54 3.7-8.25 8.25-8.25z"/>
  </svg>
);

// Tabs
const settingsTabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'store', label: 'Loja', icon: Building2 },
  { id: 'integrations', label: 'Integrações', icon: Plug },
  { id: 'billing', label: 'Faturamento', icon: CreditCard },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'api', label: 'API', icon: Key },
];

// Integration configs
const integrations = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sincronize pedidos, clientes e produtos',
    icon: ShopifyIcon,
    connected: true,
    status: 'healthy',
    lastSync: '5 min atrás',
    stats: { orders: '12.5k', customers: '8.2k', products: '450' },
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Importe campanhas, flows e métricas',
    icon: KlaviyoIcon,
    connected: true,
    status: 'healthy',
    lastSync: '10 min atrás',
    stats: { campaigns: '45', flows: '12', contacts: '24.5k' },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Envie mensagens e gerencie conversas',
    icon: WhatsAppIcon,
    connected: true,
    status: 'warning',
    lastSync: '1 hora atrás',
    stats: { messages: '5.2k', templates: '8' },
    warning: 'Limite de mensagens próximo (85%)',
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Sincronize públicos e acompanhe ROAS',
    icon: () => (
      <div className="w-6 h-6 bg-[#1877F2] rounded flex items-center justify-center">
        <span className="text-white font-bold text-sm">f</span>
      </div>
    ),
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'google',
    name: 'Google Analytics',
    description: 'Acompanhe tráfego e conversões',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path fill="#F9AB00" d="M12 2L2 7l10 5 10-5-10-5z" />
        <path fill="#E37400" d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    connected: false,
    status: 'disconnected',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useUIStore();
  const [showApiKey, setShowApiKey] = useState(false);

  // Mock data
  const user = {
    name: 'João Silva',
    email: 'joao@minhaloja.com',
    phone: '+55 11 99999-9999',
    company: 'Minha Loja',
  };

  const apiKey = 'wrd_live_sk_1234567890abcdef1234567890abcdef';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie sua conta e integrações</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card variant="glass" className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Informações Pessoais</h2>
                  
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                      <Avatar fallback={user.name?.substring(0, 2) || 'U'} size="xl" />
                      <button className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors">
                        <Upload className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-slate-400">{user.email}</p>
                      <Badge variant="primary" className="mt-2">Plano Pro</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nome completo" defaultValue={user.name} />
                    <Input label="Email" type="email" defaultValue={user.email} />
                    <Input label="Telefone" defaultValue={user.phone} />
                    <Input label="Empresa" defaultValue={user.company} />
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="primary">Salvar Alterações</Button>
                  </div>
                </Card>
              )}

              {/* Store Tab */}
              {activeTab === 'store' && (
                <div className="space-y-6">
                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Dados da Loja</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Nome da loja" defaultValue="Minha Loja" />
                      <Input label="URL da loja" defaultValue="minhaloja.com.br" leftIcon={<Globe className="w-4 h-4" />} />
                      <Input label="Email de suporte" type="email" defaultValue="suporte@minhaloja.com" />
                      <Input label="Moeda" defaultValue="BRL - Real Brasileiro" disabled />
                    </div>

                    <div className="mt-4">
                      <Textarea 
                        label="Descrição" 
                        defaultValue="Loja de roupas e acessórios com foco em moda sustentável."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button variant="primary">Salvar Alterações</Button>
                    </div>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Aparência</h2>
                    <p className="text-sm text-slate-400 mb-6">Personalize a aparência do dashboard</p>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-slate-400" />
                        ) : (
                          <Sun className="w-5 h-5 text-amber-400" />
                        )}
                        <div>
                          <p className="font-medium text-white">Tema</p>
                          <p className="text-sm text-slate-400">
                            {theme === 'dark' ? 'Modo escuro' : 'Modo claro'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="relative w-14 h-7 bg-slate-700 rounded-full transition-colors"
                      >
                        <div
                          className={cn(
                            'absolute top-1 w-5 h-5 rounded-full bg-primary transition-all',
                            theme === 'dark' ? 'left-1' : 'left-8'
                          )}
                        />
                      </button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <Card key={integration.id} variant="glass" className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-800/50 rounded-xl">
                          <integration.icon />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{integration.name}</h3>
                            {integration.connected ? (
                              <Badge variant={integration.status === 'healthy' ? 'success' : 'warning'}>
                                {integration.status === 'healthy' ? 'Conectado' : 'Atenção'}
                              </Badge>
                            ) : (
                              <Badge variant="default">Desconectado</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{integration.description}</p>
                          
                          {integration.connected && (
                            <>
                              <div className="flex items-center gap-4 mt-3">
                                {integration.stats && Object.entries(integration.stats).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="text-slate-500 capitalize">{key}: </span>
                                    <span className="text-white font-medium">{value}</span>
                                  </div>
                                ))}
                              </div>
                              {integration.warning && (
                                <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 rounded-lg">
                                  <AlertCircle className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs text-amber-400">{integration.warning}</span>
                                </div>
                              )}
                              <p className="text-xs text-slate-500 mt-2">
                                Última sincronização: {integration.lastSync}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {integration.connected ? (
                            <>
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="primary" size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Conectar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Plano Atual</h2>
                        <p className="text-slate-400 mt-1">Gerencie sua assinatura</p>
                      </div>
                      <Badge variant="primary" className="text-lg px-4 py-1">Pro</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-400">Contatos</p>
                        <p className="text-2xl font-bold text-white mt-1">24.5k <span className="text-sm font-normal text-slate-400">/ 50k</span></p>
                        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                          <div className="w-[49%] h-full bg-primary rounded-full" />
                        </div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-400">Emails / mês</p>
                        <p className="text-2xl font-bold text-white mt-1">425k <span className="text-sm font-normal text-slate-400">/ 500k</span></p>
                        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                          <div className="w-[85%] h-full bg-amber-500 rounded-full" />
                        </div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-400">WhatsApp / mês</p>
                        <p className="text-2xl font-bold text-white mt-1">4.2k <span className="text-sm font-normal text-slate-400">/ 5k</span></p>
                        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
                          <div className="w-[84%] h-full bg-amber-500 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-medium text-white">Próximo pagamento: R$ 497,00</p>
                        <p className="text-sm text-slate-400">Em 15 de Janeiro de 2025</p>
                      </div>
                      <Button variant="secondary">Upgrade</Button>
                    </div>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Método de Pagamento</h2>
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <CreditCard className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">•••• •••• •••• 4242</p>
                        <p className="text-sm text-slate-400">Expira em 12/2026</p>
                      </div>
                      <Button variant="ghost" size="sm">Alterar</Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card variant="glass" className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Preferências de Notificação</h2>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'email_reports', label: 'Relatórios semanais por email', description: 'Receba um resumo semanal de performance', enabled: true },
                      { id: 'email_campaigns', label: 'Conclusão de campanhas', description: 'Notificação quando uma campanha for enviada', enabled: true },
                      { id: 'email_alerts', label: 'Alertas de limite', description: 'Aviso quando atingir 80% do limite', enabled: true },
                      { id: 'push_whatsapp', label: 'Novas mensagens WhatsApp', description: 'Notificação push para novas conversas', enabled: false },
                      { id: 'push_crm', label: 'Atualizações do CRM', description: 'Quando um deal mudar de estágio', enabled: false },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-slate-400">{item.description}</p>
                        </div>
                        <button
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            item.enabled ? 'bg-primary' : 'bg-slate-700'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                              item.enabled ? 'left-7' : 'left-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Alterar Senha</h2>
                    <div className="space-y-4 max-w-md">
                      <Input label="Senha atual" type="password" />
                      <Input label="Nova senha" type="password" />
                      <Input label="Confirmar nova senha" type="password" />
                      <Button variant="primary">Alterar Senha</Button>
                    </div>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Autenticação em Dois Fatores</h2>
                    <p className="text-slate-400 mb-4">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-white">2FA via Aplicativo</p>
                          <p className="text-sm text-slate-400">Google Authenticator ou similar</p>
                        </div>
                      </div>
                      <Badge variant="default">Desativado</Badge>
                    </div>
                    <Button variant="secondary" className="mt-4">
                      Ativar 2FA
                    </Button>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Sessões Ativas</h2>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome em MacOS', location: 'São Paulo, BR', current: true },
                        { device: 'Safari em iPhone', location: 'São Paulo, BR', current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                          <div>
                            <p className="font-medium text-white">{session.device}</p>
                            <p className="text-sm text-slate-400">{session.location}</p>
                          </div>
                          {session.current ? (
                            <Badge variant="success">Sessão atual</Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-red-400">
                              Encerrar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-2">Chaves de API</h2>
                    <p className="text-slate-400 mb-6">
                      Use estas chaves para integrar com a API do Worder
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Chave de Produção
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center bg-slate-800/50 rounded-xl px-4 py-3 border border-white/5">
                            <code className="flex-1 text-sm text-slate-300 font-mono">
                              {showApiKey ? apiKey : '•'.repeat(apiKey.length)}
                            </code>
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-1 hover:bg-white/5 rounded"
                            >
                              {showApiKey ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Webhooks</h2>
                    <p className="text-slate-400 mb-6">
                      Receba notificações em tempo real sobre eventos
                    </p>

                    <Button variant="secondary">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Webhook
                    </Button>

                    <div className="mt-4 p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
                      <p className="text-slate-400">Nenhum webhook configurado</p>
                    </div>
                  </Card>

                  <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Documentação</h2>
                        <p className="text-slate-400">Aprenda a usar a API</p>
                      </div>
                      <Button variant="secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Docs
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
