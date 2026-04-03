import { useState } from 'react';
import { Category } from '../types';
import {
  Plus, Trash2, Pencil, Save, X, Sprout, Loader2,
  ToggleLeft, ToggleRight, FileText,
} from 'lucide-react';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi,
  addCategoryDocument, deleteCategoryDocument, seedCategories,
} from '../services/api';

interface CategoryManagerProps {
  categories: Category[];
  loading: boolean;
  onReload: () => void;
}

export default function CategoryManager({ categories, loading, onReload }: CategoryManagerProps) {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ label: '', icon: '📋' });
  const [newDoc, setNewDoc] = useState<{ catId: string; key: string; label: string; description: string; icon: string } | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('Isso vai popular as categorias padrão. Deseja continuar?')) return;
    setSeeding(true);
    await seedCategories();
    onReload();
    setSeeding(false);
  };

  const handleCreate = async () => {
    if (!newCat.label.trim()) return;
    const value = newCat.label.trim().toUpperCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    await createCategory({ value, label: newCat.label.trim(), icon: newCat.icon, order: categories.length });
    setNewCat({ label: '', icon: '📋' });
    onReload();
  };

  const handleSaveCat = async () => {
    if (!editingCat) return;
    await updateCategory(editingCat.id, { label: editingCat.label, icon: editingCat.icon, active: editingCat.active });
    setEditingCat(null);
    onReload();
  };

  const handleDeleteCat = async (cat: Category) => {
    if (!window.confirm(`Excluir categoria "${cat.label}"?`)) return;
    await deleteCategoryApi(cat.id);
    onReload();
  };

  const handleToggleActive = async (cat: Category) => {
    await updateCategory(cat.id, { active: !cat.active });
    onReload();
  };

  const handleAddDoc = async (catId: string) => {
    if (!newDoc || !newDoc.key.trim() || !newDoc.label.trim()) return;
    const cat = categories.find(c => c.id === catId);
    await addCategoryDocument(catId, {
      key: newDoc.key.trim(),
      label: newDoc.label.trim(),
      description: newDoc.description.trim(),
      icon: newDoc.icon,
      order: cat?.documents?.length || 0,
    });
    setNewDoc(null);
    onReload();
  };

  const handleDeleteDoc = async (docId: string, docLabel: string) => {
    if (!window.confirm(`Remover documento "${docLabel}"?`)) return;
    await deleteCategoryDocument(docId);
    onReload();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Categorias</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gerencie as categorias e documentos do app</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {seeding ? <Loader2 size={15} className="animate-spin" /> : <Sprout size={15} />}
          Seed Padrão
        </button>
      </div>

      {/* Add Category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Adicionar Categoria</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Nome</label>
            <input
              value={newCat.label}
              onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
              placeholder="Ex: Carteira Assinada"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20 focus:border-primary-light"
            />
          </div>
          <div className="w-20">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Ícone</label>
            <input
              value={newCat.icon}
              onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-primary-light animate-spin" />
          <span className="ml-3 text-sm text-gray-400">Carregando...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Nenhuma categoria encontrada. Clique em "Seed Padrão" para popular.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cat Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  {editingCat?.id === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editingCat.label}
                        onChange={(e) => setEditingCat({ ...editingCat, label: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                      />
                      <input
                        value={editingCat.icon}
                        onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                        className="w-12 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                      />
                      <button onClick={handleSaveCat} className="p-1.5 rounded-lg bg-success text-white hover:brightness-110 cursor-pointer">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingCat(null)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900">{cat.label}</h3>
                      <p className="text-[10px] text-gray-400 font-mono">{cat.value}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer
                      ${cat.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                  >
                    {cat.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {cat.active ? 'Ativa' : 'Inativa'}
                  </button>
                  <button
                    onClick={() => setEditingCat({ ...cat })}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Pencil size={13} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteCat(cat)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-danger/5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} className="text-danger" />
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText size={13} /> Documentos Necessários
                  </h4>
                  <button
                    onClick={() => setNewDoc({ catId: cat.id, key: '', label: '', description: '', icon: '📄' })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-semibold text-primary-light hover:bg-primary-light/5 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Documento
                  </button>
                </div>

                {/* New doc form */}
                {newDoc?.catId === cat.id && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Chave</label>
                        <input
                          value={newDoc.key}
                          onChange={(e) => setNewDoc({ ...newDoc, key: e.target.value })}
                          placeholder="Ex: RG"
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Label</label>
                        <input
                          value={newDoc.label}
                          onChange={(e) => setNewDoc({ ...newDoc, label: e.target.value })}
                          placeholder="Ex: Identidade"
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Descrição</label>
                        <input
                          value={newDoc.description}
                          onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                          placeholder="Frente e Verso"
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase">Ícone</label>
                        <input
                          value={newDoc.icon}
                          onChange={(e) => setNewDoc({ ...newDoc, icon: e.target.value })}
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddDoc(cat.id)}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setNewDoc(null)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Doc list */}
                {(!cat.documents || cat.documents.length === 0) ? (
                  <p className="text-xs text-gray-300 py-2">Nenhum documento configurado</p>
                ) : (
                  <div className="space-y-1.5">
                    {cat.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl group">
                        <span className="text-base">{doc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800">{doc.label}</p>
                          {doc.description && <p className="text-[11px] text-gray-400">{doc.description}</p>}
                          <p className="text-[9px] text-gray-300 font-mono">key: {doc.key}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.label)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} className="text-danger" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
