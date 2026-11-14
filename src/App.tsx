import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import IntroAnimation from './components/IntroAnimation';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import OverviewPage from './pages/OverviewPage';
import DigitalTwinMap from './pages/DigitalTwinMap';
import ClimateIntelligence from './pages/ClimateIntelligence';
import AIRecommendations from './pages/AIRecommendations';
import BudgetOptimisation from './pages/BudgetOptimisation';
import ScenarioSimulator from './pages/ScenarioSimulator';
import GreenInfrastructure from './pages/GreenInfrastructure';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import CitizenReportsPage from './pages/CitizenReportsPage';

type AppState = 'intro' | 'login' | 'dashboard';

const pageComponents: Record<string, React.ComponentType<{ onNavigate?: (page: string) => void }>> = {
  overview: OverviewPage,
  map: DigitalTwinMap,
  'citizen-reports': CitizenReportsPage,
  climate: ClimateIntelligence,
  'green-infrastructure': GreenInfrastructure,
  recommendations: AIRecommendations,
  budget: BudgetOptimisation,
  scenarios: ScenarioSimulator,
  reports: ReportsPage,
  settings: SettingsPage,
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function AppContent() {
  const { isAuthenticated, currentPage, setCurrentPage } = useApp();
  const [appState, setAppState] = useState<AppState>(() => {
    // Skip intro if already authenticated
    return isAuthenticated ? 'dashboard' : 'intro';
  });

  const handleIntroComplete = () => setAppState('login');
  const handleLoginSuccess = () => setAppState('dashboard');

  const navigate = (page: string) => setCurrentPage(page);

  if (appState === 'intro') {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  if (appState === 'login' || !isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const PageComponent = pageComponents[currentPage] || OverviewPage;

  return (
    <MainLayout currentPage={currentPage} onNavigate={navigate}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-full"
        >
          <PageComponent onNavigate={navigate} />
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
