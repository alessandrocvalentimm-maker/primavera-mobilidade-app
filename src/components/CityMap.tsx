import React, { useEffect, useState } from 'react';
import {
  Car,
  Compass,
  MapPin,
  Moon,
  Navigation,
  Plus,
  Minus,
  Sun,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { POPULAR_LOCATIONS, PRIMAVERA_CENTER } from '../data/mockData';
import { DriverProfile, LocationPoint, Ride } from '../types';

interface CityMapProps {
  activeRide?: Ride;
  drivers?: DriverProfile[];
  onSelectLocation?: (location: LocationPoint) => void;
  selectedOrigin?: LocationPoint | null;
  selectedDestination?: LocationPoint | null;
  isNight?: boolean;
  interactive?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  activeRide,
  drivers = [],
  onSelectLocation,
  selectedOrigin,
  selectedDestination,
  isNight = false,
  interactive = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [simulatedCarPosition, setSimulatedCarPosition] = useState<{ x: number; y: number } | null>(null);

  // SVG Coordinate Conversion for Primavera do Leste boundaries
  // Lat range: -15.535 to -15.585 (approx 0.05 deg = 5.5km)
  // Lng range: -54.325 to -54.265 (approx 0.06 deg = 6.5km)
  const minLat = -15.588;
  const maxLat = -15.535;
  const minLng = -54.325;
  const maxLng = -54.265;

  const projectToMap = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    // Latitude decreases as you go south, so invert Y
    const y = ((maxLat - lat) / (maxLat - minLat)) * 600;
    return {
      x: Math.max(30, Math.min(770, x)),
      y: Math.max(30, Math.min(570, y)),
    };
  };

  const originPoint = selectedOrigin || activeRide?.origin;
  const destPoint = selectedDestination || activeRide?.destination;

  const originCoords = originPoint ? projectToMap(originPoint.lat, originPoint.lng) : null;
  const destCoords = destPoint ? projectToMap(destPoint.lat, destPoint.lng) : null;

  // Car animation simulation along route when ride is active
  useEffect(() => {
    if (!activeRide || !originCoords || !destCoords) {
      setSimulatedCarPosition(null);
      return;
    }

    let progress = 0;
    let forward = true;
    const interval = setInterval(() => {
      progress += 0.015;
      if (progress > 1) {
        progress = 0;
      }

      // If ride is arriving, animate towards origin; if in progress, animate towards destination
      const start = activeRide.status === 'in_progress' ? originCoords : { x: originCoords.x - 60, y: originCoords.y + 40 };
      const end = activeRide.status === 'in_progress' ? destCoords : originCoords;

      const currentX = start.x + (end.x - start.x) * progress;
      const currentY = start.y + (end.y - start.y) * progress;

      setSimulatedCarPosition({ x: currentX, y: currentY });
    }, 100);

    return () => clearInterval(interval);
  }, [activeRide?.status, activeRide?.id, originCoords?.x, destCoords?.x]);

  const handleLandmarkClick = (loc: LocationPoint) => {
    if (onSelectLocation && interactive) {
      onSelectLocation(loc);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[360px] lg:min-h-[480px] rounded-2xl overflow-hidden shadow-inner border transition-colors duration-500 ${
        isNight
          ? 'bg-[#0b1329] border-blue-900/50 text-slate-100'
          : 'bg-[#eef2f6] border-slate-200 text-slate-900'
      }`}
    >
      {/* City Badge & Night Banner */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-md ${
          isNight ? 'bg-slate-900/90 text-blue-300 border border-blue-800/60' : 'bg-white/90 text-blue-900 border border-blue-100'
        }`}>
          <Navigation className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>Primavera do Leste – MT</span>
        </div>

        {isNight && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>Tarifa Noturna (+20%)</span>
          </div>
        )}

        {drivers.filter((d) => d.isOnline).length > 0 && (
          <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
            isNight ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{drivers.filter((d) => d.isOnline).length} Motoristas online</span>
          </div>
        )}
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
          className={`p-2 rounded-xl shadow-md border transition active:scale-95 ${
            isNight ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Aproximar Zoom"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
          className={`p-2 rounded-xl shadow-md border transition active:scale-95 ${
            isNight ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Afastar Zoom"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className={`p-2 rounded-xl shadow-md border transition active:scale-95 ${
            isNight ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Centralizar Primavera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Map Layout */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full max-h-[600px] select-none pointer-events-auto"
        >
          <defs>
            {/* Patterns for blocks and grass */}
            <linearGradient id="lakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={isNight ? 0.8 : 0.6} />
              <stop offset="100%" stopColor="#0369a1" stopOpacity={isNight ? 0.95 : 0.8} />
            </linearGradient>

            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Map Blocks */}
          <rect
            width="800"
            height="600"
            fill={isNight ? '#0b1329' : '#f1f5f9'}
          />

          {/* City District Polygons / Urban Zones */}
          {/* Zona Centro / Sul */}
          <rect
            x="200"
            y="180"
            width="340"
            height="260"
            rx="16"
            fill={isNight ? '#111e3d' : '#e2e8f0'}
            opacity={0.8}
          />
          {/* Bairro Castelândia / IFMT */}
          <rect
            x="120"
            y="360"
            width="180"
            height="180"
            rx="12"
            fill={isNight ? '#0f1a36' : '#e9eef5'}
          />
          {/* Primavera III */}
          <rect
            x="360"
            y="420"
            width="280"
            height="140"
            rx="12"
            fill={isNight ? '#0f1a36' : '#e9eef5'}
          />
          {/* Jardim Riva / Lago */}
          <rect
            x="140"
            y="180"
            width="160"
            height="160"
            rx="12"
            fill={isNight ? '#0f1c3a' : '#ecf2f8'}
          />
          {/* Zona Leste / Industrial / Havan */}
          <rect
            x="520"
            y="80"
            width="240"
            height="220"
            rx="14"
            fill={isNight ? '#0d1730' : '#e2e8f0'}
          />

          {/* Lago Municipal Vô Pedro Viana */}
          <g className="cursor-pointer">
            <path
              d="M 170 260 C 190 240, 240 235, 270 270 C 290 295, 260 335, 220 340 C 175 345, 150 285, 170 260 Z"
              fill="url(#lakeGradient)"
              stroke={isNight ? '#38bdf8' : '#0284c7'}
              strokeWidth="2"
            />
            {/* Water waves */}
            <path
              d="M 195 280 Q 210 275 225 280 T 255 280"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              fill="none"
            />
            <path
              d="M 185 305 Q 200 300 215 305 T 245 305"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              fill="none"
            />
            <text
              x="220"
              y="325"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={isNight ? '#7dd3fc' : '#0369a1'}
            >
              Lago Vô Pedro Viana
            </text>
          </g>

          {/* Praça Central Adão Donin (Green Square) */}
          <rect
            x="360"
            y="265"
            width="60"
            height="50"
            rx="8"
            fill={isNight ? '#064e3b' : '#a7f3d0'}
            stroke={isNight ? '#059669' : '#34d399'}
            strokeWidth="1.5"
          />
          <text
            x="390"
            y="295"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill={isNight ? '#6ee7b7' : '#065f46'}
          >
            Praça Central
          </text>

          {/* Road Network of Primavera do Leste */}
          {/* BR-070 (Rodovia Principal cruzando noroeste para sudeste) */}
          <path
            d="M 40 120 L 300 160 L 520 180 L 760 210"
            stroke={isNight ? '#475569' : '#cbd5e1'}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 40 120 L 300 160 L 520 180 L 760 210"
            stroke={isNight ? '#1e293b' : '#ffffff'}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 40 120 L 300 160 L 520 180 L 760 210"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            fill="none"
          />
          <text
            x="640"
            y="170"
            fontSize="10"
            fontWeight="bold"
            fill={isNight ? '#fbbf24' : '#b45309'}
          >
            BR-070
          </text>

          {/* Avenida Cuiabá (Eixo Comercial) */}
          <path
            d="M 380 90 L 380 540"
            stroke={isNight ? '#334155' : '#ffffff'}
            strokeWidth="10"
            fill="none"
          />
          <path
            d="M 380 90 L 380 540"
            stroke={isNight ? '#64748b' : '#94a3b8'}
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
          <text
            x="368"
            y="130"
            fontSize="9"
            fontWeight="600"
            fill={isNight ? '#94a3b8' : '#64748b'}
            transform="rotate(-90 368 130)"
          >
            Av. Cuiabá
          </text>

          {/* Avenida Campo Grande */}
          <path
            d="M 120 280 L 680 280"
            stroke={isNight ? '#334155' : '#ffffff'}
            strokeWidth="8"
            fill="none"
          />
          <text
            x="580"
            y="273"
            fontSize="9"
            fontWeight="600"
            fill={isNight ? '#94a3b8' : '#64748b'}
          >
            Av. Campo Grande
          </text>

          {/* Avenida Porto Alegre */}
          <path
            d="M 120 350 L 680 350"
            stroke={isNight ? '#334155' : '#ffffff'}
            strokeWidth="8"
            fill="none"
          />
          <text
            x="580"
            y="343"
            fontSize="9"
            fontWeight="600"
            fill={isNight ? '#94a3b8' : '#64748b'}
          >
            Av. Porto Alegre
          </text>

          {/* Avenida Minas Gerais */}
          <path
            d="M 270 120 L 270 520"
            stroke={isNight ? '#334155' : '#ffffff'}
            strokeWidth="7"
            fill="none"
          />

          {/* Avenida dos Trabalhadores (Sul) */}
          <path
            d="M 280 470 L 660 470"
            stroke={isNight ? '#334155' : '#ffffff'}
            strokeWidth="6"
            fill="none"
          />
          <text
            x="480"
            y="463"
            fontSize="8"
            fontWeight="600"
            fill={isNight ? '#94a3b8' : '#64748b'}
          >
            Av. dos Trabalhadores
          </text>

          {/* Secondary streets */}
          <path d="M 460 160 L 460 500" stroke={isNight ? '#1e293b' : '#e2e8f0'} strokeWidth="4" fill="none" />
          <path d="M 540 160 L 540 450" stroke={isNight ? '#1e293b' : '#e2e8f0'} strokeWidth="4" fill="none" />
          <path d="M 180 380 L 380 380" stroke={isNight ? '#1e293b' : '#e2e8f0'} strokeWidth="4" fill="none" />
          <path d="M 200 440 L 400 440" stroke={isNight ? '#1e293b' : '#e2e8f0'} strokeWidth="4" fill="none" />

          {/* Active Ride Route Polyline */}
          {originCoords && destCoords && (
            <g>
              {/* Route shadow / glow */}
              <line
                x1={originCoords.x}
                y1={originCoords.y}
                x2={destCoords.x}
                y2={destCoords.y}
                stroke={isNight ? '#38bdf8' : '#2563eb'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeOpacity={isNight ? 0.35 : 0.25}
                filter="url(#glow)"
              />
              {/* Route core */}
              <line
                x1={originCoords.x}
                y1={originCoords.y}
                x2={destCoords.x}
                y2={destCoords.y}
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="8 4"
              />

              {/* Midpoint Distance Badge */}
              <g transform={`translate(${(originCoords.x + destCoords.x) / 2}, ${(originCoords.y + destCoords.y) / 2})`}>
                <rect
                  x="-35"
                  y="-14"
                  width="70"
                  height="26"
                  rx="13"
                  fill={isNight ? '#0f172a' : '#1e3a8a'}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {activeRide ? `${activeRide.distanceKm} km` : 'Rota GPS'}
                </text>
              </g>
            </g>
          )}

          {/* Popular Landmarks markers */}
          {POPULAR_LOCATIONS.map((loc, idx) => {
            const p = projectToMap(loc.lat, loc.lng);
            const isOrigin = originPoint?.address === loc.address;
            const isDest = destPoint?.address === loc.address;

            return (
              <g
                key={idx}
                onClick={() => handleLandmarkClick(loc)}
                className="cursor-pointer group"
                transform={`translate(${p.x}, ${p.y})`}
              >
                {/* Pulse circle for origin or dest */}
                {(isOrigin || isDest) && (
                  <circle
                    r="18"
                    fill={isOrigin ? '#10b981' : '#ef4444'}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Base dot */}
                <circle
                  r={loc.popular ? '7' : '5'}
                  fill={
                    isOrigin
                      ? '#10b981'
                      : isDest
                      ? '#ef4444'
                      : isNight
                      ? '#38bdf8'
                      : '#2563eb'
                  }
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-transform duration-200 group-hover:scale-125"
                />

                {/* Label tooltip */}
                <rect
                  x="-45"
                  y="-26"
                  width="90"
                  height="18"
                  rx="4"
                  fill={isNight ? '#0f172a' : '#ffffff'}
                  stroke={isNight ? '#334155' : '#cbd5e1'}
                  strokeWidth="1"
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                />
                <text
                  x="0"
                  y="-14"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill={isNight ? '#f8fafc' : '#0f172a'}
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {loc.address.split('-')[0].slice(0, 15)}
                </text>
              </g>
            );
          })}

          {/* Active Drivers on Map */}
          {drivers
            .filter((d) => d.isOnline && d.status === 'approved')
            .map((driver) => {
              const pos = projectToMap(driver.lat, driver.lng);
              return (
                <g
                  key={driver.id}
                  transform={`translate(${pos.x}, ${pos.y}) rotate(${driver.heading})`}
                  className="transition-all duration-700"
                >
                  {/* Driver car icon badge */}
                  <circle
                    r="14"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter="url(#glow)"
                  />
                  {/* Front direction notch */}
                  <polygon points="0,-16 4,-12 -4,-12" fill="#38bdf8" />
                  {/* Car glyph inside */}
                  <path
                    d="M -5 -3 L -4 -7 L 4 -7 L 5 -3 L 6 3 L -6 3 Z"
                    fill="#ffffff"
                  />
                  <circle cx="-3" cy="4" r="1.5" fill="#0f172a" />
                  <circle cx="3" cy="4" r="1.5" fill="#0f172a" />
                </g>
              );
            })}

          {/* Simulated Moving Car for In-Progress Ride */}
          {simulatedCarPosition && (
            <g
              transform={`translate(${simulatedCarPosition.x}, ${simulatedCarPosition.y})`}
              className="transition-all duration-100"
            >
              <circle r="18" fill="#10b981" opacity="0.4" className="animate-ping" />
              <circle r="15" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" filter="url(#glow)" />
              <path
                d="M -5 -3 L -4 -7 L 4 -7 L 5 -3 L 6 3 L -6 3 Z"
                fill="#ffffff"
              />
              <circle cx="-3" cy="4" r="1.5" fill="#0f172a" />
              <circle cx="3" cy="4" r="1.5" fill="#0f172a" />
              <rect x="-30" y="-30" width="60" height="16" rx="8" fill="#1e293b" />
              <text x="0" y="-19" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                Em trajeto
              </text>
            </g>
          )}

          {/* Origin Marker Pin */}
          {originCoords && (
            <g transform={`translate(${originCoords.x}, ${originCoords.y})`}>
              <circle r="12" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" filter="url(#glow)" />
              <circle r="4" fill="#ffffff" />
              <rect x="-35" y="-32" width="70" height="20" rx="10" fill="#065f46" stroke="#ffffff" strokeWidth="1" />
              <text x="0" y="-19" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                Embarque
              </text>
            </g>
          )}

          {/* Destination Marker Pin */}
          {destCoords && (
            <g transform={`translate(${destCoords.x}, ${destCoords.y})`}>
              <circle r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" filter="url(#glow)" />
              <circle r="4" fill="#ffffff" />
              <rect x="-35" y="-32" width="70" height="20" rx="10" fill="#991b1b" stroke="#ffffff" strokeWidth="1" />
              <text x="0" y="-19" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                Destino
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Map Footer / Quick Selection Hint */}
      <div className={`absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs backdrop-blur-md border ${
        isNight ? 'bg-slate-900/90 border-slate-700/80 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">
            {interactive ? 'Clique nos pontos para definir origem ou destino em Primavera do Leste' : 'Mapa em tempo real do trajeto'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-medium ml-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Monitoramento 24h</span>
        </div>
      </div>
    </div>
  );
};
