import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Purpose, PropertyType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('pt-BR')} m²`;
}

export function getPurposeLabel(purpose: Purpose | string): string {
  switch (purpose) {
    case 'venda':
      return 'Venda';
    case 'aluguel':
      return 'Locação';
    default:
      return 'Disponível';
  }
}

export function getTypeLabel(type: PropertyType | string): string {
  switch (type) {
    case 'casa':
      return 'Casa';
    case 'apartamento':
      return 'Apartamento';
    case 'chacara':
      return 'Chácara & Sítio';
    case 'terreno':
      return 'Terreno';
    case 'comercial':
      return 'Comercial';
    default:
      return 'Imóvel';
  }
}

export function buildWhatsAppPropertyLink(property: {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  purpose: string;
  price: number;
  slug: string;
}): string {
  const phone = '5519993673949';
  const priceFormatted = formatCurrency(property.price);
  const msg = `Olá! Estou no site da Miyashiro Imóveis e gostaria de informações e agendamento de visita para o imóvel:\n\n📍 ${property.title}\n🔖 Ref: ${property.id.toUpperCase()}\n🏘️ ${property.neighborhood} - ${property.city}\n💰 Valor (${getPurposeLabel(property.purpose)}): ${priceFormatted}\n\n🔗 https://miyashiroimoveis.com.br/imovel/${property.slug}\n\nPoderiam me atender?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
