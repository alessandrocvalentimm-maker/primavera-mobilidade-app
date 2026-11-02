/**
 * Firebase Real Initialization & Service Configuration for Primavera Mobilidade
 * Project ID: primavera-mobilidade
 * Uses Firebase JavaScript SDK v11+ with Firebase Authentication and Cloud Firestore.
 * Configuration is dynamically injected via Vite environment variables (VITE_FIREBASE_*).
 */

import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  DriverProfile,
  PlatformTariff,
  Ride,
  SupportTicket,
  Transaction,
  User,
} from '../types';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
  projectId: string;
  authReady: boolean;
  firestoreReady: boolean;
  errorMessage?: string;
}

export interface RealConnectionCheckResult {
  connected: boolean;
  latencyMs?: number;
  message: string;
  timestamp: string;
  details?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// 1. Read environment variables from import.meta.env with fallback to user provided credentials
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB7wDQdWdw38zUoIdaiGCwAuYi42bxtQds';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'primavera-mobilidade.firebaseapp.com';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'primavera-mobilidade';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'primavera-mobilidade.firebasestorage.app';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '372328004040';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '1:372328004040:web:48234989a4ad9abbdfa8fd';
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K0LPNCT8PX';

// List missing mandatory environment variables
const requiredEnvVars = [
  { key: 'VITE_FIREBASE_API_KEY', val: apiKey },
  { key: 'VITE_FIREBASE_APP_ID', val: appId },
];

export const missingFirebaseKeys = requiredEnvVars
  .filter((item) => !item.val)
  .map((item) => item.key);

export const isFirebaseConfigured = Boolean(apiKey && projectId && appId);

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

// 2. Initialize real Firebase instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.error('Erro ao inicializar Firebase SDK:', err);
  }
}

export { app, auth, db, googleProvider };

/**
 * Retorna o status atual da configuração do Firebase.
 */
export function getFirebaseStatus(): FirebaseConfigStatus {
  return {
    isConfigured: isFirebaseConfigured,
    missingKeys: missingFirebaseKeys,
    projectId: projectId,
    authReady: auth !== null,
    firestoreReady: db !== null,
  };
}

/**
 * Realiza uma verificação real de conectividade com o Cloud Firestore
 * utilizando getDocFromServer.
 */
export async function verifyRealFirebaseConnection(): Promise<RealConnectionCheckResult> {
  const timestamp = new Date().toISOString();

  if (!isFirebaseConfigured || !db) {
    return {
      connected: false,
      message: 'Firebase não configurado. Adicione VITE_FIREBASE_API_KEY e VITE_FIREBASE_APP_ID no arquivo .env.',
      timestamp,
      details: `Projeto: ${projectId} | Variáveis ausentes: ${missingFirebaseKeys.join(', ') || 'Nenhuma'}`,
    };
  }

  const startTime = performance.now();
  try {
    // Leitura real no Firestore para validar handshake com o servidor
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    const latencyMs = Math.round(performance.now() - startTime);

    return {
      connected: true,
      latencyMs,
      message: 'Conectado ao Cloud Firestore com sucesso!',
      timestamp,
      details: `Projeto: ${projectId} (Latência: ${latencyMs}ms)`,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errMessage = error instanceof Error ? error.message : String(error);

    // Se o documento não existe ou houve resposta de regras de segurança (permission-denied), o servidor respondeu!
    if (
      errMessage.includes('permission-denied') ||
      errMessage.includes('Missing or insufficient permissions') ||
      errMessage.includes('not-found')
    ) {
      return {
        connected: true,
        latencyMs,
        message: 'Servidor Firestore ativo e respondendo (Regras de segurança ativas)',
        timestamp,
        details: `Projeto: ${projectId} (Resposta em ${latencyMs}ms)`,
      };
    }

    if (
      errMessage.includes('offline') ||
      errMessage.includes('unavailable') ||
      errMessage.includes('network-request-failed')
    ) {
      return {
        connected: false,
        latencyMs,
        message: 'Cliente Firestore offline ou sem conexão com a nuvem.',
        timestamp,
        details: errMessage,
      };
    }

    return {
      connected: false,
      latencyMs,
      message: 'Falha na resposta do Cloud Firestore.',
      timestamp,
      details: errMessage,
    };
  }
}

// ----------------------------------------------------------------------
// AUTENTICAÇÃO REAL (Google e Telefone / SMS)
// ----------------------------------------------------------------------

/**
 * Executa login real com popup do Google
 */
export async function signInWithGoogleReal(): Promise<FirebaseUser | null> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth não inicializado. Configure as variáveis VITE_FIREBASE_* no .env');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Cria ou recupera um RecaptchaVerifier limpo para autenticação por telefone
 */
export function getOrCreateRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!auth) {
    throw new Error('Firebase Auth não inicializado. Configure as variáveis VITE_FIREBASE_* no .env');
  }

  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {}
    activeRecaptchaVerifier = null;
  }

  activeRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // Recaptcha resolvido com sucesso
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expirou. Tente novamente.');
    },
  });

  return activeRecaptchaVerifier;
}

export const createRecaptchaVerifier = getOrCreateRecaptchaVerifier;

/**
 * Envia SMS real com código de verificação para o telefone
 */
export async function sendPhoneVerificationReal(
  phoneNumberE164: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) {
    throw new Error('Firebase Auth não inicializado.');
  }
  return await signInWithPhoneNumber(auth, phoneNumberE164, verifier);
}

