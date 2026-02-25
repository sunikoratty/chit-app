import React, { useState } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitRegistration from './components/ChitRegistration';
import AuctionSheetForm from './components/AuctionSheetForm';
import PaymentCollectionForm from './components/PaymentCollectionForm';
import ViewsTabs from './components/ViewsTabs';
import { Toaster } from 'react-hot-toast';

export type View = 'dashboard' | 'registration' | 'auction' | 'payment' | 'views';

const App: React.FC = () => {
  const { user, login, logout } = useStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  if (!user.isLoggedIn) {
    return (
      <>
        <Login onLogin={login} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === 'dashboard' && (
        <Dashboard
          onNavigate={(view: View) => setCurrentView(view)}
          onLogout={logout}
          username={user.username}
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

      <Toaster position="top-right" />
    </div>
  );
};

export default App;
