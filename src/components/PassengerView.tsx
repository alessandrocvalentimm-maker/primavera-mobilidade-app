import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  LocateFixed,
  MapPin,
  Moon,
  Navigation,
  Phone,
  QrCode,
  Search,
  Share2,
  Shield,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { calculateDistanceKm, calculateFare } from '../services/pricing';
import { LocationPoint, PaymentMethod, Ride } from '../types';
import { CityMap } from './CityMap';
import { PixPaymentModal } from './PixPaymentModal';

export const PassengerView: React.FC = () => {
  const {
    currentUser,
    drivers,
    activePassengerRide,
    requestRide,
    cancelRide,
    rateRide,
    tariff,
    isNightSimulated,
    rides,
    setShowAuthModal,
  } = useApp();

  // Selection states
  const [origin, setOrigin] = useState<LocationPoint>(POPULAR_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPoint>(POPULAR_LOCATIONS[1]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [originSearchQuery, setOriginSearchQuery] = useState('');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  // Rating modal
  const [ratingRideId, setRatingRideId] = useState<string | null>(null);
  const [starCount, setStarCount] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');

  // Pix modal
  const [showPixModal, setShowPixModal] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const userLoc: LocationPoint = {
          address: 'Meu Local Atual (GPS)',
          neighborhood: 'Primavera do Leste',
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          popular: false,
        };
        setOrigin(userLoc);
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS não obtido:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate live fare estimate
  const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const fareEstimate = calculateFare(distanceKm, tariff, isNightSimulated);

  const handleRequest = () => {
    const newRide = requestRide(origin, destination, paymentMethod);
    if (paymentMethod === 'pix') {
      // Allow viewing QR code if needed
    }
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingRideId) {
      rateRide(ratingRideId, starCount, ratingComment);
      setRatingRideId(null);
      setRatingComment('');
    }
  };

  // Filter passenger history
  const passengerRides = rides.filter((r) => r.passengerId === currentUser.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left Column: Booking & Ride Status Panel */}
      <div className="lg:col-span-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'request' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Pedir Corrida</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Minhas Viagens ({passengerRides.length})</span>
          </button>
        </div>

        {/* Tab 1: Request or Active Ride */}
        {activeTab === 'request' && (
          <>
            {/* If there is an active ride in progress */}
            {activePassengerRide ? (
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-5 animate-in fade-in duration-300">
                {/* Status Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Car className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
                        {activePassengerRide.status === 'requested' && 'Aguardando Motorista...'}
                        {activePassengerRide.status === 'accepted' && 'Motorista a Caminho'}
                        {activePassengerRide.status === 'arriving' && 'Chegou ao Local de Embarque'}
                        {activePassengerRide.status === 'in_progress' && 'Viagem em Andamento'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">
                        {activePassengerRide.destination.address.split('-')[0]}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xl font-extrabold text-blue-900">
                    R$ {activePassengerRide.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Driver Info if Accepted */}
                {activePassengerRide.driverId ? (
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={activePassengerRide.driverPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                          alt={activePassengerRide.driverName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{activePassengerRide.driverName}</h4>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{activePassengerRide.driverRating || 4.9}</span>
                            <span className="text-slate-400 font-normal">• Motorista Verificado</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`tel:${activePassengerRide.driverPhone}`}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
                        title="Ligar para o motorista"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="pt-2 border-t border-blue-100/80 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">VEÍCULO</span>
                        <span>{activePassengerRide.vehicleInfo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">PLACA</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono text-blue-900 font-bold">
                          {activePassengerRide.vehiclePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50 border border-amber-200/80 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-spin">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-amber-900">Procurando motoristas parceiros</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Sua solicitação foi enviada aos motoristas online em Primavera do Leste. Você pode alternar para a aba <strong>Motorista</strong> para aceitar esta corrida como motorista!
                    </p>
                  </div>
                )}

                {/* Route points summary */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Embarque</span>
                      <span className="font-semibold text-slate-800">{activePassengerRide.origin.address}</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-slate-200 ml-2" />
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Destino</span>
                      <span className="font-semibold text-slate-800">{activePassengerRide.destination.address}</span>
                    </div>
                  </div>
                </div>

                {/* Payment method info */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {activePassengerRide.paymentMethod === 'pix' && <Zap className="w-4 h-4 text-emerald-600" />}
                    {activePassengerRide.paymentMethod === 'money' && <Banknote className="w-4 h-4 text-emerald-600" />}
                    {activePassengerRide.paymentMethod === 'card' && <CreditCard className="w-4 h-4 text-blue-600" />}
                    <span className="font-semibold text-slate-700">
                      Pagamento:{' '}
                      {activePassengerRide.paymentMethod === 'pix' && 'Pix Instantâneo'}
                      {activePassengerRide.paymentMethod === 'money' && 'Dinheiro ao Motorista'}
                      {activePassengerRide.paymentMethod === 'card' && 'Cartão na Maquininha'}
                    </span>
                  </div>

                  {activePassengerRide.paymentMethod === 'pix' && (
                    <button
                      onClick={() => setShowPixModal(true)}
                      className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 font-bold rounded-lg text-[11px] transition"
                    >
                      Ver Pix QR
                    </button>
                  )}
                </div>

                {/* Cancel Ride Button */}
                <button
                  onClick={() => cancelRide(activePassengerRide.id, 'Cancelado pelo passageiro')}
                  className="w-full py-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold rounded-xl text-xs transition border border-transparent hover:border-red-200"
                >
                  Cancelar Corrida
                </button>
              </div>
            ) : (
              /* New Ride Request Form */
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Para onde vamos hoje?</h3>
                  <p className="text-xs text-slate-500">
                    Transporte rápido, seguro e no preço justo em Primavera do Leste – MT.
                  </p>
                </div>

                {/* Origin and Destination Selectors */}
                <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  {/* Origin */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ponto de Partida
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentGPS}
                        disabled={gpsLoading}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-0.5 px-1.5 rounded-md hover:bg-blue-50 transition"
                      >
                        <LocateFixed className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                        <span>{gpsLoading ? 'Localizando GPS...' : 'Usar meu GPS'}</span>
                      </button>
                    </div>
                    <select
                      value={origin.address}
                      onChange={(e) => {
                        const loc = POPULAR_LOCATIONS.find((l) => l.address === e.target.value);
                        if (loc) setOrigin(loc);
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {POPULAR_LOCATIONS.map((loc, i) => (
                        <option key={i} value={loc.address}>
                          {loc.address} ({loc.neighborhood})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Destino
                    </label>
                    <select
                      value={destination.address}
                      onChange={(e) => {
                        const loc = POPULAR_LOCATIONS.find((l) => l.address === e.target.value);
                        if (loc) setDestination(loc);
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {POPULAR_LOCATIONS.map((loc, i) => (
                        <option key={i} value={loc.address} disabled={loc.address === origin.address}>
                          {loc.address} ({loc.neighborhood})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fare & Price Breakdown Card */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                        Estimativa de Tarifa
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-extrabold text-blue-950">
                          R$ {fareEstimate.finalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          (~{distanceKm} km • ~{Math.max(4, Math.round(distanceKm * 2.2))} min)
                        </span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Car className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Calculation Details */}
                  <div className="pt-2 border-t border-blue-200/60 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Tarifa base ({distanceKm} km x R$ {tariff.baseKmPrice.toFixed(2)}/km):</span>
                      <span className="font-semibold">R$ {(distanceKm * tariff.baseKmPrice).toFixed(2).replace('.', ',')}</span>
                    </div>

                    {fareEstimate.isMinimumApplied && (
                      <div className="flex justify-between text-blue-800 font-medium">
                        <span>Garantia de Corrida Mínima:</span>
                        <span>R$ {tariff.minFare.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}

                    {fareEstimate.isNight && (
                      <div className="flex justify-between text-amber-700 font-bold bg-amber-100/60 px-2 py-0.5 rounded">
                        <span className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-amber-600" /> Adicional Noturno (+20%):
                        </span>
                        <span>+ R$ {fareEstimate.nightSurchargeAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'pix'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Zap className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs">Pix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('money')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'money'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'money' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs">Dinheiro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs">Cartão</span>
                    </button>
                  </div>
                </div>

                {/* Request Button */}
                <button
                  type="button"
                  onClick={handleRequest}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/30 transition active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Car className="w-5 h-5" />
                  <span>Solicitar Primavera Mobilidade</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Ride History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Histórico de Corridas</h3>

            {passengerRides.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma corrida registrada ainda.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {passengerRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(ride.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-sm font-extrabold text-blue-900">
                        R$ {ride.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="truncate">
                        <strong>Origem:</strong> {ride.origin.address}
                      </p>
                      <p className="truncate">
                        <strong>Destino:</strong> {ride.destination.address}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Motorista: <strong>{ride.driverName || 'Pendente'}</strong>
                      </span>

                      {ride.rating ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{ride.rating} estrelas</span>
                        </div>
                      ) : ride.status === 'completed' ? (
                        <button
                          onClick={() => setRatingRideId(ride.id)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition"
                        >
                          Avaliar Motorista
                        </button>
                      ) : (
                        <span className="text-blue-600 font-semibold uppercase">{ride.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Interactive Map */}
      <div className="lg:col-span-7 h-[460px] lg:h-[620px] sticky top-24">
        <CityMap
          activeRide={activePassengerRide}
          drivers={drivers}
          selectedOrigin={origin}
          selectedDestination={destination}
          isNight={isNightSimulated}
          onSelectLocation={(loc) => {
            // Alternates setting destination
            if (origin.address !== loc.address) {
              setDestination(loc);
            }
          }}
        />
      </div>

      {/* Driver Rating Modal */}
      {ratingRideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <form onSubmit={handleRateSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Como foi sua corrida?</h4>
              <p className="text-xs text-slate-500">Sua avaliação ajuda a manter a excelência em Primavera do Leste.</p>
            </div>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setStarCount(star)}
                  className="p-1 transition hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= starCount ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deixe um elogio ou comentário:</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Carro limpo, ar condicionado ótimo, motorista muito educado..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRatingRideId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pix Modal */}
      {activePassengerRide && (
        <PixPaymentModal
          ride={activePassengerRide}
          isOpen={showPixModal}
          onClose={() => setShowPixModal(false)}
          onPaymentConfirmed={() => {}}
        />
      )}
    </div>
  );
};
