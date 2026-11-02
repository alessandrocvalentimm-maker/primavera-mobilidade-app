import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Banknote,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  MapPin,
  Moon,
  Navigation,
  Phone,
  Power,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { DriverProfile, Ride } from '../types';
import { CityMap } from './CityMap';

export const DriverView: React.FC = () => {
  const {
    currentDriverProfile,
    toggleDriverOnline,
    activeDriverRide,
    pendingRequestsForDriver,
    acceptRide,
    driverArrivedAtPickup,
    startRide,
    finishRide,
    cancelRide,
    transactions,
    isNightSimulated,
    drivers,
    setShowRegisterDriverModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cockpit' | 'wallet' | 'profile'>('cockpit');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  if (!currentDriverProfile) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto shadow-xl">
        <Car className="w-12 h-12 text-blue-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">Torne-se um Motorista Parceiro</h3>
        <p className="text-xs text-slate-500">
          Cadastre seu veículo e CNH para começar a transportar passageiros em Primavera do Leste - MT.
        </p>
        <button
          onClick={() => setShowRegisterDriverModal(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
        >
          Cadastrar CNH e Veículo
        </button>
      </div>
    );
  }

  const isPendingApproval = currentDriverProfile.status === 'pending';
  const isSuspended = currentDriverProfile.status === 'suspended' || currentDriverProfile.status === 'rejected';

  const driverTransactions = transactions.filter((t) => t.driverId === currentDriverProfile.id);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(payoutAmount);
    if (isNaN(val) || val <= 0 || val > currentDriverProfile.walletBalance) return;

    setPayoutSuccess(true);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    setTimeout(() => {
      setShowPayoutModal(false);
      setPayoutSuccess(false);
      setPayoutAmount('');
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left Column: Driver Controls & Cockpit */}
      <div className="lg:col-span-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cockpit' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Corrida ao Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'wallet' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Ganhos & Carteira</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Veículo & CNH</span>
          </button>
        </div>

        {/* Tab 1: Cockpit / Live Rides */}
        {activeTab === 'cockpit' && (
          <div className="space-y-4">
            {/* Driver Status Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentDriverProfile.photoUrl}
                    alt={currentDriverProfile.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{currentDriverProfile.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{currentDriverProfile.rating.toFixed(2)}</span>
                      <span className="text-slate-400 font-normal">
                        • {currentDriverProfile.totalRides} corridas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Online / Offline switch */}
                <button
                  type="button"
                  disabled={isPendingApproval || isSuspended}
                  onClick={() => toggleDriverOnline(currentDriverProfile.id)}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 ${
                    isPendingApproval
                      ? 'bg-amber-100 text-amber-800 opacity-60 cursor-not-allowed'
                      : currentDriverProfile.isOnline
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-400 ring-offset-2'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{currentDriverProfile.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* Status Warning if Pending Approval */}
              {isPendingApproval && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Cadastro Pendente de Aprovação Manual</p>
                    <p>
                      Seus documentos de CNH e CRLV do veículo estão em análise. Você pode aprovar este motorista imediatamente pelo painel do <strong>Administrador</strong>!
                    </p>
                  </div>
                </div>
              )}

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hoje</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    R$ {currentDriverProfile.dailyEarnings.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Carteira</span>
                  <span className="text-sm font-extrabold text-blue-700">
                    R$ {currentDriverProfile.walletBalance.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Veículo</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {currentDriverProfile.vehiclePlate}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Progress Ride for this Driver */}
            {activeDriverRide ? (
              <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-500/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 block">
                      {activeDriverRide.status === 'accepted' && '1. A caminho do passageiro'}
                      {activeDriverRide.status === 'arriving' && '2. Aguardando embarque'}
                      {activeDriverRide.status === 'in_progress' && '3. Em viagem com o passageiro'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      Passageiro: {activeDriverRide.passengerName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">GANHO LÍQUIDO</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      R$ {activeDriverRide.driverEarnings.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Passenger Contact & Route */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{activeDriverRide.passengerName}</p>
                    <p className="text-slate-500">{activeDriverRide.passengerPhone}</p>
                  </div>
                  <a
                    href={`tel:${activeDriverRide.passengerPhone}`}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
                    title="Ligar para o passageiro"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">EMBARQUE</span>
                      <span className="font-semibold text-slate-800">{activeDriverRide.origin.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Navigation className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">DESTINO</span>
                      <span className="font-semibold text-slate-800">{activeDriverRide.destination.address}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing summary for driver */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-950 space-y-1">
                  <div className="flex justify-between">
                    <span>Valor total da corrida:</span>
                    <span className="font-bold">R$ {activeDriverRide.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>Taxa da plataforma Primavera:</span>
                    <span>- R$ {activeDriverRide.platformFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-700 pt-1 border-t border-blue-200">
                    <span>Seu ganho creditado na carteira:</span>
                    <span>R$ {activeDriverRide.driverEarnings.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="space-y-2 pt-2">
                  {activeDriverRide.status === 'accepted' && (
                    <button
                      onClick={() => driverArrivedAtPickup(activeDriverRide.id)}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Cheguei ao Local de Embarque</span>
                    </button>
                  )}

                  {activeDriverRide.status === 'arriving' && (
                    <button
                      onClick={() => startRide(activeDriverRide.id)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>Iniciar Corrida com Passageiro</span>
                    </button>
                  )}

                  {activeDriverRide.status === 'in_progress' && (
                    <button
                      onClick={() => finishRide(activeDriverRide.id)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Finalizar Corrida e Receber R$ {activeDriverRide.driverEarnings.toFixed(2).replace('.', ',')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => cancelRide(activeDriverRide.id, 'Cancelado pelo motorista')}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    Cancelar Corrida
                  </button>
                </div>
              </div>
            ) : (
              /* Incoming Requests Radar */
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>Chamadas Próximas em Primavera</span>
                  </h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {pendingRequestsForDriver.length} disponíveis
                  </span>
                </div>

                {!currentDriverProfile.isOnline ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-3 border border-slate-200">
                    <Power className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      Você está <strong>OFFLINE</strong>. Ative o botão acima para receber chamadas de passageiros em Primavera do Leste.
                    </p>
                  </div>
                ) : pendingRequestsForDriver.length === 0 ? (
                  <div className="p-8 bg-blue-50/50 rounded-2xl text-center space-y-3 border border-blue-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-bold text-blue-950">Aguardando passageiros...</h5>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Você está online no radar. Alterne para a aba <strong>Passageiro</strong> para solicitar uma corrida e vê-la tocar aqui instantaneamente!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequestsForDriver.map((ride) => (
                      <div
                        key={ride.id}
                        className="p-4 rounded-2xl border-2 border-blue-500/30 bg-blue-50/40 space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-blue-600 uppercase">
                              NOVA CHAMADA • {ride.distanceKm} KM
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-sm">
                              {ride.passengerName}
                            </h5>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-emerald-600">
                              R$ {ride.driverEarnings.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[10px] text-slate-500 block">líquido</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-700">
                          <p className="truncate">
                            <strong>Embarque:</strong> {ride.origin.address}
                          </p>
                          <p className="truncate">
                            <strong>Destino:</strong> {ride.destination.address}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => acceptRide(ride.id, currentDriverProfile.id)}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aceitar Corrida</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wallet & Financials */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            {/* Wallet Balance Hero Card */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                    Saldo Disponível na Carteira
                  </span>
                  <div className="text-3xl font-extrabold mt-1">
                    R$ {currentDriverProfile.walletBalance.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Wallet className="w-6 h-6 text-blue-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-blue-300 block text-[10px]">GANHOS HOJE</span>
                  <span className="font-bold text-sm">
                    R$ {currentDriverProfile.dailyEarnings.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div>
                  <span className="text-blue-300 block text-[10px]">GANHOS SEMANA</span>
                  <span className="font-bold text-sm">
                    R$ {currentDriverProfile.weeklyEarnings.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                className="w-full py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Solicitar Saque Instantâneo via Pix</span>
              </button>
            </div>

            {/* Chave Pix Registrada */}
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  CHAVE PIX CADASTRADA
                </span>
                <span className="font-bold text-slate-800">{currentDriverProfile.pixKey}</span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                Ativa ✓
              </span>
            </div>

            {/* Financial History */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Extrato da Carteira</h4>

              {driverTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhuma movimentação registrada.</p>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {driverTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            tx.amount > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.amount > 0 ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(tx.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-extrabold ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Driver Profile & Vehicle Docs */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5">
            <h4 className="text-base font-bold text-slate-900">Documentação e Veículo</h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">CNH DO MOTORISTA</span>
                <span className="font-bold text-slate-800 text-sm">{currentDriverProfile.cnhNumber}</span>
                <span className="ml-2 text-blue-700 font-semibold">(Cat. {currentDriverProfile.cnhCategory})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">VEÍCULO CADASTRADO</span>
                <span className="font-bold text-slate-800 text-sm">{currentDriverProfile.vehicleModel}</span>
                <p className="text-slate-500 mt-0.5">
                  Ano {currentDriverProfile.vehicleYear} • Cor {currentDriverProfile.vehicleColor} • Placa{' '}
                  <strong className="font-mono text-slate-900">{currentDriverProfile.vehiclePlate}</strong>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">STATUS DE APROVAÇÃO</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentDriverProfile.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentDriverProfile.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentDriverProfile.status === 'approved' && 'Aprovado pelo Administrador ✓'}
                    {currentDriverProfile.status === 'pending' && 'Aguardando Análise do Admin ⏳'}
                    {currentDriverProfile.status === 'rejected' && 'Reprovado / Reenviar Documentos'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-slate-700 leading-relaxed">
                <p className="font-bold text-blue-900 mb-1">Regras Financeiras do Motorista:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Tarifa por km rodado: <strong>R$ 2,00 / km</strong></li>
                  <li>Valor mínimo por corrida: <strong>R$ 6,00</strong></li>
                  <li>Adicional noturno de 20% das 20h às 05h</li>
                  <li>Comissão da plataforma: <strong>apenas R$ 0,80 por corrida</strong> concluída</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: City Map */}
      <div className="lg:col-span-7 h-[460px] lg:h-[620px] sticky top-24">
        <CityMap
          activeRide={activeDriverRide}
          drivers={drivers}
          isNight={isNightSimulated}
          interactive={false}
        />
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm">
          <form
            onSubmit={handleRequestPayout}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Saque Pix Instantâneo</h4>
              <p className="text-xs text-slate-500">
                Transferência para sua chave: <strong>{currentDriverProfile.pixKey}</strong>
              </p>
            </div>

            {payoutSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                Saque Pix enviado com sucesso!
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor do Saque (Máx R$ {currentDriverProfile.walletBalance.toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={currentDriverProfile.walletBalance}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Ex: 50.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Confirmar Saque
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
