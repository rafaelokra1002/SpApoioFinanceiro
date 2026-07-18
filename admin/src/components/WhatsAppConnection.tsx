import { useState, useEffect } from 'react';
import { Wifi, WifiOff, QrCode, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { getWhatsAppStatus, getWhatsAppQRCode, disconnectWhatsApp } from '../services/api';

/** Painel de conexão do WhatsApp (status, conectar via QR, desconectar). */
export default function WhatsAppConnection() {
  const [status, setStatus] = useState<{ connected: boolean; name?: string; number?: string }>({ connected: false });
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    getWhatsAppStatus()
      .then((res) => { if (res.success) setStatus(res.data); })
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  // Enquanto o QR está na tela, verifica a conexão a cada 5s.
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

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await getWhatsAppStatus();
      if (res.success) setStatus(res.data);
    } finally {
      setLoading(false);
    }
  };

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
        } else {
          alert('QR Code não disponível no momento. Tente novamente em alguns segundos.');
        }
      } else {
        alert(res.error || 'Erro ao gerar QR Code');
      }
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
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
          <Wifi size={20} className="text-brand-deep" />
        </span>
        <div>
          <h2 className="text-[16px] font-bold text-ink">WhatsApp para Clientes</h2>
          <p className="text-[12.5px] text-muted">Envie mensagens diretamente aos seus clientes pelo seu WhatsApp</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas/60 p-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${status.connected ? 'bg-success/10' : 'bg-line'}`}>
            {status.connected ? <Wifi size={20} className="text-success" /> : <WifiOff size={20} className="text-subtle" />}
          </span>
          <div>
            <p className="text-[15px] font-bold text-ink">{status.connected ? 'Conectado' : 'Desconectado'}</p>
            <p className="text-[12.5px] text-subtle">
              {status.connected
                ? (status.name ? `${status.name} • ${status.number}` : 'WhatsApp online')
                : 'Clique em "Conectar WhatsApp" para escanear o QR Code.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkStatus}
            disabled={loading}
            title="Atualizar status"
            className="rounded-xl border border-line p-2.5 transition-colors hover:bg-surface disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={`text-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
          {status.connected ? (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/20 cursor-pointer"
            >
              <LogOut size={15} /> Desconectar
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={qrLoading}
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {qrLoading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
              Conectar WhatsApp
            </button>
          )}
        </div>
      </div>

      {qrcode && !status.connected && (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-line p-6">
          <div className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-lg">
            <img src={qrcode} alt="QR Code WhatsApp" className="h-56 w-56" />
          </div>
          <h3 className="text-[15px] font-bold text-ink">Escaneie o QR Code</h3>
          <p className="mt-0.5 max-w-sm text-center text-[12.5px] text-subtle">
            Abra o WhatsApp no celular → Menu → Dispositivos conectados → Conectar dispositivo
          </p>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-subtle">
            <Loader2 size={12} className="animate-spin" /> Aguardando conexão...
          </div>
        </div>
      )}
    </section>
  );
}
