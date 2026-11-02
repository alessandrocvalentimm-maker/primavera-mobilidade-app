import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Key,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  RealConnectionCheckResult,
  getFirebaseStatus,
  isFirebaseConfigured,
  missingFirebaseKeys,
  verifyRealFirebaseConnection,
} from '../services/firebase';

export const FirebaseStatusModal: React.FC = () => {
  const { showFirebaseModal, setShowFirebaseModal } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'console_guide' | 'mobile_guide' | 'blueprint' | 'rules'>('status');

  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<RealConnectionCheckResult | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const status = getFirebaseStatus();

  const handleTestConnection = async () => {
    setChecking(true);
    try {
      const res = await verifyRealFirebaseConnection();
      setCheckResult(res);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (showFirebaseModal) {
      handleTestConnection();
    }
  }, [showFirebaseModal]);

  if (!showFirebaseModal) return null;

  const envTemplate = `# Configuração Real do Firebase para Primavera Mobilidade
VITE_FIREBASE_API_KEY="SUA_API_KEY_DO_FIREBASE"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white relative">
          <button
            onClick={() => setShowFirebaseModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Flame className="w-7 h-7 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Conexão Firebase Real</h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isFirebaseConfigured
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-300 text-amber-950'
                  }`}
                >
                  {isFirebaseConfigured ? 'SDK Inicializado' : 'Aguardando Credenciais'}
                </span>
              </div>
              <p className="text-amber-100 text-xs mt-0.5">
                Firebase Authentication • Cloud Firestore • Primavera Mobilidade
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex gap-1.5 mt-5 bg-amber-900/40 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${
                activeTab === 'status' ? 'bg-white text-orange-950 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Verificação Real
            </button>
            <button
              onClick={() => setActiveTab('console_guide')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${
                activeTab === 'console_guide' ? 'bg-white text-orange-950 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Passo a Passo Console
            </button>
            <button
              onClick={() => setActiveTab('mobile_guide')}
              className={`px-3 py-2 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                activeTab === 'mobile_guide' ? 'bg-white text-orange-950 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Configurações no Celular</span>
            </button>
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${
                activeTab === 'blueprint' ? 'bg-white text-orange-950 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Coleções Firestore
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-2 rounded-lg transition shrink-0 ${
                activeTab === 'rules' ? 'bg-white text-orange-950 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Regras de Segurança
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {/* TAB 1: Real Connection Status */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Diagnostic Box */}
              <div
                className={`p-5 rounded-2xl border ${
                  checkResult?.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {checking ? (
                      <RefreshCw className="w-5 h-5 text-orange-600 animate-spin shrink-0 mt-0.5" />
                    ) : checkResult?.connected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <h4 className="font-extrabold text-sm">
                        {checking
                          ? 'Testando conexão real com Cloud Firestore...'
                          : checkResult?.message || 'Status da Conexão Real'}
                      </h4>
                      {checkResult?.details && (
                        <p className="text-xs opacity-90 mt-1 font-mono">{checkResult.details}</p>
                      )}
                      {checkResult?.timestamp && (
                        <p className="text-[10px] opacity-70 mt-1">
                          Última checagem: {new Date(checkResult.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleTestConnection}
                    disabled={checking}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition shrink-0 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    <span>Testar Agora</span>
                  </button>
                </div>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    PROJETO FIREBASE
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {status.projectId || 'Não definido no .env'}
                  </p>
                  <p className="text-slate-500 text-[11px]">VITE_FIREBASE_PROJECT_ID</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">
                    ESTADO DO SDK
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {status.isConfigured ? 'Inicializado com Sucesso ✓' : 'Pendente de Configuração'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {status.isConfigured ? 'Pronto para sincronização' : `${missingFirebaseKeys.length} chaves ausentes`}
                  </p>
                </div>
              </div>

              {/* Missing keys alert if not configured */}
              {!isFirebaseConfigured && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-600" />
                    Variáveis de Ambiente Necessárias no .env:
                  </p>
                  <p className="text-slate-600">
                    O aplicativo utiliza o Firebase JavaScript SDK oficial inicializado em <code className="text-blue-700 font-mono">src/services/firebase.ts</code>. Para conectar seu projeto, defina as variáveis no arquivo <code className="text-blue-700 font-mono">.env</code>:
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto relative">
                    <button
                      onClick={copyEnvToClipboard}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition flex items-center gap-1 text-[10px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedEnv ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <pre>{envTemplate}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Firebase Console Step-by-Step Guide */}
          {activeTab === 'console_guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                <p className="font-bold text-sm mb-1">O que você precisa configurar no Firebase Console:</p>
                <p className="leading-relaxed">
                  Siga os passos abaixo no Console do Firebase para obter suas credenciais reais e liberar o banco de dados e login:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Criar ou Selecionar o Projeto no Firebase</span>
                  </h5>
                  <p className="text-slate-600 pl-7">
                    Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> e crie um projeto (ex: <code className="font-mono text-slate-800">primavera-mobilidade-mt</code>).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Ativar o Firebase Authentication</span>
                  </h5>
                  <p className="text-slate-600 pl-7">
                    No menu lateral, vá em <strong>Build &gt; Authentication &gt; Sign-in method</strong> e ative:
                  </p>
                  <ul className="list-disc pl-11 text-slate-600 space-y-0.5 mt-1">
                    <li><strong>Google:</strong> ative o provedor e informe o e-mail de suporte.</li>
                    <li><strong>Telefone:</strong> ative o envio de SMS (ou números de teste para desenvolvimento).</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Criar o Banco de Dados Cloud Firestore</span>
                  </h5>
                  <p className="text-slate-600 pl-7">
                    Vá em <strong>Build &gt; Firestore Database</strong>, clique em <strong>Criar banco de dados</strong>, escolha o local (ex: <code className="font-mono text-slate-800">southamerica-east1</code> em São Paulo) e cole as regras do arquivo <code className="font-mono text-blue-700">firestore.rules</code> na aba <strong>Regras (Rules)</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Registrar o Aplicativo Web e Copiar as Chaves</span>
                  </h5>
                  <p className="text-slate-600 pl-7">
                    Em <strong>Configurações do Projeto (ícone de engrenagem) &gt; Geral &gt; Seus aplicativos</strong>, clique em <strong>Adicionar aplicativo Web (&lt;/&gt;)</strong>. Copie o objeto gerado para o arquivo <code className="font-mono text-blue-700">.env</code> deste projeto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mobile Phone Configuration Guide */}
          {activeTab === 'mobile_guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-950 space-y-1">
                <p className="font-bold text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span>Configurações para o seu Celular (Android / iOS):</span>
                </p>
                <p className="leading-relaxed">
                  Para que você e os motoristas usem o aplicativo direto do celular com GPS e autenticação sem bloqueios, siga estes 4 passos:
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Autorizar os Domínios no Firebase (Essencial para Celular)</span>
                  </h5>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Tanto o login do Google quanto o SMS exigem que os domínios do app estejam autorizados. No Firebase Console do projeto <code className="font-mono text-blue-700">primavera-mobilidade</code>:
                  </p>
                  <p className="text-slate-700 pl-7 font-mono bg-white p-2 rounded border border-slate-200 text-[11px]">
                    Authentication &gt; Settings &gt; Authorized domains &gt; Adicionar domínio:
                    <br />
                    • <span className="text-blue-700 font-bold">ais-dev-6dlfrusxdazfysny7qopvh-534609899383.us-west1.run.app</span>
                    <br />
                    • <span className="text-blue-700 font-bold">ais-pre-6dlfrusxdazfysny7qopvh-534609899383.us-west1.run.app</span>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Permitir Acesso ao GPS no Navegador do Celular</span>
                  </h5>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Ao abrir o app no Chrome ou Safari do celular e tocar no botão <strong>"Usar meu GPS"</strong>, toque em <strong>"Permitir"</strong> quando o navegador solicitar acesso à sua localização. O Primavera Mobilidade detectará automaticamente seu ponto de embarque em Primavera do Leste - MT.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Adicionar à Tela Inicial do Celular (Instalar como App)</span>
                  </h5>
                  <div className="pl-7 space-y-1 text-slate-600">
                    <p>
                      <strong>No Android (Google Chrome):</strong> Toque no menu dos 3 pontinhos no canto superior direito &gt; <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
                    </p>
                    <p>
                      <strong>No iPhone (Safari):</strong> Toque no botão de Compartilhar (ícone com quadrado e seta para cima) &gt; role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                    </p>
                    <p className="text-emerald-700 font-semibold pt-1">
                      O ícone do Primavera Mobilidade aparecerá na tela do seu celular e abrirá em tela cheia como um aplicativo nativo!
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Cadastrar Número de Teste no Firebase (Para Testes sem Custo)</span>
                  </h5>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    No Firebase Console &gt; <strong>Authentication &gt; Sign-in method &gt; Telefone &gt; Números de telefone para teste</strong>:
                    adicione seu número (ex: <code className="font-mono text-slate-800">+5566996543210</code>) com código fixo (ex: <code className="font-mono text-slate-800">123456</code>). Isso permite testar o fluxo de corrida no celular instantaneamente sem gastar a cota de SMS do Firebase!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Firestore Collections Blueprint */}
          {activeTab === 'blueprint' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Estrutura de coleções definida no arquivo <code className="text-blue-600 font-mono">firebase-blueprint.json</code> pronta para receber os documentos:
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80">
                <pre>{JSON.stringify(
                  {
                    colecoes: {
                      "/users/{userId}": "Perfil do Usuário (nome, telefone, email, role: 'passenger' | 'driver' | 'admin')",
                      "/drivers/{driverId}": "Motoristas (cnhNumber, cnhCategory, vehicleModel, vehiclePlate, status: 'pending' | 'approved')",
                      "/rides/{rideId}": "Corridas (origem, destino, distanceKm, price, status, paymentMethod)",
                      "/tariffs/{tariffId}": "Tarifas (baseKmPrice: 2.0, minFare: 6.0, nightSurchargePct: 20, platformFeePerRide: 0.8)",
                      "/transactions/{transactionId}": "Carteira financeira (saldo, créditos de corrida, débito de taxa R$ 0,80)"
                    }
                  },
                  null,
                  2
                )}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: Firestore Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Regras de segurança de produção configuradas em <code className="text-blue-600 font-mono">firestore.rules</code>:
              </p>
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        request.auth.token.email == 'alessandrocvalentimm@gmail.com'
      );
    }

    match /users/{userId} {
      allow get: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == userId;
    }
    match /drivers/{driverId} {
      allow get, list: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (isAdmin() || request.auth.uid == resource.data.userId);
    }
    match /rides/{rideId} {
      allow get, list: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
    }
    match /tariffs/{tariffId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
