import { useState, useEffect, useCallback } from 'react';
import {
  Wifi, WifiOff, QrCode, Loader2, Phone, CheckCircle2,
  AlertCircle, LogOut, RefreshCw,
} from 'lucide-react';
import {
  getWhatsAppStatus,
  getWhatsAppQRCode,
  disconnectWhatsApp,
} from '../services/api';

export default function WhatsAppManager() {
  const [status, setStatus] = useState<{
    connected: boolean;
    name?: string;
    number?: string;
  }>({ connected: false });
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWhatsAppStatus();
      if (res.success) setStatus(res.data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Poll status every 5s when showing QR code
  useEffect(() => {
    if (!qrcode) return;
    const interval = setInterval(async () => {
      const res = await getWhatsAppStatus();
      if (res.success && res.data.connected) {
        setStatus(res.data);
        setQrcode(null);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrcode]);

  const handleConnect = async () => {
    setQrLoading(true);
    try {
      const res = await getWhatsAppQRCode();
      if (res.success) {
        if (res.data.connected) {
          setStatus({ connected: true });
          setQrcode(null);
        } else if (res.data.qrcode) {
          setQrcode(res.data.qrcode);
        }
      }
    } catch {
      // ignore
    } finally {
      setQrLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Desconectar WhatsApp?')) return;
    await disconnectWhatsApp();
    setStatus({ connected: false });
    setQrcode(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">WhatsApp</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Conecte seu WhatsApp para enviar mensagens diretamente do painel
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              status.connected ? 'bg-success/10' : 'bg-gray-100'
            }`}>
              {status.connected
                ? <Wifi size={24} className="text-success" />
                : <WifiOff size={24} className="text-gray-400" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {status.connected ? 'Conectado' : 'Desconectado'}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  status.connected ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-success animate-pulse' : 'bg-gray-400'}`} />
                  {status.connected ? 'Online' : 'Offline'}
                </span>
              </div>
              {status.connected && status.name && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {status.name} • {status.number}
                </p>
              )}
              {!status.connected && (
                <p className="text-sm text-gray-400 mt-0.5">
                  Escaneie o QR Code para conectar
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {status.connected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 text-danger text-[13px] font-semibold hover:bg-danger/20 transition-colors cursor-pointer"
              >
                <LogOut size={15} /> Desconectar
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={qrLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {qrLoading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                Conectar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrcode && !status.connected && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 mb-4">
              <img src={qrcode} alt="QR Code WhatsApp" className="w-64 h-64" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 mb-1">Escaneie o QR Code</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Abra o WhatsApp no seu celular → Menu → Dispositivos conectados → Conectar dispositivo
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Aguardando conexão...
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Como funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <QrCode size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">1. Conecte</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Escaneie o QR Code com o WhatsApp</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
              <Phone size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">2. Mude o Status</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Altere o status do lead na tabela</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} className="text-success" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">3. Envio Automático</p>
              <p className="text-[12px] text-gray-400 mt-0.5">A mensagem é enviada direto pelo painel</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-2">
          <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-[12px] text-gray-600">
            <strong>Atenção:</strong> O WhatsApp precisa estar conectado ao celular. Se o celular desligar ou ficar sem internet, a conexão será perdida.
          </p>
        </div>
      </div>
    </div>
  );
}
