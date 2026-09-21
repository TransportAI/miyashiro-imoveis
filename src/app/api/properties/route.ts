import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/server';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'properties.json');

function getPropertiesFromFile(): Property[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Erro ao ler properties.json:', err);
  }
  return propertiesData as Property[];
}

function sanitizePropertyImages(property: Property): Property {
  const sanitized = { ...property };

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.map((img, idx) => {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        try {
          const matches = img.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `${sanitized.id || 'prop'}-img-${Date.now()}-${idx}.${ext}`;
            const targetDir = path.join(process.cwd(), 'public', 'images', 'properties');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(path.join(targetDir, fileName), buffer);
            return `/images/properties/${fileName}`;
          }
        } catch (e) {
          console.error('Erro ao converter imagem base64:', e);
        }
      }
      return img;
    });
  }

  if (Array.isArray(sanitized.virtualTourRooms)) {
    sanitized.virtualTourRooms = sanitized.virtualTourRooms.map((room, idx) => {
      if (typeof room.image === 'string' && room.image.startsWith('data:image/')) {
        try {
          const matches = room.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `tour-${sanitized.id || 'prop'}-room-${Date.now()}-${idx}.${ext}`;
            const targetDir = path.join(process.cwd(), 'public', 'images', 'tours');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(path.join(targetDir, fileName), buffer);
            return { ...room, image: `/images/tours/${fileName}` };
          }
        } catch (e) {
          console.error('Erro ao converter tour 360 base64:', e);
        }
      }
      return room;
    });
  }

  return sanitized;
}

function savePropertiesToFile(properties: Property[]) {
  try {
    const sanitized = properties.map(sanitizePropertyImages);
    fs.writeFileSync(dataFilePath, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch (e) {
    // Em ambientes serverless (Vercel) o disco é read-only
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Formatar campos do banco para o padrão camelCase da aplicação
        const formatted: Property[] = data.map((p: any) => ({
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
        return NextResponse.json(formatted);
      }
    } catch (e) {
      console.warn('Fallback para arquivo local de imóveis:', e);
    }
  }

  const properties = getPropertiesFromFile();
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  try {
    const rawProperty: Property = await request.json();
    const property = sanitizePropertyImages(rawProperty);

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from('properties').upsert({
          id: property.id,
          slug: property.slug,
          title: property.title,
          description: property.description || '',
          purpose: property.purpose,
          type: property.type,
          price: property.price || 0,
          iptu: property.iptu || 0,
          condo_fee: property.condoFee || 0,
          area_total: property.areaTotal || 0,
          area_built: property.areaBuilt || 0,
          bedrooms: property.bedrooms || 0,
          suites: property.suites || 0,
          bathrooms: property.bathrooms || 0,
          parking_spots: property.parkingSpots || 0,
          address: property.address || {},
          images: property.images || [],
          amenities: property.amenities || [],
          featured: !!property.featured,
          video_url: property.videoUrl || null,
          virtual_tour_url: property.virtualTourUrl || null,
          virtual_tour_rooms: property.virtualTourRooms || [],
          status: property.status || 'disponivel',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Aviso Supabase ao salvar:', e);
      }
    }

    // Persistência local (desenvolvimento / fallback)
    const currentProperties = getPropertiesFromFile();
    const existingIdx = currentProperties.findIndex(p => p.id.toLowerCase() === property.id.toLowerCase());
    if (existingIdx >= 0) {
      currentProperties[existingIdx] = {
        ...currentProperties[existingIdx],
        ...property,
      };
    } else {
      currentProperties.unshift(property);
    }
    savePropertiesToFile(currentProperties);

    return NextResponse.json({ success: true, property }, { status: 200 });
  } catch (err: any) {
    console.error('Erro ao salvar imóvel:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from('properties').delete().eq('id', id);
      } catch (e) {
        console.warn('Aviso Supabase ao deletar:', e);
      }
    }

    const currentProperties = getPropertiesFromFile();
    const filtered = currentProperties.filter(p => p.id.toLowerCase() !== id.toLowerCase());
    savePropertiesToFile(filtered);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
