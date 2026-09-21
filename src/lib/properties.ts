import fs from 'fs';
import path from 'path';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/server';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'properties.json');

export function getProperties(): Property[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Erro ao ler properties.json do disco:', e);
  }
  return propertiesData as Property[];
}

export async function getPropertiesAsync(): Promise<Property[]> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          purpose: p.purpose,
          type: p.type,
          price: Number(p.price) || 0,
          iptu: Number(p.iptu) || 0,
          condoFee: Number(p.condo_fee) || 0,
          areaTotal: Number(p.area_total) || 0,
          areaBuilt: Number(p.area_built) || 0,
          bedrooms: p.bedrooms || 0,
          suites: p.suites || 0,
          bathrooms: p.bathrooms || 0,
          parkingSpots: p.parking_spots || 0,
          address: p.address || {},
          images: p.images || [],
          amenities: p.amenities || [],
          featured: !!p.featured,
          videoUrl: p.video_url,
          virtualTourUrl: p.virtual_tour_url,
          virtualTourRooms: p.virtual_tour_rooms || [],
          status: p.status || 'disponivel',
          createdAt: p.created_at,
        }));
      }
    } catch (e) {
      console.warn('Erro ao consultar Supabase de forma assíncrona:', e);
    }
  }

  return getProperties();
}

export function getPropertyBySlug(slug: string): Property | undefined {
  const all = getProperties();
  return all.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}

export function getPropertyById(id: string): Property | undefined {
  const all = getProperties();
  return all.find(p => p.id.toLowerCase() === id.toLowerCase());
}
