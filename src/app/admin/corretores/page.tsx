'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Users, Plus, Search, MessageCircle, Phone, Mail, 
  Edit, Trash2, X, Shield, Upload,
  ChevronDown, ChevronUp, KeyRound, Check
} from 'lucide-react';
import { Corretor } from '@/lib/types';
import { formatPhone } from '@/lib/masks';
import { compressImageFile } from '@/lib/media/fileCompressor';
import { 
  PERMISSION_GROUPS, 
  ALL_PERMISSIONS, 
  ROLE_PRESETS, 
  UserRolePreset, 
  SystemPermission 
} from '@/lib/permissions';
import { showToast } from '@/components/Toast';

function CorretorAvatar({ avatarUrl, nome }: { avatarUrl?: string; nome: string }) {
  const [hasError, setHasError] = useState(false);
  if (avatarUrl && !hasError) {
    return (
      <Image
        src={avatarUrl}
        alt={nome}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    );
  }
  return (
    <div className="w-full h-full bg-[#00873E] text-white font-bold text-lg flex items-center justify-center font-urbanist">
      {nome ? nome.charAt(0).toUpperCase() : 'C'}
    </div>
  );
}

export default function AdminCorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  
  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [creci, setCreci] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefoneComercial, setTelefoneComercial] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // RBAC
  const [role, setRole] = useState<UserRolePreset>('CORRETOR');
  const [permissions, setPermissions] = useState<string[]>(
    ROLE_PRESETS.find(p => p.id === 'CORRETOR')?.defaultPermissions || []
  );
  const [showPermissionsDetails, setShowPermissionsDetails] = useState<boolean>(false);
  
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const handleRoleSelect = (selectedRole: UserRolePreset) => {
    setRole(selectedRole);
    if (selectedRole !== 'CUSTOM') {
      const preset = ROLE_PRESETS.find(p => p.id === selectedRole);
      if (preset) {
        setPermissions([...preset.defaultPermissions]);
      }
    }
  };

  const handleTogglePermission = (permKey: string) => {
    setPermissions(prev => {
      const exists = prev.includes(permKey);
      const updated = exists ? prev.filter(p => p !== permKey) : [...prev, permKey];
      setRole('CUSTOM');
      return updated;
    });
  };

  const handleToggleModulePermissions = (modulePermissions: SystemPermission[]) => {
    const allSelected = modulePermissions.every(p => permissions.includes(p));
    setPermissions(prev => {
      let updated: string[];
      if (allSelected) {
        updated = prev.filter(p => !modulePermissions.includes(p as SystemPermission));
      } else {
        const missing = modulePermissions.filter(p => !prev.includes(p));
        updated = [...prev, ...missing];
      }
      setRole('CUSTOM');
      return updated;
    });
  };

  const handleSelectAllPermissions = () => {
    setPermissions([...ALL_PERMISSIONS]);
    setRole('ADMIN');
  };

  const handleClearAllPermissions = () => {
    setPermissions([]);
    setRole('CUSTOM');
  };

  const fetchCorretores = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/corretores');
      if (res.ok) {
        const data = await res.json();
        setCorretores(data);
      }
    } catch (err) {
      console.error('Erro ao carregar corretores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorretores();
  }, []);

  const openNewModal = () => {
    setEditingCorretor(null);
    setNome('');
    setEmail('');
    setCreci('');
    setWhatsapp('');
    setTelefoneComercial('(19) 3807-2200');
    setBio('');
    setAvatarUrl('');
    setPassword('');
    setIsActive(true);
    setRole('CORRETOR');
    setPermissions(ROLE_PRESETS.find(p => p.id === 'CORRETOR')?.defaultPermissions || []);
    setShowPermissionsDetails(false);
    setIsModalOpen(true);
  };

  const openEditModal = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    setNome(corretor.nome);
    setEmail(corretor.email);
    setCreci(corretor.creci);
    setWhatsapp(corretor.whatsapp);
    setTelefoneComercial(corretor.telefoneComercial || '');
    setBio(corretor.bio || '');
    setAvatarUrl(corretor.avatarUrl || '');
    setPassword('');
    setIsActive(corretor.isActive);
    const corretorRole = (corretor.role as UserRolePreset) || 'CORRETOR';
    setRole(corretorRole);
    setPermissions(
      Array.isArray(corretor.permissions) && corretor.permissions.length > 0
        ? corretor.permissions
        : (ROLE_PRESETS.find(p => p.id === corretorRole)?.defaultPermissions || [])
    );
    setShowPermissionsDetails(false);
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const result = await compressImageFile(file, 800, 0.85);
      setAvatarUrl(result.dataUrl);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !creci.trim() || !whatsapp.trim()) {
      alert('Preencha os campos obrigatórios (Nome, E-mail, CRECI e WhatsApp).');
      return;
    }

    try {
      setIsSaving(true);
      const payload: Partial<Corretor> = {
        id: editingCorretor?.id,
        nome,
        email,
        creci,
        whatsapp,
        telefoneComercial,
        bio,
        avatarUrl,
        isActive,
        role,
        permissions
      };

      const res = await fetch('/api/corretores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCorretores();
        showToast('Corretor salvo com sucesso!', 'success');
      } else {
        alert('Erro ao salvar corretor.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar corretor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nomeCorretor: string) => {
    if (!confirm(`Deseja realmente remover o corretor "${nomeCorretor}"?`)) return;

    try {
      const res = await fetch(`/api/corretores?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCorretores(prev => prev.filter(c => c.id !== id));
        showToast('Corretor removido com sucesso!', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCorretores = corretores.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.creci.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-urbanist tracking-tight">
            Gestão de Corretores & Equipe
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Cadastre corretores credenciados, dados de contato direto e permissões no sistema
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#00873E]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Corretor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CRECI ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
          />
        </div>

        <span className="text-xs text-stone-500 hidden sm:inline">
          Total de <strong>{filteredCorretores.length}</strong> corretores
        </span>
      </div>

      {/* Corretores Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">
          Carregando corretores da Miyashiro Imóveis...
        </div>
      ) : filteredCorretores.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
          Nenhum corretor encontrado com os termos pesquisados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCorretores.map((corretor) => {
            const cleanPhone = corretor.whatsapp.replace(/\D/g, '');
            return (
              <div 
                key={corretor.id}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <CorretorAvatar avatarUrl={corretor.avatarUrl} nome={corretor.nome} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-stone-900 font-urbanist truncate">
                          {corretor.nome}
                        </h3>
                        <span className="text-xs font-mono text-[#00873E] font-semibold block">
                          {corretor.creci}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      corretor.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                      {corretor.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {(() => {
                      const cRole = (corretor.role as UserRolePreset) || 'CORRETOR';
                      const preset = ROLE_PRESETS.find(p => p.id === cRole);
                      const permCount = Array.isArray(corretor.permissions) ? corretor.permissions.length : (preset?.defaultPermissions.length || 0);
                      return (
                        <>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${preset?.badgeClass || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                            {preset?.label || cRole}
                          </span>
                          <span className="text-[10px] text-stone-600 font-mono bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-200 flex items-center gap-1" title="Quantidade de permissões ativas">
                            <Shield className="w-2.5 h-2.5 text-[#00873E]" />
                            {permCount}/{ALL_PERMISSIONS.length} acessos
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  {corretor.bio && (
                    <p className="text-xs text-stone-600 line-clamp-2 mt-3 font-light">
                      {corretor.bio}
                    </p>
                  )}

                  <div className="space-y-1.5 pt-4 text-xs text-stone-600 border-t border-stone-100 mt-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{corretor.whatsapp}</span>
                    </div>

                    {corretor.telefoneComercial && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{corretor.telefoneComercial}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{corretor.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${corretor.nome}, contato via painel da Miyashiro Imóveis.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(corretor)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                      title="Editar Corretor"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(corretor.id, corretor.nome)}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-emerald-50 transition cursor-pointer"
                      title="Excluir Corretor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00873E] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-urbanist">
                    {editingCorretor ? 'Editar Corretor & Acessos' : 'Cadastrar Novo Corretor'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Defina dados profissionais e controle de acesso por funcionalidade
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar Preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Users className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-800 block">Foto de Perfil</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-medium cursor-pointer transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{compressing ? 'Otimizando...' : 'Enviar Foto'}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Registro CRECI *</label>
                  <input
                    type="text"
                    required
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                    placeholder="Ex: CRECI 45892-F"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">WhatsApp Direto *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    placeholder="(19) 99896-3398"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Telefone Comercial</label>
                  <input
                    type="text"
                    value={telefoneComercial}
                    onChange={(e) => setTelefoneComercial(e.target.value)}
                    placeholder="(19) 3807-2200"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">E-mail Profissional *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="corretor@miyashiroimoveis.com.br"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Perfil / Cargo</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleSelect(e.target.value as UserRolePreset)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                  >
                    {ROLE_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 mb-1 block">Bio / Especialidade</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Especialista em imóveis de alto padrão e condomínios fechados em Amparo."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#00873E]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="corretorIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00873E] focus:ring-[#00873E] border-stone-300"
                />
                <label htmlFor="corretorIsActive" className="text-stone-700 font-medium cursor-pointer">
                  Corretor Ativo
                </label>
              </div>

              {/* Acordeão de Permissões */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPermissionsDetails(!showPermissionsDetails)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-medium text-stone-700"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#00873E]" />
                    <span className="font-semibold">Permissões Específicas ({permissions.length}/{ALL_PERMISSIONS.length})</span>
                  </div>
                  {showPermissionsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPermissionsDetails && (
                  <div className="p-3 bg-stone-50/50 rounded-2xl border border-stone-200 space-y-3 max-h-60 overflow-y-auto">
                    {PERMISSION_GROUPS.map((group) => (
                      <div key={group.id} className="p-2.5 bg-white rounded-xl border border-stone-200 space-y-1.5">
                        <span className="font-bold text-[11px] text-stone-800 block">{group.moduleName}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {group.permissions.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions.includes(perm.key)}
                                onChange={() => handleTogglePermission(perm.key)}
                                className="w-3.5 h-3.5 rounded text-[#00873E] focus:ring-[#00873E]"
                              />
                              <span>{perm.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold shadow-md shadow-[#00873E]/20 transition"
                >
                  {isSaving ? 'Salvando...' : editingCorretor ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
