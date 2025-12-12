'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit2,
  Copy,
  Send,
  BarChart3,
  PieChart,
  TrendingUp,
  Mail,
  ShoppingCart,
  Users,
  Target,
  Check,
  X,
} from 'lucide-react';
import { Card, Badge, Button, Input, Spinner } from '@/components/ui';

// Mock data
const savedReports = [
  {
    id: '1',
    name: 'Weekly Email Performance',
    description: 'Comprehensive email metrics with campaign breakdown',
    type: 'email',
    schedule: 'weekly',
    lastRun: '2024-12-09T10:00:00',
    nextRun: '2024-12-16T10:00:00',
    status: 'active',
    recipients: ['team@company.com'],
  },
  {
    id: '2',
    name: 'Monthly Revenue Report',
    description: 'E-commerce revenue, orders, and customer insights',
    type: 'ecommerce',
    schedule: 'monthly',
    lastRun: '2024-12-01T09:00:00',
    nextRun: '2025-01-01T09:00:00',
    status: 'active',
    recipients: ['ceo@company.com', 'finance@company.com'],
  },
  {
    id: '3',
    name: 'Automation ROI Analysis',
    description: 'Performance metrics for all active automations',
    type: 'automation',
    schedule: 'none',
    lastRun: '2024-12-05T14:30:00',
    status: 'manual',
    recipients: [],
  },
  {
    id: '4',
    name: 'Customer Acquisition Report',
    description: 'New customers by channel with conversion data',
    type: 'crm',
    schedule: 'weekly',
    lastRun: '2024-12-08T08:00:00',
    nextRun: '2024-12-15T08:00:00',
    status: 'paused',
    recipients: ['marketing@company.com'],
  },
];

const reportTemplates = [
  {
    id: 'email-performance',
    name: 'Email Performance',
    description: 'Open rates, clicks, conversions by campaign',
    icon: Mail,
    metrics: ['sent', 'delivered', 'opened', 'clicked', 'converted'],
  },
  {
    id: 'revenue-overview',
    name: 'Revenue Overview',
    description: 'Sales, orders, AOV, and trends',
    icon: TrendingUp,
    metrics: ['revenue', 'orders', 'aov', 'refunds'],
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Segments, LTV, retention metrics',
    icon: Users,
    metrics: ['new_customers', 'returning', 'ltv', 'churn'],
  },
  {
    id: 'automation-report',
    name: 'Automation Report',
    description: 'Flow performance and attribution',
    icon: Target,
    metrics: ['triggered', 'completed', 'revenue', 'roi'],
  },
];

const typeColors: Record<string, string> = {
  email: 'text-violet-400 bg-violet-500/20 border-violet-500/30',
  ecommerce: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  automation: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  crm: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
};

const typeIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  automation: <Target className="w-4 h-4" />,
  crm: <Users className="w-4 h-4" />,
};

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule: string;
  lastRun: string;
  nextRun?: string;
  status: string;
  recipients: string[];
}

function ReportCard({ report }: { report: Report }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 hover:border-violet-500/30 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${typeColors[report.type]}`}>
            {typeIcons[report.type]}
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
              {report.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{report.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge
                variant={report.status === 'active' ? 'success' : report.status === 'paused' ? 'warning' : 'default'}
              >
                {report.status}
              </Badge>
              {report.schedule !== 'none' && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.schedule}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl p-2 z-10"
                >
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit Report
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Download Last
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Send className="w-4 h-4" /> Send Now
                  </button>
                  <hr className="my-2 border-slate-700" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Last Run Info */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
        <div className="text-slate-400">
          Last run:{' '}
          <span className="text-slate-300">
            {new Date(report.lastRun).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {report.nextRun && (
          <div className="text-slate-400">
            Next:{' '}
            <span className="text-violet-400">
              {new Date(report.nextRun).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreateReportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [reportName, setReportName] = useState('');
  const [schedule, setSchedule] = useState('none');
  const [recipients, setRecipients] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Create Report</h2>
              <p className="text-sm text-slate-400 mt-1">
                Step {step} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? 'bg-violet-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Choose a template
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <template.icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="font-medium text-white">{template.name}</span>
                    </div>
                    <p className="text-sm text-slate-400">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.metrics.slice(0, 3).map((metric) => (
                        <span
                          key={metric}
                          className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-400"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Report Name
                </label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Weekly Email Performance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Schedule
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'daily', 'weekly', 'monthly'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSchedule(s)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        schedule === s
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s === 'none' ? 'Manual' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Recipients (optional)
                </label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="email@company.com, another@company.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate multiple emails with commas
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Report Created!
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Your report "{reportName || 'New Report'}" has been created successfully.
                {schedule !== 'none' && ` It will run ${schedule}.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onClose();
            }}
            disabled={step === 1 && !selectedTemplate}
          >
            {step === 3 ? 'Done' : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ReportsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = savedReports.filter((report) => {
    const matchesFilter = filter === 'all' || report.type === filter || report.status === filter;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, schedule, and manage your analytics reports
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Reports</p>
              <p className="text-xl font-bold text-white">{savedReports.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Play className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active</p>
              <p className="text-xl font-bold text-white">
                {savedReports.filter((r) => r.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Scheduled</p>
              <p className="text-xl font-bold text-white">
                {savedReports.filter((r) => r.schedule !== 'none').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Runs This Week</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-lg p-1 flex items-center">
            {['all', 'email', 'ecommerce', 'automation', 'crm'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReportCard report={report} />
          </motion.div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-slate-400 mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first report to get started'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateReportModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
