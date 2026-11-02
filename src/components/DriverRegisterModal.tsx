import React, { useState } from 'react';
import {
  Car,
  CheckCircle,
  FileCheck,
  FileText,
  IdCard,
  ShieldCheck,
  Upload,
  User,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DriverRegisterModal: React.FC = () => {
  const { showRegisterDriverModal, setShowRegisterDriverModal, registerDriver } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('(66) 99');
  const [cnhNumber, setCnhNumber] = useState('');
  const [cnhCategory, setCnhCategory] = useState('B');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2023');
  const [vehicleColor, setVehicleColor] = useState('Prata');
  const [vehicleCategory, setVehicleCategory] = useState<'Comum' | 'Conforto' | 'Moto'>('Comum');
  const [pixKey, setPixKey] = useState('');

  const [cnhUploaded, setCnhUploaded] = useState(false);
  const [crlvUploaded, setCrlvUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!showRegisterDriverModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerDriver({
      name,
      phone,
      cnhNumber,
      cnhCategory,
      vehicleModel,
      vehiclePlate: vehiclePlate.toUpperCase(),
      vehicleYear,
      vehicleColor,
      vehicleCategory,
      pixKey: pixKey || phone,
    });
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setShowRegisterDriverModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Cadastro de Motorista Parceiro</h3>
              <p className="text-blue-100 text-xs">Primavera do Leste – MT • Primavera Mobilidade</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800">Cadastro Enviado com Sucesso!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Obrigado, <strong>{name}</strong>! Seus documentos e os dados do veículo (<strong>{vehicleModel}</strong> • {vehiclePlate.toUpperCase()}) foram registrados e estão em análise pela nossa equipe.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Aprovação Manual Obrigatória:
              </p>
              <p>
                O administrador do sistema em Primavera do Leste analisará sua CNH e CRLV. Você pode testar a aprovação imediata acessando o painel de <strong>Administrador</strong> na barra superior.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                <User className="w-4 h-4" /> 1. Dados Pessoais e CNH
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Ferreira da Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(66) 99888-7766"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número da CNH</label>
                  <input
                    type="text"
                    required
                    value={cnhNumber}
                    onChange={(e) => setCnhNumber(e.target.value)}
                    placeholder="Ex: 05819284759"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria da CNH</label>
                  <select
                    value={cnhCategory}
                    onChange={(e) => setCnhCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                  >
                    <option value="B">Categoria B (Automóvel)</option>
                    <option value="AB">Categoria AB (Carro e Moto)</option>
                    <option value="D">Categoria D (Profissional)</option>
                    <option value="E">Categoria E (Pesados)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                <Car className="w-4 h-4" /> 2. Dados do Veículo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modelo do Carro</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Ex: Chevrolet Onix 1.0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placa (Mercosul)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="RRA-4B90"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ano</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="2022"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cor</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="Prata"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria de Serviço</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                  >
                    <option value="Comum">Primavera Comum (Padrão)</option>
                    <option value="Conforto">Primavera Conforto</option>
                    <option value="Moto">Primavera Moto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Pix Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                <CreditCard className="w-4 h-4" /> 3. Chave Pix para Recebimento
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chave Pix do Motorista</label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, Telefone, E-mail ou Chave Aleatória"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Seus ganhos das corridas serão transferidos diretamente para esta chave Pix.
                </p>
              </div>
            </div>

            {/* Document Uploads Simulation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                <FileCheck className="w-4 h-4" /> 4. Comprovantes (CNH e CRLV)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setCnhUploaded(!cnhUploaded)}
                  className={`p-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition flex items-center gap-3 ${
                    cnhUploaded ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${cnhUploaded ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <IdCard className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">{cnhUploaded ? 'CNH Anexada ✓' : 'Anexar Foto da CNH'}</p>
                    <p className="text-slate-500">{cnhUploaded ? 'cnh_digital_valida.pdf' : 'Clique para simular upload'}</p>
                  </div>
                </div>

                <div
                  onClick={() => setCrlvUploaded(!crlvUploaded)}
                  className={`p-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition flex items-center gap-3 ${
                    crlvUploaded ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${crlvUploaded ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">{crlvUploaded ? 'CRLV Anexado ✓' : 'Anexar Documento CRLV'}</p>
                    <p className="text-slate-500">{crlvUploaded ? 'crlv_veiculo_2024.pdf' : 'Clique para simular upload'}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>Enviar para Aprovação do Administrador</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
