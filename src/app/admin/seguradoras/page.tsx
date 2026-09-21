'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ExternalLink, Plus, Edit, Trash2, X, Phone
} from 'lucide-react';
import { SeguradoraLink } from '@/lib/types';
import { showToast } from '@/components/Toast';

export default function AdminSeguradorasPage() {
  const [seguradoras, setSeguradoras] = useState<SeguradoraLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeguradoraLink | null>(null);

  const [nome, setNome] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [tag, setTag] = useState('Parceira Credenciada');
  const [contatoSuporte, setContatoSuporte] = useState('');
  const [notas, setNotas] = useState('');
  const [ordem, setOrdem] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSeguradoras = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seguradoras');
      if (res.ok) {
        const data = await res.json();
        setSeguradoras(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeguradoras();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setNome('');
    setPortalUrl('');
    setTag('Aprovação Imediata');
    setContatoSuporte('');
    setNotas('');
    setOrdem(seguradoras.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SeguradoraLink) => {
    setEditingItem(item);
    setNome(item.nome);
    setPortalUrl(item.portalUrl);
    setTag(item.tag || '');
    setContatoSuporte(item.contatoSuporte || '');
    setNotas(item.notas || '');
    setOrdem(item.ordem || 1);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !portalUrl.trim()) {
      alert('Nome da seguradora e URL do portal são obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<SeguradoraLink> = {
        id: editingItem?.id,
        nome,
        portalUrl,
        tag,
        contatoSuporte,
        notas,
        ordem: Number(ordem),
        isActive,
      };

      const res = await fetch('/api/seguradoras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSeguradoras();
        showToast('Seguradora salva com sucesso!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar seguradora.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nomeItem: string) => {
    if (!confirm(`Deseja remover a seguradora "${nomeItem}"?`)) return;

    try {
      const res = await fetch(`/api/seguradoras?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSeguradoras((prev) => prev.filter((s) => s.id !== id));
        showToast('Seguradora removida com sucesso!', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-urbanist tracking-tight">
            Portais de Seguradoras & Fiança
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Links rápidos para emissão de garantias locatícias, cotações de fiança e suporte das seguradoras parceiras
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#00873E]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Seguradora</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">
          Carregando seguradoras...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seguradoras.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 font-urbanist">
                        {item.nome}
                      </h3>
                      <span className="text-[11px] font-mono text-[#00873E] font-medium block">
                        {item.tag || 'Parceira Credenciada'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {item.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {item.notas && (
                  <p className="text-xs text-stone-600 mt-3 font-light">
                    {item.notas}
                  </p>
                )}

                {item.contatoSuporte && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100">
                    <Phone className="w-3.5 h-3.5 text-[#00873E]" />
                    <span>Suporte: {item.contatoSuporte}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <a
                  href={item.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#00873E]" />
                  <span>Acessar Portal</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.nome)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-emerald-50 transition cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-urbanist">
                {editingItem ? 'Editar Seguradora' : 'Cadastrar Nova Seguradora'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 mb-1 block">Nome da Seguradora / Parceira *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Porto Seguro Aluguel"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 mb-1 block">URL do Portal do Corretor / Emissão *</label>
                <input
                  type="url"
                  required
                  value={portalUrl}
                  onChange={(e) => setPortalUrl(e.target.value)}
                  placeholder="https://portaldocorretor..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Tag / Selo</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ex: Aprovação Rápida"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Telefone de Suporte</label>
                  <input
                    type="text"
                    value={contatoSuporte}
                    onChange={(e) => setContatoSuporte(e.target.value)}
                    placeholder="0800..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 mb-1 block">Notas / Orientações para a Equipe</label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instruções para a equipe de locação..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="segIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00873E] focus:ring-[#00873E] border-stone-300"
                />
                <label htmlFor="segIsActive" className="text-stone-700 font-medium cursor-pointer">
                  Seguradora Ativa
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold transition"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
