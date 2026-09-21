import React from 'react';
import { notFound } from 'next/navigation';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import EditPropertyForm from '@/components/EditPropertyForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditarImovelPage({ params }: PageProps) {
  const { id } = await params;
  const properties = propertiesData as Property[];
  const property = properties.find(p => p.id.toLowerCase() === id.toLowerCase());

  if (!property) {
    // If not in static data, create a baseline fallback
    const fallback: Property = {
      id: id.toLowerCase(),
      slug: `imovel-${id}`,
      title: 'Imóvel Cadastrado',
      description: '',
      purpose: 'venda',
      type: 'casa',
      price: 0,
      areaTotal: 0,
      areaBuilt: 0,
      bedrooms: 0,
      suites: 0,
      bathrooms: 0,
      parkingSpots: 0,
      address: {
        street: '',
        neighborhood: 'Centro',
        city: 'Amparo',
        state: 'SP',
        zipCode: '13900-000'
      },
      images: ['/images/properties/gallo_prop_1.jpg'],
      amenities: [],
      featured: false,
      status: 'disponivel',
      createdAt: new Date().toISOString()
    };
    return <EditPropertyForm initialProperty={fallback} />;
  }

  return <EditPropertyForm initialProperty={property} />;
}
