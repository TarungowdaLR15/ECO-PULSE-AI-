import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import CopilotDrawer from '../copilot/CopilotDrawer';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

type NotificationType = 'success' | 'warning' | 'error' | 'info';

const TOAST_STYLES: Record<
  NotificationType,
  { border: string; bg: string; icon: React.ReactNode; label: string }
> = {
  success: {
    border: 'border-l-emerald',
    bg: 'bg-emerald/10',
    icon: <CheckCircle className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />,
    label: 'Success',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/10',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
    label: 'Warning',
  },
  error: {
    border: 'border-l-red-500',
    bg: 'bg-red-500/10',
    icon: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
    label: 'Error',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/10',
    icon: <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />,
    label: 'Info',
  },
};

export default function MainLayout({
  children,
  currentPage,
  onNavigate,
}: MainLayoutProps) {
  const { notifications, dismissNotification } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarCollapsed((v) => !v);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onToggleSidebar={handleToggleSidebar}
          onOpenCopilot={() => setIsCopilotOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div data-search={searchQuery} className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* ── Floating AI Copilot Trigger (Bottom-Right) ── */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-emerald to-emerald-bright text-bg-primary font-bold shadow-emerald-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
        title="Open EcoPulse AI Copilot"
      >
        <Sparkles className="w-5 h-5 text-bg-primary" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs whitespace-nowrap font-semibold">
          Ask Copilot
        </span>
      </button>

      {/* ── AI Copilot Drawer ── */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* ── Toast Notifications Stack ── */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => {
            const styles = TOAST_STYLES[n.type];
            return (
              <motion.div
                layout
                key={n.id}
                initial={{ opacity: 0, x: -40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] px-4 py-3 ${styles.bg} backdrop-blur-md border border-white/10 border-l-4 ${styles.border} rounded-xl shadow-2xl pointer-events-auto`}
              >
                {styles.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">{n.title}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotification(n.id)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
