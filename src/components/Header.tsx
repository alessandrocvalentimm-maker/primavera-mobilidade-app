import React from 'react';
import {
  Car,
  Database,
  Flame,
  LogOut,
  MapPin,
  Moon,
  Navigation,
  Shield,
  Sun,
  User,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../services/firebase';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    isNightSimulated,
    setIsNightSimulated,
    setShowAuthModal,
    setShowFirebaseModal,
    setShowRegisterDriverModal,
    drivers,
    pendingRequestsForDriver,
  } = useApp();

  const pendingApprovalsCount = drivers.filter((d) => d.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Logo with Car and Location Pin in modern Blue & White */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
              <Car className="w-6 h-6 z-10" />
              <MapPin className="w-4 h-4 text-white fill-white absolute -top-1 -right-1 drop-shadow" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-blue-900 leading-none">
                  Primavera
                </span>
                <span className="text-xl font-extrabold tracking-tight text-sky-600 leading-none">
                  Mobilidade
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Primavera do Leste • MT
              </p>
            </div>
          </div>

          {/* Center: Quick Role Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrentRole('passenger')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                currentRole === 'passenger'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Passageiro</span>
            </button>

            <button
              onClick={() => setCurrentRole('driver')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 relative ${
                currentRole === 'driver'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Motorista</span>
              {pendingRequestsForDriver.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 relative ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Administrador</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Controls: Night Simulation, Firebase, User Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Night Surcharge Simulator Toggle */}
            <button
              onClick={() => setIsNightSimulated(!isNightSimulated)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isNightSimulated
                  ? 'bg-slate-900 text-amber-300 border-slate-700 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Alternar adicional noturno de 20% (20h às 05h)"
            >
              {isNightSimulated ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Noite (+20%)</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Dia Normal</span>
                </>
              )}
            </button>

            {/* Firebase Architecture Button */}
            <button
              onClick={() => setShowFirebaseModal(true)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-xs ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200/80'
              }`}
              title="Conexão Firebase Real e Configuração do Console"
            >
              <Flame
                className={`w-4 h-4 ${
                  isFirebaseConfigured
                    ? 'text-emerald-600 fill-emerald-500'
                    : 'text-orange-600 fill-orange-500'
                }`}
              />
              <span className="hidden md:inline">
                {isFirebaseConfigured ? 'Firebase Conectado' : 'Firebase (Configurar .env)'}
              </span>
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 transition bg-white shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-800 block truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase">
                  {currentRole === 'admin' ? 'Admin' : currentRole === 'driver' ? 'Motorista' : 'Passageiro'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Submenu for Role Switching */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => setCurrentRole('passenger')}
            className={`py-1.5 px-3 rounded-lg ${
              currentRole === 'passenger' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Passageiro
          </button>
          <button
            onClick={() => setCurrentRole('driver')}
            className={`py-1.5 px-3 rounded-lg ${
              currentRole === 'driver' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Motorista
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`py-1.5 px-3 rounded-lg ${
              currentRole === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Admin {pendingApprovalsCount > 0 ? `(${pendingApprovalsCount})` : ''}
          </button>
        </div>
      </div>
    </header>
  );
};
