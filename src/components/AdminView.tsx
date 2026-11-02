import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Car,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  Edit3,
  FileCheck,
  FileText,
  Filter,
  LifeBuoy,
  MessageSquare,
  Moon,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFirebaseConfigured } from '../services/firebase';
import { DriverProfile, PlatformTariff, SupportTicket } from '../types';

export const AdminView: React.FC = () => {
  const {
    drivers,
    approveDriver,
    rejectDriver,
    users,
    rides,
    tariff,
    updateTariff,
    platformCommissionTotal,
    totalPlatformVolume,
    tickets,
    replyTicket,
    resetToInitialData,
    seedCloudFirestore,
    isFirestoreSyncing,
    setShowFirebaseModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'passengers' | 'rides' | 'tariffs' | 'support'>('overview');
  const [selectedDriverDoc, setSelectedDriverDoc] = useState<DriverProfile | null>(null);
  const [isSeedingCloud, setIsSeedingCloud] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Tariff form state
  const [baseKmPrice, setBaseKmPrice] = useState(tariff.baseKmPrice);
  const [minFare, setMinFare] = useState(tariff.minFare);
  const [nightSurchargePct, setNightSurchargePct] = useState(tariff.nightSurchargePct);
  const [nightStartHour, setNightStartHour] = useState(tariff.nightStartHour);
  const [nightEndHour, setNightEndHour] = useState(tariff.nightEndHour);
  const [platformFeePerRide, setPlatformFeePerRide] = useState(tariff.platformFeePerRide);
  const [tariffSavedAlert, setTariffSavedAlert] = useState(false);

  // Ticket reply state
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});

  const pendingDrivers = drivers.filter((d) => d.status === 'pending');
  const approvedDrivers = drivers.filter((d) => d.status === 'approved');
  const completedRides = rides.filter((r) => r.status === 'completed');

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    updateTariff({
      baseKmPrice: Number(baseKmPrice),
      minFare: Number(minFare),
      nightSurchargePct: Number(nightSurchargePct),
      nightStartHour: Number(nightStartHour),
      nightEndHour: Number(nightEndHour),
      platformFeePerRide: Number(platformFeePerRide),
    });
    setTariffSavedAlert(true);
    setTimeout(() => setTariffSavedAlert(false), 3000);
  };

  const handleSeedCloud = async () => {
    if (!isFirebaseConfigured) {
      setShowFirebaseModal(true);
      return;
    }

    setIsSeedingCloud(true);
    try {
      await seedCloudFirestore();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3500);
    } catch (err) {
      console.warn('Erro ao popular Firestore:', err);
    } finally {
      setIsSeedingCloud(false);
    }
  };

  const handleReplySubmit = (ticketId: string) => {
    const text = replyText[ticketId];
    if (!text || text.trim() === '') return;
    replyTicket(ticketId, text);
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Admin Subheader & Navigation */}
      <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Painel Central
            </span>
            <span className="text-xs text-slate-400">• Primavera do Leste – MT</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">Administração Primavera Mobilidade</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3 py-2 rounded-xl transition relative flex items-center gap-1.5 ${
              activeTab === 'drivers' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Motoristas</span>
            {pendingDrivers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingDrivers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('passengers')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'passengers' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Passageiros
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'rides' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Corridas ({rides.length})
          </button>
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'tariffs' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tarifas</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'support' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Suporte ({tickets.filter((t) => t.status === 'open').length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cloud Firestore Live Status & Seeder */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 border border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Database className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm">Banco Cloud Firestore: primavera-mobilidade</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    {isFirestoreSyncing ? 'Sincronização em Tempo Real Ativa' : 'Aguardando Credenciais .env'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Coleções ativas: users, drivers, rides, tariffs, transactions e tickets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedCloud}
                disabled={isSeedingCloud}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                title="Popular ou sincronizar dados de Primavera do Leste diretamente com o projeto Cloud Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeedingCloud ? 'animate-spin' : ''}`} />
                <span>{isSeedingCloud ? 'Sincronizando...' : seedSuccess ? 'Banco Populado! ✓' : 'Popular Dados no Firestore'}</span>
              </button>
              <button
                onClick={() => setShowFirebaseModal(true)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20"
              >
                Status da Conexão
              </button>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Comissão Plataforma</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  R$
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                R$ {platformCommissionTotal.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                R$ {tariff.platformFeePerRide.toFixed(2)} por corrida concluída
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Volume Transacionado</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                R$ {totalPlatformVolume.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {completedRides.length} corridas finalizadas
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Motoristas Ativos</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {approvedDrivers.length}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {drivers.filter((d) => d.isOnline).length} online agora em Primavera
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Aprovações Pendentes</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-600">
                {pendingDrivers.length}
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                Documentos CNH aguardando análise manual
              </p>
            </div>
          </div>

          {/* Pending Drivers Quick Approval Section */}
          {pendingDrivers.length > 0 && (
            <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="text-base font-bold text-amber-950">
                      Motoristas Aguardando Aprovação Manual ({pendingDrivers.length})
                    </h3>
                    <p className="text-xs text-amber-800">
                      Verifique a CNH e documentação do veículo antes de liberar o acesso à plataforma.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={driver.photoUrl}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                          <p className="text-xs text-slate-500">{driver.phone} • CNH: {driver.cnhNumber}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                        Pendente
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <p>
                        <strong>Veículo:</strong> {driver.vehicleModel} ({driver.vehicleYear})
                      </p>
                      <p>
                        <strong>Placa:</strong>{' '}
                        <span className="font-mono font-bold text-blue-900">{driver.vehiclePlate}</span> •{' '}
                        <strong>Cor:</strong> {driver.vehicleColor}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDriverDoc(driver)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Ver Documentos</span>
                      </button>
                      <button
                        onClick={() => approveDriver(driver.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                      <button
                        onClick={() => rejectDriver(driver.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs transition"
                        title="Rejeitar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing parameters in summary */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Tarifas Vigentes em Primavera do Leste</span>
              </h3>
              <button
                onClick={() => setActiveTab('tariffs')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Editar Tarifas
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Preço por Km</span>
                <span className="text-base font-extrabold text-blue-900">
                  R$ {tariff.baseKmPrice.toFixed(2).replace('.', ',')} / km
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Corrida Mínima</span>
                <span className="text-base font-extrabold text-blue-900">
                  R$ {tariff.minFare.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Adicional Noturno</span>
                <span className="text-base font-extrabold text-amber-600">
                  +{tariff.nightSurchargePct}% ({tariff.nightStartHour}h às {tariff.nightEndHour}h)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Taxa Plataforma</span>
                <span className="text-base font-extrabold text-emerald-600">
                  R$ {tariff.platformFeePerRide.toFixed(2).replace('.', ',')} fixa
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Drivers Directory & Management */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Motoristas Cadastrados</h3>
              <p className="text-xs text-slate-500">Gestão de CNH, veículos, aprovação manual e status.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {drivers.length} motoristas no sistema
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="py-3 px-3">Motorista</th>
                  <th className="py-3 px-3">CNH</th>
                  <th className="py-3 px-3">Veículo / Placa</th>
                  <th className="py-3 px-3">Saldo Carteira</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={drv.photoUrl}
                          alt={drv.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{drv.name}</p>
                          <p className="text-[11px] text-slate-400">{drv.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {drv.cnhNumber} <span className="text-slate-400">({drv.cnhCategory})</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold">{drv.vehicleModel}</p>
                      <p className="font-mono text-blue-700 font-bold">{drv.vehiclePlate}</p>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      R$ {drv.walletBalance.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          drv.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : drv.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {drv.status === 'approved' && 'Aprovado'}
                        {drv.status === 'pending' && 'Aprovação Pendente'}
                        {drv.status === 'rejected' && 'Rejeitado'}
                        {drv.status === 'suspended' && 'Suspenso'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDriverDoc(drv)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                          title="Inspecionar Documentos"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {drv.status === 'pending' ? (
                          <button
                            onClick={() => approveDriver(drv.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Aprovar
                          </button>
                        ) : drv.status === 'approved' ? (
                          <button
                            onClick={() => rejectDriver(drv.id)}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-[11px]"
                          >
                            Suspender
                          </button>
                        ) : (
                          <button
                            onClick={() => approveDriver(drv.id)}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px]"
                          >
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Passengers Directory */}
      {activeTab === 'passengers' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Passageiros Cadastrados</h3>
              <p className="text-xs text-slate-500">Usuários registrados via telefone e Google.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {users.filter((u) => u.role === 'passenger').length} passageiros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="py-3 px-3">Nome</th>
                  <th className="py-3 px-3">Telefone</th>
                  <th className="py-3 px-3">E-mail</th>
                  <th className="py-3 px-3">Corridas Solicitadas</th>
                  <th className="py-3 px-3">Avaliação Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter((u) => u.role === 'passenger')
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td className="py-3 px-3">{user.phone}</td>
                      <td className="py-3 px-3 text-slate-500">{user.email}</td>
                      <td className="py-3 px-3 font-bold">{user.totalRides} viagens</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{user.rating.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rides Monitoring */}
      {activeTab === 'rides' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registro Global de Corridas</h3>
              <p className="text-xs text-slate-500">Acompanhamento de status, valores e comissões da plataforma.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="py-3 px-3">ID / Data</th>
                  <th className="py-3 px-3">Passageiro</th>
                  <th className="py-3 px-3">Motorista</th>
                  <th className="py-3 px-3">Trajeto</th>
                  <th className="py-3 px-3">Valor Total</th>
                  <th className="py-3 px-3">Comissão Plataforma</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-blue-900">#{ride.id.slice(-6)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(ride.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-semibold">{ride.passengerName}</td>
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {ride.driverName || 'Não atribuído'}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate">
                      {ride.origin.neighborhood} → {ride.destination.neighborhood} ({ride.distanceKm} km)
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      R$ {ride.price.toFixed(2).replace('.', ',')}
                      {ride.isNightSurcharge && (
                        <span className="block text-[9px] text-amber-600 font-bold">+20% Noite</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-emerald-600">
                      R$ {ride.platformFee.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ride.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ride.status === 'requested'
                            ? 'bg-amber-100 text-amber-800'
                            : ride.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tariff Management */}
      {activeTab === 'tariffs' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Gerenciamento de Tarifas da Cidade</h3>
              <p className="text-xs text-slate-500">
                Ajuste os parâmetros de preço para os passageiros e motoristas em Primavera do Leste - MT.
              </p>
            </div>
            {tariffSavedAlert && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full animate-bounce">
                Tarifas salvas com sucesso! ✓
              </span>
            )}
          </div>

          <form onSubmit={handleSaveTariff} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preço por Quilômetro (R$ / km)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="1"
                  required
                  value={baseKmPrice}
                  onChange={(e) => setBaseKmPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Padrão configurado: R$ 2,00 por km.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarifa Mínima da Corrida (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="3"
                  required
                  value={minFare}
                  onChange={(e) => setMinFare(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Padrão configurado: R$ 6,00 mínima.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adicional Noturno (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  required
                  value={nightSurchargePct}
                  onChange={(e) => setNightSurchargePct(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Padrão: 20% adicional das 20h às 05h.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comissão da Plataforma por Corrida (R$)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={platformFeePerRide}
                  onChange={(e) => setPlatformFeePerRide(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Padrão: R$ 0,80 descontado do motorista.</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-700" />
                Intervalo do Horário Noturno:
              </p>
              <p>Início às <strong>{nightStartHour}:00h</strong> e término às <strong>{nightEndHour}:00h</strong>.</p>
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition"
            >
              Salvar Alterações de Tarifas
            </button>
          </form>
        </div>
      )}

      {/* Tab: Support Tickets */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Central de Suporte ao Usuário</h3>
              <p className="text-xs text-slate-500">Atendimento aos passageiros e motoristas de Primavera.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {tickets.length} chamados registrados
            </span>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ticket.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Prioridade {ticket.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {ticket.userName} ({ticket.userRole})
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ticket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ticket.status === 'resolved' ? 'Resolvido ✓' : 'Aberto ⏳'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ticket.subject}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticket.message}</p>
                </div>

                {ticket.reply ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                    <span className="font-bold block text-[10px] text-emerald-700 uppercase">
                      Resposta do Suporte:
                    </span>
                    <p>{ticket.reply}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Digitar resposta ao usuário..."
                      value={replyText[ticket.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleReplySubmit(ticket.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      Responder
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Document Inspection Modal */}
      {selectedDriverDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedDriverDoc(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={selectedDriverDoc.photoUrl}
                alt={selectedDriverDoc.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDriverDoc.name}</h3>
                <p className="text-xs text-slate-500">{selectedDriverDoc.phone} • {selectedDriverDoc.email}</p>
              </div>
            </div>

            {/* Document Inspection Cards */}
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">DOCUMENTO CNH</span>
                  <p className="font-bold text-slate-800 text-sm">{selectedDriverDoc.cnhNumber}</p>
                  <p className="text-slate-500">Categoria: {selectedDriverDoc.cnhCategory} • Situação: Ativa</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  Documento Válido
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">VEÍCULO / CRLV</span>
                  <p className="font-bold text-slate-800 text-sm">{selectedDriverDoc.vehicleModel}</p>
                  <p className="text-slate-500">
                    Placa: <strong className="font-mono text-slate-900">{selectedDriverDoc.vehiclePlate}</strong> • Ano: {selectedDriverDoc.vehicleYear} • Cor: {selectedDriverDoc.vehicleColor}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  CRLV 2024 Vistoriado
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedDriverDoc(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Fechar
              </button>
              {selectedDriverDoc.status === 'pending' && (
                <button
                  onClick={() => {
                    approveDriver(selectedDriverDoc.id);
                    setSelectedDriverDoc(null);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Aprovar Motorista
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
