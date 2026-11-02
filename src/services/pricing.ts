import { PlatformTariff } from '../types';

/**
 * Verifica se o horário atual (ou fornecido) está dentro do intervalo do adicional noturno (20h às 05h).
 */
export function isNightTime(overrideHour?: number): boolean {
  const hour = overrideHour !== undefined ? overrideHour : new Date().getHours();
  // Das 20h (inclusive) até 05h (antes das 05:00)
  return hour >= 20 || hour < 5;
}

export interface FareCalculation {
  distanceKm: number;
  baseFare: number;
  isNight: boolean;
  nightSurchargeAmount: number;
  finalPrice: number;
  platformFee: number;
  driverEarnings: number;
  isMinimumApplied: boolean;
}

/**
 * Calcula a tarifa da corrida de acordo com as regras de Primavera Mobilidade:
 * - R$ 2,00 por km
 * - Mínimo de R$ 6,00
 * - Adicional noturno de 20% (20h às 5h)
 * - Comissão da plataforma: R$ 0,80 por corrida concluída
 */
export function calculateFare(
  distanceKm: number,
  tariff: PlatformTariff,
  forceNight?: boolean,
  currentHour?: number
): FareCalculation {
  const isNight = forceNight !== undefined ? forceNight : isNightTime(currentHour);

  // Distância x R$ por km
  let calculatedDistanceFare = distanceKm * tariff.baseKmPrice;

  // Garante a tarifa mínima antes do adicional ou no total
  let subtotal = Math.max(calculatedDistanceFare, tariff.minFare);
  const isMinimumApplied = subtotal === tariff.minFare;

  let nightSurchargeAmount = 0;
  if (isNight) {
    nightSurchargeAmount = Number((subtotal * (tariff.nightSurchargePct / 100)).toFixed(2));
  }

  const finalPrice = Number((subtotal + nightSurchargeAmount).toFixed(2));
  const platformFee = tariff.platformFeePerRide; // R$ 0,80 fixo
  const driverEarnings = Number(Math.max(0, finalPrice - platformFee).toFixed(2));

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    baseFare: Number(subtotal.toFixed(2)),
    isNight,
    nightSurchargeAmount,
    finalPrice,
    platformFee,
    driverEarnings,
    isMinimumApplied,
  };
}

/**
 * Calcula a distância euclidiana/haversine aproximada em km entre dois pontos geográficos.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Em rotas urbanas de Primavera do Leste, as ruas aumentam a distância em cerca de 25-35%
  const routeFactor = 1.28;
  return Number(Math.max(1.2, straightDistance * routeFactor).toFixed(1));
}