/**
 * Desconecta a sessão do Firebase
 */
export async function signOutReal(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Observa alterações de estado de autenticação real
 */
export function onRealAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
}

// ----------------------------------------------------------------------
// SERVIÇOS DO CLOUD FIRESTORE REAL (Passageiros, Motoristas, Corridas, Tarifas, etc.)
// ----------------------------------------------------------------------

/**
 * Observa em tempo real a coleção de usuários no Cloud Firestore
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as User);
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => console.warn('Firestore Users listener:', err)
  );
}

/**
 * Salva/atualiza um usuário no Cloud Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`, user.id, user.email);
  }
}

/**
 * Observa em tempo real os motoristas parceiros no Cloud Firestore
 */
export function subscribeToDrivers(onUpdate: (drivers: DriverProfile[]) => void) {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'drivers'),
    (snapshot) => {
      const items: DriverProfile[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as DriverProfile);
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => console.warn('Firestore Drivers listener:', err)
  );
}

/**
 * Salva ou atualiza motorista no Cloud Firestore
 */
export async function saveDriverToFirestore(driver: DriverProfile): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'drivers', driver.id), driver, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `drivers/${driver.id}`, driver.userId, driver.email);
  }
}

/**
 * Atualiza status ou campos específicos de um motorista
 */
export async function updateDriverInFirestore(driverId: string, fields: Partial<DriverProfile>): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'drivers', driverId), fields);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `drivers/${driverId}`);
  }
}

/**
 * Observa em tempo real as corridas no Cloud Firestore
 */
export function subscribeToRides(onUpdate: (rides: Ride[]) => void) {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'rides'),
    (snapshot) => {
      const items: Ride[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Ride);
      });
      if (items.length > 0) {
        // Ordena por data decrescente
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      }
    },
    (err) => console.warn('Firestore Rides listener:', err)
  );
}

/**
 * Cria uma nova corrida no Cloud Firestore
 */
export async function createRideInFirestore(ride: Ride): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'rides', ride.id), ride);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `rides/${ride.id}`, ride.passengerId);
  }
}

/**
 * Atualiza o status e detalhes de uma corrida no Cloud Firestore
 */
export async function updateRideInFirestore(rideId: string, fields: Partial<Ride>): Promise<void> {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'rides', rideId), fields);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rides/${rideId}`);
  }
}

/**
 * Observa em tempo real as tarifas da plataforma no Cloud Firestore
 */
export function subscribeToTariff(onUpdate: (tariff: PlatformTariff) => void) {
  if (!db) return () => {};
  return onSnapshot(
    doc(db, 'tariffs', 'config'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as PlatformTariff);
      }
    },
    (err) => console.warn('Firestore Tariff listener:', err)
  );
}

/**
 * Salva a configuração de tarifas no Cloud Firestore
 */
export async function saveTariffToFirestore(tariff: PlatformTariff): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'tariffs', 'config'), tariff, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'tariffs/config');
  }
}

/**
 * Observa em tempo real as transações financeiras no Cloud Firestore
 */
export function subscribeToTransactions(onUpdate: (txs: Transaction[]) => void) {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'transactions'),
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Transaction);
      });
      if (items.length > 0) {
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(items);
      }
    },
    (err) => console.warn('Firestore Transactions listener:', err)
  );
}

/**
 * Registra uma transação financeira no Cloud Firestore
 */
export async function saveTransactionToFirestore(tx: Transaction): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`, tx.driverId);
  }
}

/**
 * Observa chamados de suporte no Cloud Firestore
 */
export function subscribeToTickets(onUpdate: (tickets: SupportTicket[]) => void) {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, 'tickets'),
    (snapshot) => {
      const items: SupportTicket[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as SupportTicket);
      });
      if (items.length > 0) {
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      }
    },
    (err) => console.warn('Firestore Tickets listener:', err)
  );
}

/**
 * Salva chamado de suporte no Cloud Firestore
 */
export async function saveTicketToFirestore(ticket: SupportTicket): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'tickets', ticket.id), ticket, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tickets/${ticket.id}`, ticket.userId);
  }
}

/**
 * Popula o Cloud Firestore com os dados iniciais de Primavera do Leste
 * quando o banco de dados for novo/vazio
 */
export async function seedInitialFirestoreData(
  initialUsers: User[],
  initialDrivers: DriverProfile[],
  initialRides: Ride[],
  initialTariff: PlatformTariff,
  initialTransactions: Transaction[],
  initialTickets: SupportTicket[]
): Promise<void> {
  if (!db) return;

  // 1. Salva Tarifas
  await saveTariffToFirestore(initialTariff);

  // 2. Salva Usuários
  for (const u of initialUsers) {
    await saveUserToFirestore(u);
  }
  // 3. Salva Motoristas
  for (const d of initialDrivers) {
    await saveDriverToFirestore(d);
  }

  // 4. Salva Corridas
  for (const r of initialRides) {
    await createRideInFirestore(r);
  }

  // 5. Salva Transações
  for (const t of initialTransactions) {
    await saveTransactionToFirestore(t);
  }

  // 6. Salva Tickets
  for (const tk of initialTickets) {
    await saveTicketToFirestore(tk);
  }
}

/**
 * Manipulador de erros do Firestore padronizado
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  currentUserId?: string,
  userEmail?: string
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUserId || auth?.currentUser?.uid || null,
      email: userEmail || auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified ?? true,
      isAnonymous: auth?.currentUser?.isAnonymous ?? false,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}
