export type UserRole = 'passenger' | 'driver' | 'admin';

export type RideStatus =
  | 'requested'    // Passageiro solicitou
  | 'accepted'     // Motorista aceitou
  | 'arriving'     // Motorista a caminho do embarque
  | 'in_progress'  // Em viagem
  | 'completed'    // Finalizada
  | 'cancelled';   // Cancelada

export type PaymentMethod = 'pix' | 'money' | 'card';
export type PaymentStatus = 'pending' | 'paid';

export type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface LocationPoint {
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  popular?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  rating: number;
  totalRides: number;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  cnhNumber: string;
  cnhCategory: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleCategory: 'Comum' | 'Conforto' | 'Moto';
  status: DriverStatus;
  isOnline: boolean;
  lat: number;
  lng: number;
  heading: number;
  rating: number;
  totalRides: number;
  walletBalance: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  pixKey: string;
  cnhDocUploaded: boolean;
  crlvDocUploaded: boolean;
  createdAt: string;
}

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  driverRating?: number;
  vehicleInfo?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  origin: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  price: number;
  isNightSurcharge: boolean;
  platformFee: number; // R$ 0,80 fixa
  driverEarnings: number; // price - platformFee
  status: RideStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  routeCoordinates?: [number, number][];
}

export interface PlatformTariff {
  baseKmPrice: number;        // R$ 2,00 / km
  minFare: number;            // R$ 6,00 mínima
  nightSurchargePct: number;  // 20% adicional noturno
  nightStartHour: number;     // 20 (20h)
  nightEndHour: number;       // 5 (05h)
  platformFeePerRide: number; // R$ 0,80 por corrida
}

export interface Transaction {
  id: string;
  driverId: string;
  driverName: string;
  rideId?: string;
  amount: number;
  type: 'ride_fare' | 'platform_fee' | 'payout' | 'deposit';
  description: string;
  status: 'completed' | 'pending';
  date: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reply?: string;
}
