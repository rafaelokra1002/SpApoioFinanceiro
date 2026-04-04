import { useState, useEffect, useCallback } from 'react';
import {
  Wifi, WifiOff, QrCode, Loader2, Phone, CheckCircle2,
  AlertCircle, LogOut, RefreshCw, Save, MessageSquare,
} from 'lucide-react';
import {
  getWhatsAppStatus,
  getWhatsAppQRCode,
  disconnectWhatsApp,
  fetchMessageTemplates,
  upsertMessageTemplate,
  seedMessageTemplates,
} from '../services/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  APROVADO: { label: 'Aprovado', color: 'bg-success/10 text-success' },
  RECUSADO: { label: 'Recusado', color: 'bg-danger/10 text-danger' },
};

const VARIABLES = ['{{nome}}', '{{valor}}', '{{telefone}}', '{{cidade}}', '{{email}}', '{{cpf}}', '{{status}}'];

export default function WhatsAppManager() {
  const [status, setStatus] = useState<{
    connected: boolean;
    name?: string;
    number?: string;
  }>({ connected: false });
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

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
    fetchMessageTemplates().then(res => {
      if (res.success && res.data) {
        const map: Record<string, string> = {};
        for (const t of res.data) map[t.status] = t.content;
        setTemplates(map);
      }
    }).catch(() => {});
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

  const handleSaveTemplate = async (statusKey: string) => {
    const content = templates[statusKey];
    if (!content?.trim()) return;
    setSaving(statusKey);
    try {
      const res = await upsertMessageTemplate(statusKey, content);
      if (res.success) {
        setSaved(statusKey);
        setTimeout(() => setSaved(null), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
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

      {/* Message Templates Editor */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Templates de Mensagem</h3>
            <p className="text-xs text-gray-400">Edite as mensagens enviadas para cada status</p>
          </div>
          {!Object.values(templates).some(v => v?.trim()) && (
            <button
              onClick={async () => {
                const res = await seedMessageTemplates();
                if (res.success && res.data) {
                  const map: Record<string, string> = {};
                  for (const t of res.data) map[t.status] = t.content;
                  setTemplates(map);
                }
              }}
              className="ml-auto px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              Carregar exemplos
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5 p-3 bg-gray-50 rounded-xl">
          <span className="text-[11px] text-gray-500 font-medium mr-1 self-center">Variáveis:</span>
          {VARIABLES.map(v => (
            <span key={v} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] font-mono text-primary">
              {v}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
            <div key={key} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${color}`}>
                  {label}
                </span>
                <button
                  onClick={() => handleSaveTemplate(key)}
                  disabled={saving === key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving === key ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : saved === key ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Save size={13} />
                  )}
                  {saved === key ? 'Salvo!' : 'Salvar'}
                </button>
              </div>
              <textarea
                value={templates[key] || ''}
                onChange={e => setTemplates(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Mensagem para leads com status ${label}...\nUse {{nome}}, {{valor}} etc.`}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
              />
            </div>
          ))}
        </div>
      </div>

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
