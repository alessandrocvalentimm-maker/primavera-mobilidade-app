import React from 'react';
import {
  Car,
  Database,
  Flame,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  Shield,
  Smartphone,
  Star,
  Zap,
} from 'lucide-react';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { DriverRegisterModal } from './components/DriverRegisterModal';
import { DriverView } from './components/DriverView';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { Header } from './components/Header';
import { PassengerView } from './components/PassengerView';
import { AppProvider, useApp } from './context/AppContext';

const MainContent: React.FC = () => {
  const { currentRole, resetToInitialData, setShowFirebaseModal, setShowRegisterDriverModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900">
      {/* Top Navigation */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'passenger' && <PassengerView />}
        {currentRole === 'driver' && <DriverView />}
        {currentRole === 'admin' && <AdminView />}
      </main>

      {/* Footer & Regional Brand Banner */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">
                Primavera Mobilidade • Primavera do Leste – MT
              </p>
              <p className="text-[11px] text-slate-400">
                O aplicativo oficial de transporte urbano para a capital do agronegócio mato-grossense.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setShowRegisterDriverModal(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              Quero ser Motorista
            </button>
            <span>•</span>
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="text-orange-600 font-bold hover:underline flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Arquitetura Firebase</span>
            </button>
            <span>•</span>
            <button
              onClick={resetToInitialData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
              title="Restaurar dados iniciais de demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demonstração</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal />
      <DriverRegisterModal />
      <FirebaseStatusModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
