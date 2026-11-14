import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Sparkles, CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import DemoBadge from '../ui/DemoBadge';
import { api } from '../../services/api';

interface TopNavProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onToggleSidebar?: () => void;
  onOpenCopilot?: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TopNav({
  onSearch,
  searchQuery,
  onToggleSidebar,
  onOpenCopilot,
}: TopNavProps) {
  const { user, notifications, dismissNotification } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    api.checkHealth().then((res) => setApiOnline(res.healthy));
    const interval = setInterval(() => {
      api.checkHealth().then((res) => setApiOnline(res.healthy));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;
  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AS';

  const today = formatDate(new Date());

  return (
    <header className="flex items-center justify-between gap-4 px-6 h-16 flex-shrink-0 bg-[#101B15] border-b border-emerald/10 relative z-20">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-emerald hover:bg-emerald/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search neighbourhoods, interventions, hazards..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-emerald/15 rounded-xl text-xs text-text-primary placeholder:text-slate-500 focus:outline-none focus:border-emerald/40 transition-colors"
          />
        </div>
      </div>

      {/* Right Cluster */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Live Backend Indicator */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
            apiOnline
              ? 'bg-emerald/10 border-emerald/25 text-emerald-bright'
              : 'bg-danger/10 border-danger/25 text-danger'
          }`}
          title={apiOnline ? 'FastAPI Backend Online (Port 8000)' : 'Backend API Disconnected'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiOnline ? 'bg-emerald animate-pulse' : 'bg-danger'
            }`}
          />
          <span className="hidden md:inline">{apiOnline ? 'FASTAPI: ONLINE' : 'API: OFFLINE'}</span>
        </div>

        {/* Ask AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald/20 to-emerald-bright/20 border border-emerald/30 text-emerald-bright hover:shadow-emerald-glow hover:border-emerald transition-all text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-bright" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Demo Badge */}
        <DemoBadge verbose={false} />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald hover:bg-emerald/10 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 glass-card bg-bg-secondary p-4 shadow-2xl border-emerald/20 z-50 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-text-primary">System Notifications</span>
                  <span className="text-[10px] font-mono text-emerald">{unreadCount} Active</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-text-secondary text-center py-4">No new alerts</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-lg bg-bg-primary/70 border border-white/5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-text-primary">{n.title}</p>
                          <p className="text-text-secondary text-[11px] mt-0.5">{n.message}</p>
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-text-secondary hover:text-text-primary"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-forest text-bg-primary font-bold text-xs flex items-center justify-center border border-emerald/30 shadow-emerald-glow">
            {initials}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-text-primary leading-tight">{user?.name || 'Arjun Sharma'}</p>
            <p className="text-[10px] text-text-secondary">{user?.role || 'Urban Planner'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
