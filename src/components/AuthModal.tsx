import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  X,
  Mail,
} from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';
import { useApp } from '../context/AppContext';
import {
  createRecaptchaVerifier,
  isFirebaseConfigured,
  sendPhoneVerificationReal,
  signInWithGoogleReal,
} from '../services/firebase';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, loginUser, users, setCurrentUser } = useApp();

  const [authMethod, setAuthMethod] = useState<'phone' | 'google' | 'quick'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('(66) 99654-3210');
  const [name, setName] = useState<string>('');
  const [smsStep, setSmsStep] = useState<'number' | 'code'>('number');
  const [smsCode, setSmsCode] = useState<string>('');
  const [googleEmail, setGoogleEmail] = useState<string>('alessandrocvalentimm@gmail.com');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  if (!showAuthModal) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (smsStep === 'number') {
      const cleanDigits = phoneNumber.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setAuthError('Informe um número de celular válido com DDD.');
        return;
      }

      if (!isFirebaseConfigured) {
        setAuthError(
          'Firebase Authentication não configurado. Adicione VITE_FIREBASE_API_KEY no arquivo .env para enviar SMS real.'
        );
        return;
      }

      setSendingSms(true);
      try {
        const verifier = createRecaptchaVerifier('recaptcha-container');
        const formatted = cleanDigits.startsWith('55') ? `+${cleanDigits}` : `+55${cleanDigits}`;
        const result = await sendPhoneVerificationReal(formatted, verifier);
        setConfirmationResult(result);
        setSmsStep('code');
        setSmsCode('');
      } catch (err: any) {
        console.error('Erro real do Firebase Phone Auth:', err);
        const code = err.code || '';
        if (code === 'auth/unauthorized-domain') {
          setAuthError(
            'Domínio não autorizado no Firebase. Adicione a URL deste app em Firebase Console > Authentication > Settings > Authorized domains.'
          );
        } else if (code === 'auth/invalid-phone-number') {
          setAuthError('Número de celular inválido para envio de SMS internacional (+55).');
        } else if (code === 'auth/too-many-requests') {
          setAuthError('Muitas solicitações de SMS. Aguarde alguns minutos ou cadastre número de teste no Firebase Console.');
        } else if (code === 'auth/operation-not-allowed') {
          setAuthError('O provedor de Telefone está desativado no Firebase Console. Ative-o em Authentication > Sign-in method.');
        } else {
          setAuthError(`Erro no envio de SMS: ${err.message || 'Falha de comunicação com Firebase'}`);
        }
      } finally {
        setSendingSms(false);
      }
    } else {
      // Confirmação do código SMS real
      if (!confirmationResult) {
        setAuthError('Sessão de verificação expirada. Solicite um novo código SMS.');
        setSmsStep('number');
        return;
      }

      try {
        const cred = await confirmationResult.confirm(smsCode);
        loginUser(
          'phone',
          cred.user.phoneNumber || phoneNumber,
          name || cred.user.displayName || 'Passageiro Primavera',
          cred.user.uid
        );
        setSmsStep('number');
      } catch (err: any) {
        console.error('Erro ao verificar código SMS:', err);
        setAuthError('Código SMS incorreto ou expirado. Verifique os dígitos e tente novamente.');
      }
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isFirebaseConfigured) {
      setAuthError(
        'Firebase Authentication não configurado. Adicione as variáveis VITE_FIREBASE_* no .env para login Google real.'
      );
      return;
    }

    setLoadingGoogle(true);
    try {
      const firebaseUser = await signInWithGoogleReal();
      if (firebaseUser) {
        loginUser(
          'google',
          firebaseUser.email || googleEmail,
          firebaseUser.displayName || 'Usuário Google',
          firebaseUser.uid
        );
      }
    } catch (err: any) {
      console.error('Erro real do Firebase Google Auth:', err);
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Janela de login Google fechada antes da confirmação.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'Domínio deste aplicativo não está autorizado no Firebase Console. Adicione em Authentication > Settings > Authorized domains.'
        );
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('O provedor Google está desativado no Firebase Console. Ative em Authentication > Sign-in method.');
      } else {
        setAuthError(`Falha no login Google: ${err.message || 'Erro inesperado'}`);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleQuickSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setShowAuthModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header visual */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-6 text-white relative">
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Acesse sua Conta</h3>
              <p className="text-blue-100 text-xs">Primavera Mobilidade • Primavera do Leste MT</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 mt-5 bg-blue-900/40 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setAuthMethod('phone'); setSmsStep('number'); }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMethod === 'phone' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Telefone / SMS
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2 rounded-lg transition ${
                authMethod === 'google' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setAuthMethod('quick')}
              className={`flex-1 py-2 rounded-lg transition ${
                authMethod === 'quick' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:text-white'
              }`}
            >
              Trocar Perfil
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {smsStep === 'number' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Número do Celular (DDD 66)
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(66) 99999-9999"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Seu Nome (opcional)
                    </label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Alessandro Silva"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enviaremos um código SMS para o seu celular. Verificação segura via Firebase Authentication.
                  </p>

                  <div id="recaptcha-container"></div>

                  <button
                    type="submit"
                    disabled={sendingSms}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>{sendingSms ? 'Enviando código SMS...' : 'Receber Código SMS'}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                    <span>Código enviado para <strong>{phoneNumber}</strong></span>
                    <button
                      type="button"
                      onClick={() => setSmsStep('number')}
                      className="text-blue-600 font-bold underline"
                    >
                      Alterar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Código de Confirmação SMS
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="Ex: 4829 ou 123456"
                      required
                      className="w-full text-center tracking-widest text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar e Entrar</span>
                  </button>
                </>
              )}
            </form>
          )}

          {authMethod === 'google' && (
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Conta Google
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Autenticação Segura via Google</p>
                  <p>Acesso instantâneo sem necessidade de decorar senhas.</p>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingGoogle}
                className="w-full py-3.5 bg-slate-900 hover:bg-black disabled:opacity-70 text-white font-bold rounded-xl shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{loadingGoogle ? 'Abrindo autenticação Google...' : 'Entrar com Google'}</span>
              </button>
            </form>
          )}

          {authMethod === 'quick' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 font-medium mb-3">
                Selecione um usuário pré-configurado para testar:
              </p>
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleQuickSelect(u.id)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                      <p className="text-xs text-slate-500">{u.phone} • {u.role === 'admin' ? 'Administrador' : 'Passageiro'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100/60 px-2 py-1 rounded-md">
                    Selecionar
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dados criptografados • Primavera Mobilidade MT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
