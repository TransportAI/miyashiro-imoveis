import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Corretor } from '@/lib/types';
import initialCorretores from '@/data/corretores.json';
import { createAdminClient } from '@/lib/supabase/server';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'corretores.json');

function readCorretores(): Corretor[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Erro ao ler corretores.json:', error);
  }
  return initialCorretores as Corretor[];
}

function writeCorretores(data: Corretor[]): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    // Vercel serverless read-only
    return false;
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('corretores')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted: Corretor[] = data.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          email: c.email,
          creci: c.creci,
          whatsapp: c.whatsapp,
          telefoneComercial: c.telefone_comercial || '(19) 3807-2200',
          avatarUrl: c.avatar_url || '/images/brand/logo.png',
          bio: c.bio || '',
          isActive: c.is_active !== false,
          role: c.role || 'CORRETOR',
          permissions: c.permissions || [],
          createdAt: c.created_at,
        }));
        return NextResponse.json(formatted);
      }
    } catch (e) {
      console.warn('Fallback corretores:', e);
    }
  }

  const corretores = readCorretores();
  return NextResponse.json(corretores);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const supabase = createAdminClient();

    if (supabase) {
      try {
        await supabase.from('corretores').upsert({
          nome: payload.nome,
          email: payload.email,
          creci: payload.creci,
          whatsapp: payload.whatsapp,
          telefone_comercial: payload.telefoneComercial || null,
          avatar_url: payload.avatarUrl || null,
          bio: payload.bio || null,
          role: payload.role || 'CORRETOR',
          permissions: payload.permissions || [],
          is_active: payload.isActive !== false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      } catch (e) {
        console.warn('Aviso Supabase corretor upsert:', e);
      }
    }

    const corretores = readCorretores();
    if (payload.id) {
      const idx = corretores.findIndex((c) => c.id === payload.id);
      if (idx !== -1) {
        corretores[idx] = { ...corretores[idx], ...payload };
      } else {
        corretores.push(payload);
      }
    } else {
      const newCorretor: Corretor = {
        id: `corretor-${Date.now()}`,
        nome: payload.nome,
        email: payload.email,
        creci: payload.creci,
        whatsapp: payload.whatsapp,
        telefoneComercial: payload.telefoneComercial || '(19) 3807-2200',
        avatarUrl: payload.avatarUrl || '/images/brand/logo.png',
        bio: payload.bio || '',
        isActive: payload.isActive !== false,
        role: payload.role || 'CORRETOR',
        permissions: payload.permissions || [],
        createdAt: new Date().toISOString(),
      };
      corretores.push(newCorretor);
    }

    writeCorretores(corretores);
    return NextResponse.json({ success: true, corretores });
  } catch (error) {
    console.error('Erro no POST /api/corretores:', error);
    return NextResponse.json({ error: 'Falha ao salvar corretor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID do corretor é obrigatório' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from('corretores').delete().eq('id', id);
      } catch (e) {
        console.warn('Aviso Supabase corretor delete:', e);
      }
    }

    const corretores = readCorretores();
    const filtered = corretores.filter((c) => c.id !== id);
    writeCorretores(filtered);
    return NextResponse.json({ success: true, corretores: filtered });
  } catch (error) {
    console.error('Erro no DELETE /api/corretores:', error);
    return NextResponse.json({ error: 'Falha ao excluir corretor' }, { status: 500 });
  }
}
