import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Thermometer,
  Map,
  TreePine,
  Brain,
  Wallet,
  GitCompare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MapPin,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',              label: 'Overview',            icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'climate',               label: 'Climate Intelligence', icon: <Thermometer className="w-5 h-5" /> },
  { id: 'map',                   label: 'Digital Twin Map',    icon: <Map className="w-5 h-5" /> },
  { id: 'citizen-reports',       label: 'Ground Truth Reports',icon: <MapPin className="w-5 h-5" /> },
  { id: 'green-infrastructure',  label: 'Green Infrastructure', icon: <TreePine className="w-5 h-5" /> },
  { id: 'recommendations',       label: 'AI Recommendations',  icon: <Brain className="w-5 h-5" /> },
  { id: 'budget',                label: 'Budget Optimisation',  icon: <Wallet className="w-5 h-5" /> },
  { id: 'scenarios',             label: 'Scenario Simulator',   icon: <GitCompare className="w-5 h-5" /> },
  { id: 'reports',               label: 'Reports',              icon: <FileText className="w-5 h-5" /> },
  { id: 'settings',              label: 'Settings',             icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 64;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  currentPage,
  onNavigate,
}) => {
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="
        relative flex flex-col flex-shrink-0
        bg-[#101B15]
        border-r border-emerald-500/10
        h-screen overflow-hidden z-30
      "
      style={{ width }}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <div
        className="
          flex items-center gap-3 px-4
          h-16 flex-shrink-0
          border-b border-emerald-500/10
        "
      >
        {/* Leaf icon always visible */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Leaf className="w-4.5 h-4.5 text-emerald-400" strokeWidth={2} />
        </div>

        {/* Brand text — hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-sm font-bold tracking-widest text-emerald-400 uppercase">
                ECO-PULSE AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav Items ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-emerald-900">
        <ul className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative w-full flex items-center gap-3
                    px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="
                        absolute left-0 top-1/2 -translate-y-1/2
                        w-0.5 h-5 rounded-full bg-emerald-400
                      "
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}

                  {/* Icon */}
                  <span className="flex-shrink-0">{item.icon}</span>

                  {/* Label — hidden when collapsed */}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        key={`label-${item.id}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span
                      className="
                        absolute left-full ml-3 px-2.5 py-1.5
                        bg-[#1A2E21] border border-emerald-500/20
                        text-slate-200 text-xs font-medium rounded-lg
                        opacity-0 group-hover:opacity-100
                        pointer-events-none whitespace-nowrap
                        transition-opacity duration-150
                        shadow-xl z-50
                      "
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Demo Badge ───────────────────────────────── */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-emerald-500/10">
        <AnimatePresence>
          {!collapsed ? (
            <motion.div
              key="demo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="
                flex items-center gap-2 px-3 py-2.5
                bg-amber-500/10 border border-amber-500/20
                rounded-xl text-xs text-amber-400
              "
            >
              <span className="text-base leading-none">⚠</span>
              <div className="overflow-hidden">
                <p className="font-semibold tracking-wide">DEMO DATA</p>
                <p className="text-amber-500/60 text-[10px]">Simulated dataset</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="demo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="
                flex items-center justify-center w-10 h-10 mx-auto
                bg-amber-500/10 border border-amber-500/20
                rounded-xl text-amber-400 text-base
                cursor-default
              "
              title="DEMO DATA — Simulated dataset"
            >
              ⚠
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapse Toggle Button ────────────────────── */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="
          absolute -right-3.5 top-[72px]
          w-7 h-7 rounded-full
          bg-[#101B15] border border-emerald-500/20
          text-slate-400 hover:text-emerald-400
          flex items-center justify-center
          shadow-lg transition-all duration-200
          hover:border-emerald-500/50
          z-40
        "
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />
        }
      </button>
    </motion.aside>
  );
};

export default Sidebar;
