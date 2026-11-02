import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  QrCode,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ride } from '../types';

interface PixPaymentModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  ride,
  isOpen,
  onClose,
  onPaymentConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const pixKeyMock = `00020126580014br.gov.bcb.pix0136primavera-mobilidade-${ride.id}520400005303986540${ride.price.toFixed(2)}5802BR5920Primavera Mobilidade6019Primavera do Leste62070503***6304`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKeyMock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00B0FF', '#00E676', '#1E88E5'],
      });
    } catch {}
    setTimeout(() => {
      onPaymentConfirmed();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pagar com Pix</h3>
              <p className="text-emerald-100 text-xs">Aprovação imediata sem taxas</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Valor Total da Corrida
            </span>
            <span className="text-3xl font-extrabold text-slate-900">
              R$ {ride.price.toFixed(2).replace('.', ',')}
            </span>
            {ride.isNightSurcharge && (
              <span className="inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Inclui 20% Adicional Noturno
              </span>
            )}
          </div>

          {/* QR Code Graphic Simulation */}
          <div className="relative w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-teal-500/40 flex items-center justify-center shadow-inner group">
            {confirmed ? (
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-emerald-700">Pagamento Confirmado!</p>
              </div>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Simulated QR blocks */}
                <rect width="100" height="100" fill="#ffffff" />
                {/* Top left corner */}
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" rx="2" />
                <rect x="19" y="19" width="7" height="7" fill="#0f172a" />
                {/* Top right corner */}
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" rx="2" />
                <rect x="74" y="19" width="7" height="7" fill="#0f172a" />
                {/* Bottom left corner */}
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" rx="2" />
                <rect x="19" y="74" width="7" height="7" fill="#0f172a" />
                {/* Central Pix badge */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill="#0d9488" />
                {/* Dots in between */}
                <rect x="40" y="15" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="15" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="27" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="27" width="6" height="6" fill="#0f172a" />
                <rect x="15" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="25" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="45" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="65" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="65" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="65" y="65" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="75" width="6" height="6" fill="#0f172a" />
              </svg>
            )}
          </div>

          {/* Pix Copia e Cola */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Código Pix Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copiar Código Pix (Copia e Cola)</span>
                </>
              )}
            </button>

            <button
              onClick={handleConfirm}
              disabled={confirmed}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Simular Pagamento Confirmado</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Banco Central do Brasil • Sistema Pix Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
