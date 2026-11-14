import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // UI
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;

  // Settings
  budget: number;
  setBudget: (v: number) => void;
  selectedZone: string | null;
  setSelectedZone: (id: string | null) => void;
  priorityMode: 'heat' | 'flood' | 'balanced';
  setPriorityMode: (m: 'heat' | 'flood' | 'balanced') => void;
  theme: 'dark';
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

const DEMO_USER: User = {
  name: 'Arjun Sharma',
  email: 'demo@ecopulse.ai',
  role: 'Urban Planner',
  avatar: 'AS',
};

const DEMO_CREDENTIALS = {
  email: 'demo@ecopulse.ai',
  password: 'demo123',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('eco-pulse-auth') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    return isAuthenticated ? DEMO_USER : null;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem('eco-pulse-budget') || '25');
  });
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [priorityMode, setPriorityMode] = useState<'heat' | 'flood' | 'balanced'>('balanced');

  useEffect(() => {
    localStorage.setItem('eco-pulse-budget', String(budget));
  }, [budget]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo authentication — not a real authentication system
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (
      email.toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      setUser(DEMO_USER);
      localStorage.setItem('eco-pulse-auth', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('eco-pulse-auth');
    setCurrentPage('overview');
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp'>) => {
    const notification: Notification = {
      ...n,
      id: Math.random().toString(36).substring(2),
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    // Auto-dismiss after 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== notification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(x => x.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        sidebarCollapsed,
        setSidebarCollapsed,
        currentPage,
        setCurrentPage,
        notifications,
        addNotification,
        dismissNotification,
        budget,
        setBudget,
        selectedZone,
        setSelectedZone,
        priorityMode,
        setPriorityMode,
        theme: 'dark',
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
