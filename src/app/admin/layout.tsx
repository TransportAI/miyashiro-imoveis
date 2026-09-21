'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Building2, PlusCircle, Users, Calculator, 
  ExternalLink, LogOut, ShieldCheck, ChevronRight, Menu, X, History, Bell,
  UserCheck, FileText
} from 'lucide-react';
import leadsData from '@/data/leads.json';
import AdminMobileTabBar from '@/components/admin/AdminMobileTabBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao efetuar logout:', err);
    }
    // Remove qualquer cookie localmente e redireciona limpando a sessão
    document.cookie = 'gallo_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'miyashiro_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  useEffect(() => {
    const checkLeads = () => {
      try {
        const stored = localStorage.getItem('gallo_leads');
        const list = stored ? JSON.parse(stored) : (leadsData || []);
        const count = Array.isArray(list) 
          ? list.filter((l: any) => l.status === 'novo').length 
          : 0;
        setNewLeadsCount(count);
      } catch (e) {
        setNewLeadsCount(0);
      }
    };

    checkLeads();
    window.addEventListener('storage', checkLeads);
    window.addEventListener('gallo_leads_change', checkLeads);
    return () => {
      window.removeEventListener('storage', checkLeads);
      window.removeEventListener('gallo_leads_change', checkLeads);
    };
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Visão Geral', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Imóveis', href: '/admin/imoveis', icon: Building2 },
    { name: 'Novo Imóvel', href: '/admin/imoveis/novo', icon: PlusCircle },
    { name: 'Leads & CRM', href: '/admin/leads', icon: Users },
    { name: 'Contratos', href: '/admin/contratos', icon: FileText },
    { name: 'Corretores', href: '/admin/corretores', icon: UserCheck },
    { name: 'Financiamento', href: '/admin/financiamento', icon: Calculator },
    { name: 'Seguradoras', href: '/admin/seguradoras', icon: ShieldCheck },
    { name: 'Auditoria', href: '/admin/auditoria', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row w-full max-w-full overflow-x-hidden text-neutral-900 font-sans">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white text-neutral-900 px-4 py-3 border-b border-neutral-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative w-28 h-7">
            <Image
              src="/images/brand/logo.png"
              alt="Miyashiro Imóveis"
              fill
              className="object-contain object-left"
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Ateliê</span>
        </div>

        <div className="flex items-center gap-2">
          {newLeadsCount > 0 && (
            <Link
              href="/admin/leads"
              className="relative p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition"
              title={`${newLeadsCount} novos leads aguardando`}
            >
              <Bell className="w-4 h-4 text-[#00873E]" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00873E]"></span>
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg bg-neutral-100 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sair do Painel"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition"
            aria-label="Abrir Menu Administrativo"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Light Boutique + Mobile Drawer) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-60 bg-white text-neutral-600 flex flex-col justify-between shrink-0 p-5 border-r border-neutral-200/80 transition-transform duration-200 ease-out
        ${mobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand header */}
          <div className="pb-5 mb-5 border-b border-neutral-100">
            <Link href="/" target="_blank" className="block group">
              <div className="flex items-center gap-3">
                <div className="relative w-36 h-9">
                  <Image
                    src="/images/brand/logo.png"
                    alt="Miyashiro Imóveis"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-neutral-400">
                <ShieldCheck className="w-3 h-3 text-[#00873E]" />
                <span>CRECI 155957F • Amparo/SP</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isLeads = item.href === '/admin/leads';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#00873E] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isLeads && newLeadsCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white text-[#00873E]' : 'bg-[#00873E] text-white'
                    }`}>
                      {newLeadsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-100 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ver Site Público</span>
            </span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area: Pure White Canvas with subtle gray background */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 overflow-y-auto w-full max-w-full">
        <div className="w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Admin Mobile Bottom TabBar */}
      <AdminMobileTabBar newLeadsCount={newLeadsCount} />
    </div>
  );
}
