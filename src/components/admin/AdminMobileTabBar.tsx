'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  Users, 
  History 
} from 'lucide-react';

interface AdminMobileTabBarProps {
  newLeadsCount?: number;
}

export default function AdminMobileTabBar({ newLeadsCount = 0 }: AdminMobileTabBarProps) {
  const pathname = usePathname();

  // Não exibe na tela de login
  if (pathname === '/admin/login' || pathname === '/login') {
    return null;
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Painel',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/admin/dashboard' || pathname === '/admin',
    },
    {
      id: 'imoveis',
      name: 'Imóveis',
      href: '/admin/imoveis',
      icon: Building2,
      isActive: pathname === '/admin/imoveis',
    },
    {
      id: 'novo',
      name: 'Novo',
      href: '/admin/imoveis/novo',
      icon: PlusCircle,
      isActive: pathname === '/admin/imoveis/novo',
      isCenter: true,
    },
    {
      id: 'leads',
      name: 'Leads',
      href: '/admin/leads',
      icon: Users,
      isActive: pathname === '/admin/leads',
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
    },
    {
      id: 'auditoria',
      name: 'Auditoria',
      href: '/admin/auditoria',
      icon: History,
      isActive: pathname === '/admin/auditoria',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-50 flex justify-center pointer-events-auto">
      <nav
        aria-label="Navegação do Painel Administrativo"
        className="w-full max-w-md bg-[#1E1412]/95 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-3xl p-1.5 flex items-center justify-around"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={true}
                className="relative -top-2 flex flex-col items-center justify-center group"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-transform duration-200 active:scale-95 ${
                    active
                      ? 'bg-[#00873E] text-white shadow-emerald-900/40'
                      : 'bg-[#00873E] hover:bg-[#15803d] text-white shadow-emerald-900/40'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight font-semibold text-amber-400">
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={true}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {active && (
                <span className="absolute inset-0 bg-white/[0.08] rounded-2xl -z-10 transition-all duration-200" />
              )}

              {active && (
                <span className="absolute -top-1 w-5 h-1 bg-[#00873E] rounded-full" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active
                      ? 'scale-110 text-amber-400 stroke-[2.3]'
                      : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
