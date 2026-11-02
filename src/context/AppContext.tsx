import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_DRIVERS,
  INITIAL_RIDES,
  INITIAL_TARIFF,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  POPULAR_LOCATIONS,
} from '../data/mockData';
import {
  auth,
  createRideInFirestore,
  isFirebaseConfigured,
  onRealAuthStateChanged,
  saveDriverToFirestore,
  saveTariffToFirestore,
  saveTicketToFirestore,
  saveTransactionToFirestore,
  saveUserToFirestore,
  seedInitialFirestoreData,
  subscribeToDrivers,
  subscribeToRides,
  subscribeToTariff,
  subscribeToTickets,
  subscribeToTransactions,
  subscribeToUsers,
  updateDriverInFirestore,
  updateRideInFirestore,
} from '../services/firebase';
import { calculateDistanceKm, calculateFare } from '../services/pricing';
import {
  DriverProfile,
  DriverStatus,
  LocationPoint,
  PaymentMethod,
  PlatformTariff,
  Ride,
  SupportTicket,
  Transaction,
  User,
  UserRole,
} from '../types';

interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];

  // Drivers
  drivers: DriverProfile[];
  currentDriverProfile: DriverProfile | undefined;
  toggleDriverOnline: (driverId: string) => void;
  approveDriver: (driverId: string) => void;
  rejectDriver: (driverId: string) => void;
  registerDriver: (profile: Partial<DriverProfile>) => void;
  updateDriverPixKey: (driverId: string, pixKey: string) => void;

  // Rides
  rides: Ride[];
  activePassengerRide: Ride | undefined;
  activeDriverRide: Ride | undefined;
  pendingRequestsForDriver: Ride[];
  requestRide: (origin: LocationPoint, destination: LocationPoint, paymentMethod: PaymentMethod) => Ride;
  acceptRide: (rideId: string, driverId: string) => void;
  driverArrivedAtPickup: (rideId: string) => void;
  startRide: (rideId: string) => void;
  finishRide: (rideId: string) => void;
  cancelRide: (rideId: string, reason?: string) => void;
  rateRide: (rideId: string, rating: number, comment?: string) => void;

  // Tariffs & Financials
  tariff: PlatformTariff;
  updateTariff: (newTariff: Partial<PlatformTariff>) => void;
  transactions: Transaction[];
  platformCommissionTotal: number;
  totalPlatformVolume: number;

  // Simulation controls
  isNightSimulated: boolean;
  setIsNightSimulated: (night: boolean) => void;
  resetToInitialData: () => void;
  seedCloudFirestore: () => Promise<void>;

  // Support
  tickets: SupportTicket[];
  createTicket: (subject: string, message: string, priority?: 'low' | 'medium' | 'high') => void;
  replyTicket: (ticketId: string, reply: string) => void;

  // Modals & Panels
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showFirebaseModal: boolean;
  setShowFirebaseModal: (show: boolean) => void;
  showRegisterDriverModal: boolean;
  setShowRegisterDriverModal: (show: boolean) => void;
  loginUser: (method: 'phone' | 'google', phoneOrEmail: string, name?: string, firebaseUid?: string) => void;
  isFirestoreSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'pm_users_v2',
  DRIVERS: 'pm_drivers_v2',
  RIDES: 'pm_rides_v2',
  TARIFF: 'pm_tariff_v2',
  TRANSACTIONS: 'pm_transactions_v2',
  TICKETS: 'pm_tickets_v2',
  ROLE: 'pm_current_role_v2',
  CURRENT_USER_ID: 'pm_current_user_id_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or fallback to initial defaults
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'passenger';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = INITIAL_USERS.find((u) => u.id === savedId);
    return found || INITIAL_USERS[0];
  });

  const [drivers, setDrivers] = useState<DriverProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [rides, setRides] = useState<Ride[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIDES);
    return saved ? JSON.parse(saved) : INITIAL_RIDES;
  });

  const [tariff, setTariff] = useState<PlatformTariff>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARIFF);
    return saved ? JSON.parse(saved) : INITIAL_TARIFF;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [isNightSimulated, setIsNightSimulated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [showRegisterDriverModal, setShowRegisterDriverModal] = useState<boolean>(false);
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(isFirebaseConfigured);

  // Sync to localStorage as robust offline and fast cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
  }, [rides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(tariff));
  }, [tariff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  // Synchronize Firebase Auth state with currentUser and role permissions
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onRealAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const isAdmin =
          firebaseUser.email === 'alessandrocvalentimm@gmail.com' ||
          (firebaseUser.email ? firebaseUser.email.toLowerCase().includes('admin') : false);

        setUsers((prevUsers) => {
          const existing = prevUsers.find(
            (u) =>
              u.id === firebaseUser.uid ||
              (firebaseUser.email && u.email.toLowerCase() === firebaseUser.email.toLowerCase()) ||
              (firebaseUser.phoneNumber && u.phone === firebaseUser.phoneNumber)
          );

          if (existing) {
            const updated: User = {
              ...existing,
              id: firebaseUser.uid,
              name: firebaseUser.displayName || existing.name,
              email: firebaseUser.email || existing.email,
              phone: firebaseUser.phoneNumber || existing.phone,
              photoUrl: firebaseUser.photoURL || existing.photoUrl,
              role: isAdmin ? 'admin' : existing.role,
            };
            setCurrentUser(updated);
            if (isAdmin) setCurrentRole('admin');
            saveUserToFirestore(updated);
            return prevUsers.map((u) => (u.id === existing.id ? updated : u));
          } else {
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || (firebaseUser.phoneNumber ? 'Passageiro Primavera' : 'Usuário'),
              phone: firebaseUser.phoneNumber || '(66) 99999-0000',
              email: firebaseUser.email || `user_${firebaseUser.uid.slice(0, 8)}@pva.com`,
              role: isAdmin ? 'admin' : 'passenger',
              photoUrl: firebaseUser.photoURL || undefined,
              rating: 5.0,
              totalRides: 0,
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(newUser);
            if (isAdmin) setCurrentRole('admin');
            saveUserToFirestore(newUser);
            return [newUser, ...prevUsers];
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Connect Real Cloud Firestore Subscriptions when configured
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    setIsFirestoreSyncing(true);

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers.length > 0) setUsers(cloudUsers);
    });

    const unsubDrivers = subscribeToDrivers((cloudDrivers) => {
      if (cloudDrivers.length > 0) setDrivers(cloudDrivers);
    });

    const unsubRides = subscribeToRides((cloudRides) => {
      if (cloudRides.length > 0) setRides(cloudRides);
    });

    const unsubTariff = subscribeToTariff((cloudTariff) => {
      if (cloudTariff && cloudTariff.baseKmPrice) setTariff(cloudTariff);
    });

    const unsubTxs = subscribeToTransactions((cloudTxs) => {
      if (cloudTxs.length > 0) setTransactions(cloudTxs);
    });

    const unsubTickets = subscribeToTickets((cloudTickets) => {
      if (cloudTickets.length > 0) setTickets(cloudTickets);
    });

    return () => {
      unsubUsers();
      unsubDrivers();
      unsubRides();
      unsubTariff();
      unsubTxs();
      unsubTickets();
    };
  }, []);

  // Derived current driver profile if role is driver
  const currentDriverProfile = drivers.find(
    (d) => d.userId === currentUser.id || d.id === 'drv_1'
  ) || drivers[0];

  // Active ride for passenger
  const activePassengerRide = rides.find(
    (r) =>
      r.passengerId === currentUser.id &&
      ['requested', 'accepted', 'arriving', 'in_progress'].includes(r.status)
  );

  // Active ride for driver
  const activeDriverRide = rides.find(
    (r) =>
      r.driverId === currentDriverProfile?.id &&
      ['accepted', 'arriving', 'in_progress'].includes(r.status)
  );

  // Pending requests that any online driver can accept
  const pendingRequestsForDriver = rides.filter(
    (r) => r.status === 'requested' && currentDriverProfile?.status === 'approved' && currentDriverProfile?.isOnline
  );

  // Financial totals
  const completedRides = rides.filter((r) => r.status === 'completed');
  const platformCommissionTotal = completedRides.reduce((acc, r) => acc + (r.platformFee || 0.8), 0);
  const totalPlatformVolume = completedRides.reduce((acc, r) => acc + r.price, 0);

  // Seed data directly to Cloud Firestore project
  const seedCloudFirestore = async () => {
    if (!isFirebaseConfigured) return;
    await seedInitialFirestoreData(users, drivers, rides, tariff, transactions, tickets);
  };

  // Actions with simultaneous Cloud Firestore dispatch
  const toggleDriverOnline = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    const newStatus = driver ? !driver.isOnline : true;

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isOnline: newStatus } : d))
    );

    if (isFirebaseConfigured) {
      updateDriverInFirestore(driverId, { isOnline: newStatus });
    }
  };

  const approveDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'approved' } : d))
    );

    if (isFirebaseConfigured) {
      updateDriverInFirestore(driverId, { status: 'approved' });
    }
  };

  const rejectDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'rejected' } : d))
    );

    if (isFirebaseConfigured) {
      updateDriverInFirestore(driverId, { status: 'rejected' });
    }
  };

  const registerDriver = (profile: Partial<DriverProfile>) => {
    const effectiveUserId = auth?.currentUser?.uid || currentUser.id;
    const newDriverId = `drv_${Date.now()}`;
    const newDriver: DriverProfile = {
      id: newDriverId,
      userId: effectiveUserId,
      name: profile.name || currentUser.name,
      phone: profile.phone || currentUser.phone,
      email: currentUser.email,
      photoUrl: currentUser.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      cnhNumber: profile.cnhNumber || '00000000000',
      cnhCategory: profile.cnhCategory || 'B',
      vehicleModel: profile.vehicleModel || 'Carro Modelo',
      vehiclePlate: profile.vehiclePlate || 'BRA-2E19',
      vehicleYear: profile.vehicleYear || '2023',
      vehicleColor: profile.vehicleColor || 'Branco',
      vehicleCategory: profile.vehicleCategory || 'Comum',
      status: 'pending', // Requires manual approval by administrator
      isOnline: false,
      lat: POPULAR_LOCATIONS[0].lat + 0.002,
      lng: POPULAR_LOCATIONS[0].lng - 0.002,
      heading: 0,
      rating: 5.0,
      totalRides: 0,
      walletBalance: 0,
      dailyEarnings: 0,
      weeklyEarnings: 0,
      pixKey: profile.pixKey || profile.phone || currentUser.phone,
      cnhDocUploaded: true,
      crlvDocUploaded: true,
      createdAt: new Date().toISOString(),
    };

    setDrivers((prev) => [newDriver, ...prev]);

    if (isFirebaseConfigured) {
      saveDriverToFirestore(newDriver);
    }

    createTicket(
      `Novo Cadastro de Motorista: ${newDriver.name}`,
      `Motorista ${newDriver.name} cadastrou o veículo ${newDriver.vehicleModel} (${newDriver.vehiclePlate}). Aguardando aprovação administrativa.`,
      'high'
    );
  };

  const updateDriverPixKey = (driverId: string, pixKey: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, pixKey } : d))
    );

    if (isFirebaseConfigured) {
      updateDriverInFirestore(driverId, { pixKey });
    }
  };

  const requestRide = (
    origin: LocationPoint,
    destination: LocationPoint,
    paymentMethod: PaymentMethod
  ): Ride => {
    const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const fare = calculateFare(distanceKm, tariff, isNightSimulated);
    const effectivePassengerId = auth?.currentUser?.uid || currentUser.id;

    const newRide: Ride = {
      id: `corrida_${Date.now()}`,
      passengerId: effectivePassengerId,
      passengerName: currentUser.name,
      passengerPhone: currentUser.phone,
      passengerRating: currentUser.rating,
      origin,
      destination,
      distanceKm: fare.distanceKm,
      estimatedMinutes: Math.max(4, Math.round(fare.distanceKm * 2.2)),
      baseFare: fare.baseFare,
      price: fare.finalPrice,
      isNightSurcharge: fare.isNight,
      platformFee: fare.platformFee,
      driverEarnings: fare.driverEarnings,
      status: 'requested',
      paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    setRides((prev) => [newRide, ...prev]);

    if (isFirebaseConfigured) {
      createRideInFirestore(newRide);
    }

    return newRide;
  };

  const acceptRide = (rideId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const acceptedAt = new Date().toISOString();
    const updatePayload = {
      status: 'accepted' as const,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverPhoto: driver.photoUrl,
      driverRating: driver.rating,
      vehicleInfo: driver.vehicleModel,
      vehiclePlate: driver.vehiclePlate,
      vehicleColor: driver.vehicleColor,
      acceptedAt,
    };

    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, ...updatePayload } : r))
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, updatePayload);
    }
  };

  const driverArrivedAtPickup = (rideId: string) => {
    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, status: 'arriving' } : r))
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, { status: 'arriving' });
    }
  };

  const startRide = (rideId: string) => {
    const startedAt = new Date().toISOString();

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId ? { ...r, status: 'in_progress', startedAt } : r
      )
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, { status: 'in_progress', startedAt });
    }
  };

  const finishRide = (rideId: string) => {
    const targetRide = rides.find((r) => r.id === rideId);
    if (!targetRide) return;

    const completedAt = new Date().toISOString();
    const earnings = targetRide.driverEarnings;
    const fee = targetRide.platformFee;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0284C7', '#38BDF8', '#10B981'],
      });
    } catch {}

    const completedRidePayload = {
      status: 'completed' as const,
      paymentStatus: 'paid' as const,
      completedAt,
    };

    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, ...completedRidePayload } : r))
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, completedRidePayload);
    }

    if (targetRide.driverId) {
      const driver = drivers.find((d) => d.id === targetRide.driverId);
      const newBalance = Number(((driver?.walletBalance || 0) + earnings).toFixed(2));
      const newDaily = Number(((driver?.dailyEarnings || 0) + targetRide.price).toFixed(2));
      const newWeekly = Number(((driver?.weeklyEarnings || 0) + targetRide.price).toFixed(2));
      const newRidesCount = (driver?.totalRides || 0) + 1;

      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === targetRide.driverId) {
            return {
              ...d,
              walletBalance: newBalance,
              dailyEarnings: newDaily,
              weeklyEarnings: newWeekly,
              totalRides: newRidesCount,
            };
          }
          return d;
        })
      );

      if (isFirebaseConfigured) {
        updateDriverInFirestore(targetRide.driverId, {
          walletBalance: newBalance,
          dailyEarnings: newDaily,
          weeklyEarnings: newWeekly,
          totalRides: newRidesCount,
        });
      }

      // Create Transactions in state & Cloud Firestore
      const fareTx: Transaction = {
        id: `tx_${Date.now()}_fare`,
        driverId: targetRide.driverId,
        driverName: targetRide.driverName || 'Motorista',
        rideId: targetRide.id,
        amount: targetRide.price,
        type: 'ride_fare',
        description: `Corrida finalizada #${targetRide.id.slice(-4)} (${targetRide.origin.neighborhood} -> ${targetRide.destination.neighborhood})`,
        status: 'completed',
        date: completedAt,
      };

      const feeTx: Transaction = {
        id: `tx_${Date.now()}_fee`,
        driverId: targetRide.driverId,
        driverName: targetRide.driverName || 'Motorista',
        rideId: targetRide.id,
        amount: -fee,
        type: 'platform_fee',
        description: `Taxa da plataforma Primavera Mobilidade (-R$ 0,80)`,
        status: 'completed',
        date: completedAt,
      };

      setTransactions((prev) => [fareTx, feeTx, ...prev]);

      if (isFirebaseConfigured) {
        saveTransactionToFirestore(fareTx);
        saveTransactionToFirestore(feeTx);
      }
    }

    // Update Passenger in state & Cloud Firestore
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetRide.passengerId) {
          const updatedUser = { ...u, totalRides: u.totalRides + 1 };
          if (isFirebaseConfigured) {
            saveUserToFirestore(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  const cancelRide = (rideId: string, reason?: string) => {
    const cancelledPayload = {
      status: 'cancelled' as const,
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || 'Cancelada pelo usuário',
    };

    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, ...cancelledPayload } : r))
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, cancelledPayload);
    }
  };

  const rateRide = (rideId: string, rating: number, comment?: string) => {
    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, rating, ratingComment: comment } : r))
    );

    if (isFirebaseConfigured) {
      updateRideInFirestore(rideId, { rating, ratingComment: comment });
    }
  };

  const updateTariff = (newTariff: Partial<PlatformTariff>) => {
    const updated = { ...tariff, ...newTariff };
    setTariff(updated);

    if (isFirebaseConfigured) {
      saveTariffToFirestore(updated);
    }
  };

  const createTicket = (
    subject: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      subject,
      message,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);

    if (isFirebaseConfigured) {
      saveTicketToFirestore(newTicket);
    }
  };

  const replyTicket = (ticketId: string, reply: string) => {
    const updatedTicket = { reply, status: 'resolved' as const };

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...updatedTicket } : t))
    );

    if (isFirebaseConfigured) {
      const fullTicket = tickets.find((t) => t.id === ticketId);
      if (fullTicket) {
        saveTicketToFirestore({ ...fullTicket, ...updatedTicket });
      }
    }
  };

  const resetToInitialData = () => {
    setUsers(INITIAL_USERS);
    setDrivers(INITIAL_DRIVERS);
    setRides(INITIAL_RIDES);
    setTariff(INITIAL_TARIFF);
    setTransactions(INITIAL_TRANSACTIONS);
    setTickets(INITIAL_TICKETS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentRole('passenger');
    localStorage.clear();
  };

  const loginUser = (
    method: 'phone' | 'google',
    phoneOrEmail: string,
    name?: string,
    firebaseUid?: string
  ) => {
    const targetUid = firebaseUid || auth?.currentUser?.uid;
    const isAdmin =
      phoneOrEmail.toLowerCase() === 'alessandrocvalentimm@gmail.com' ||
      phoneOrEmail.toLowerCase().includes('admin');

    let existing = users.find(
      (u) =>
        (targetUid && u.id === targetUid) ||
        u.phone === phoneOrEmail ||
        u.email.toLowerCase() === phoneOrEmail.toLowerCase()
    );

    if (existing) {
      const updatedUser: User = {
        ...existing,
        id: targetUid || existing.id,
        role: isAdmin ? 'admin' : existing.role,
      };
      setCurrentUser(updatedUser);
      if (isAdmin) setCurrentRole('admin');
      if (isFirebaseConfigured) {
        saveUserToFirestore(updatedUser);
      }
    } else {
      const newUser: User = {
        id: targetUid || `user_${Date.now()}`,
        name: name || (method === 'google' ? 'Usuário Google' : 'Passageiro Primavera'),
        phone: method === 'phone' ? phoneOrEmail : '(66) 99999-0000',
        email: method === 'google' ? phoneOrEmail : `user${Date.now()}@pva.com`,
        role: isAdmin ? 'admin' : 'passenger',
        rating: 5.0,
        totalRides: 0,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      if (isAdmin) setCurrentRole('admin');
      if (isFirebaseConfigured) {
        saveUserToFirestore(newUser);
      }
    }

    setShowAuthModal(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        users,
        drivers,
        currentDriverProfile,
        toggleDriverOnline,
        approveDriver,
        rejectDriver,
        registerDriver,
        updateDriverPixKey,
        rides,
        activePassengerRide,
        activeDriverRide,
        pendingRequestsForDriver,
        requestRide,
        acceptRide,
        driverArrivedAtPickup,
        startRide,
        finishRide,
        cancelRide,
        rateRide,
        tariff,
        updateTariff,
        transactions,
        platformCommissionTotal,
        totalPlatformVolume,
        isNightSimulated,
        setIsNightSimulated,
        resetToInitialData,
        seedCloudFirestore,
        tickets,
        createTicket,
        replyTicket,
        showAuthModal,
        setShowAuthModal,
        showFirebaseModal,
        setShowFirebaseModal,
        showRegisterDriverModal,
        setShowRegisterDriverModal,
        loginUser,
        isFirestoreSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
