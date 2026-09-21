import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SeguradoraLink } from '@/lib/types';
import initialSeguradoras from '@/data/seguradoras.json';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'seguradoras.json');

function readSeguradoras(): SeguradoraLink[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Erro ao ler seguradoras.json:', error);
  }
  return initialSeguradoras as SeguradoraLink[];
}

function writeSeguradoras(data: SeguradoraLink[]): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar seguradoras.json:', error);
    return false;
  }
}

export async function GET() {
  const seguradoras = readSeguradoras();
  return NextResponse.json(seguradoras);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const seguradoras = readSeguradoras();

    if (payload.id) {
      const idx = seguradoras.findIndex((s) => s.id === payload.id);
      if (idx !== -1) {
        seguradoras[idx] = { ...seguradoras[idx], ...payload };
      } else {
        seguradoras.push(payload);
      }
    } else {
      const newItem: SeguradoraLink = {
        id: `seg-${Date.now()}`,
        nome: payload.nome,
        portalUrl: payload.portalUrl,
        tag: payload.tag || 'Parceira Credenciada',
        contatoSuporte: payload.contatoSuporte,
        notas: payload.notas,
        ordem: payload.ordem || seguradoras.length + 1,
        isActive: payload.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      seguradoras.push(newItem);
    }

    writeSeguradoras(seguradoras);
    return NextResponse.json({ success: true, seguradoras });
  } catch (error) {
    console.error('Erro no POST /api/seguradoras:', error);
    return NextResponse.json({ error: 'Falha ao salvar seguradora' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const seguradoras = readSeguradoras();
    const filtered = seguradoras.filter((s) => s.id !== id);
    writeSeguradoras(filtered);
    return NextResponse.json({ success: true, seguradoras: filtered });
  } catch (error) {
    console.error('Erro no DELETE /api/seguradoras:', error);
    return NextResponse.json({ error: 'Falha ao excluir seguradora' }, { status: 500 });
  }
}
