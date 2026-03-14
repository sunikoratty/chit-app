import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitRegistration from './components/ChitRegistration';
import AuctionSheetForm from './components/AuctionSheetForm';
import PaymentCollectionForm from './components/PaymentCollectionForm';
import PrizeEntryForm from './components/PrizeEntryForm';
import ViewsTabs from './components/ViewsTabs';
import ProfitLossReport from './components/ProfitLossReport';
import Registration from './components/Registration';
import BackupRestore from './components/BackupRestore';
import { Toaster } from 'react-hot-toast';
import { App as CapApp } from '@capacitor/app';

export type View = 'dashboard' | 'registration' | 'auction' | 'payment' | 'views' | 'prize' | 'profit_loss' | 'backup';

const App: React.FC = () => {
  const { user, logout } = useStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const backButtonListener = CapApp.addListener('backButton', () => {
      if (showRegister) {
        setShowRegister(false);
      } else if (currentView !== 'dashboard') {
        setCurrentView('dashboard');
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [currentView, showRegister]);

  // If the user is logged in, show the main app
  if (user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={(view: View) => setCurrentView(view)}
            onLogout={logout}
            user={user}
          />
        )}

        {currentView === 'registration' && (
          <ChitRegistration onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'auction' && (
          <AuctionSheetForm onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'payment' && (
          <PaymentCollectionForm onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'views' && (
          <ViewsTabs onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'prize' && (
          <PrizeEntryForm onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'profit_loss' && (
          <ProfitLossReport onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'backup' && (
          <BackupRestore onClose={() => setCurrentView('dashboard')} />
        )}

        <Toaster position="top-right" />
      </div>
    );
  }

  // Not logged in: show Registration or Login
  if (showRegister) {
    return (
      <>
        <Registration onComplete={() => setShowRegister(false)} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <Login onRegister={() => setShowRegister(true)} />
      <Toaster position="top-right" />
    </>
  );
};

export default App;
