import { useEffect, useState } from 'react';
import { Check, Loader2, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { City } from '../types';
import { createCity, deleteCity, fetchCities, seedCities, updateCity } from '../services/api';
import { notify } from './Notice';

/** Lista de reserva usada só no preview (DEV) quando o backend está offline. */
const DEV_FALLBACK: City[] = [
  'Camaçari', 'Dias d\'Ávila', 'Catu', 'Abrantes', 'Lauro de Freitas',
  'Feira de Santana', 'São Sebastião do Passé', 'Mata de São João', 'Pojuca',
].map((nome, i) => ({ id: `dev-${i}`, nome, uf: 'BA', order: i, active: true }));

export default function CityManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [novoUf, setNovoUf] = useState('BA');
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editUf, setEditUf] = useState('');

  const load = async () => {
    try {
      const res = await fetchCities();
      if (res.success) setCities(res.data);
    } catch {
      if (import.meta.env.DEV) {
        setCities(DEV_FALLBACK);
        console.warn('[dev] backend offline — cidades de exemplo');
      } else {
        notify('Não foi possível carregar as cidades.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const adicionar = async () => {
    const nome = novoNome.trim();
    if (!nome) return;
    setSalvandoNovo(true);
    const uf = novoUf.trim().toUpperCase() || 'BA';
    try {
      const res = await createCity({ nome, uf, order: cities.length });
      if (res.success) {
        setCities((prev) => [...prev, res.data]);
        setNovoNome('');
        setNovoUf('BA');
      } else {
        notify(res.error || 'Não foi possível adicionar a cidade.', 'error');
      }
    } catch {
      if (import.meta.env.DEV) {
        setCities((prev) => [...prev, { id: crypto.randomUUID(), nome, uf, order: prev.length, active: true }]);
        setNovoNome('');
        setNovoUf('BA');
      } else {
        notify('Não foi possível conectar ao servidor.', 'error');
      }
    } finally {
      setSalvandoNovo(false);
    }
  };

  const iniciarEdicao = (c: City) => {
    setEditId(c.id);
    setEditNome(c.nome);
    setEditUf(c.uf);
  };

  const salvarEdicao = async () => {
    const nome = editNome.trim();
    if (!nome || !editId) return;
    const uf = editUf.trim().toUpperCase() || 'BA';
    setCities((prev) => prev.map((c) => (c.id === editId ? { ...c, nome, uf } : c)));
    const id = editId;
    setEditId(null);
    try {
      const res = await updateCity(id, { nome, uf });
      if (!res.success) {
        notify(res.error || 'Não foi possível salvar a cidade.', 'error');
        load();
      }
    } catch {
      if (!import.meta.env.DEV) { notify('Não foi possível conectar ao servidor.', 'error'); load(); }
    }
  };

  const alternarAtivo = async (c: City) => {
    const active = !c.active;
    setCities((prev) => prev.map((x) => (x.id === c.id ? { ...x, active } : x)));
    try {
      const res = await updateCity(c.id, { active });
      if (!res.success) { notify(res.error || 'Não foi possível atualizar.', 'error'); load(); }
    } catch {
      if (!import.meta.env.DEV) { notify('Não foi possível conectar ao servidor.', 'error'); load(); }
    }
  };

  const remover = async (c: City) => {
    if (!window.confirm(`Excluir a cidade "${c.nome} - ${c.uf}"?`)) return;
    setCities((prev) => prev.filter((x) => x.id !== c.id));
    try {
      const res = await deleteCity(c.id);
      if (!res.success) { notify(res.error || 'Não foi possível excluir.', 'error'); load(); }
    } catch {
      if (!import.meta.env.DEV) { notify('Não foi possível conectar ao servidor.', 'error'); load(); }
    }
  };

  const importar = async () => {
    try {
      const res = await seedCities();
      if (res.success) { notify(res.message || 'Cidades importadas.', 'success'); load(); }
      else notify(res.error || 'Não foi possível importar.', 'error');
    } catch {
      notify('Não foi possível conectar ao servidor.', 'error');
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <MapPin size={20} className="text-brand-deep" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-[22px] font-bold leading-tight text-ink">Cidades atendidas</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            As cidades que aparecem na tela de solicitação do cliente (app). Adicione, edite ou remova.
          </p>
        </div>
      </div>

      {/* Adicionar */}
      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-[12px] font-medium text-muted">Cidade</label>
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); }}
            placeholder="Ex.: Salvador"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <div className="w-full sm:w-24">
          <label className="mb-1 block text-[12px] font-medium text-muted">UF</label>
          <input
            value={novoUf}
            onChange={(e) => setNovoUf(e.target.value.toUpperCase().slice(0, 2))}
            onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); }}
            placeholder="BA"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] uppercase text-ink
              placeholder:text-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <button
          onClick={adicionar}
          disabled={salvandoNovo || !novoNome.trim()}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white
            transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvandoNovo ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Adicionar
        </button>
      </div>

      {/* Lista */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : cities.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-[13px] text-muted">Nenhuma cidade cadastrada.</p>
            <button
              onClick={importar}
              className="rounded-xl bg-brand/10 px-4 py-2 text-[12.5px] font-semibold text-brand-deep
                transition-colors hover:bg-brand/20 cursor-pointer"
            >
              Importar lista atual do app
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {cities.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                {editId === c.id ? (
                  <>
                    <input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') salvarEdicao(); if (e.key === 'Escape') setEditId(null); }}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13.5px] text-ink
                        focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                    />
                    <input
                      value={editUf}
                      onChange={(e) => setEditUf(e.target.value.toUpperCase().slice(0, 2))}
                      onKeyDown={(e) => { if (e.key === 'Enter') salvarEdicao(); if (e.key === 'Escape') setEditId(null); }}
                      className="w-14 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13.5px] uppercase text-ink
                        focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                    />
                    <button
                      onClick={salvarEdicao}
                      title="Salvar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success
                        transition-colors hover:bg-success/20 cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      title="Cancelar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle
                        transition-colors hover:bg-line cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <MapPin size={16} className="shrink-0 text-subtle" />
                    <span className={`min-w-0 flex-1 truncate text-[14px] font-medium ${c.active ? 'text-ink' : 'text-subtle line-through'}`}>
                      {c.nome} - {c.uf}
                    </span>
                    <button
                      onClick={() => alternarAtivo(c)}
                      title={c.active ? 'Ativa — clique para ocultar no app' : 'Oculta — clique para exibir no app'}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer
                        ${c.active ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-line text-muted hover:bg-line/70'}`}
                    >
                      {c.active ? 'Ativa' : 'Oculta'}
                    </button>
                    <button
                      onClick={() => iniciarEdicao(c)}
                      title="Editar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle
                        transition-colors hover:bg-line hover:text-ink cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => remover(c)}
                      title="Excluir"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle
                        transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
