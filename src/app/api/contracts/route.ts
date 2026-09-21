import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Contract } from '@/lib/types/contract';
import initialContracts from '@/data/contracts.json';
import { createAdminClient } from '@/lib/supabase/server';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'contracts.json');

function readContracts(): Contract[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Erro ao ler contracts.json:', error);
  }
  return initialContracts as Contract[];
}

function writeContracts(contracts: Contract[]): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(contracts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar contracts.json:', error);
    return false;
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      let queryResult = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryResult.error) {
        queryResult = await supabase
          .from('contratos')
          .select('*')
          .order('created_at', { ascending: false });
      }

      const { data, error } = queryResult;

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: Contract[] = data.map((c: any) => ({
          id: c.id,
          code: c.code,
          propertyId: c.property_id,
          propertyTitle: c.property_title,
          propertyAddress: c.property_address || '',
          propertyCoverImage: c.property_cover_image || undefined,
          modalidade: c.modalidade || c.type,
          type: c.type || c.modalidade || 'locacao_seguro_fianca',
          status: c.status,
          startDate: c.start_date,
          endDate: c.end_date,
          closedAt: c.closed_at || undefined,
          closeReason: c.close_reason || undefined,
          renewalAuto: !!c.renewal_auto,
          financial: c.financial || { guaranteeType: 'sem_garantia' },
          parties: c.parties || [],
          files: c.files || [],
          minutaTexto: c.minuta_texto || c.minutaTexto || undefined,
          notes: c.notes || undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn('Erro ao consultar Supabase contracts, usando fallback local:', err);
    }
  }

  const contracts = readContracts();
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const contracts = readContracts();

    const existingIndex = contracts.findIndex(c => c.id === payload.id);
    let contractToSave: Contract;

    if (existingIndex >= 0) {
      contractToSave = {
        ...contracts[existingIndex],
        ...payload,
        updatedAt: new Date().toISOString()
      };
      contracts[existingIndex] = contractToSave;
    } else {
      contractToSave = {
        ...payload,
        id: payload.id || `ctr-${Date.now()}`,
        code: payload.code || `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      contracts.unshift(contractToSave);
    }

    writeContracts(contracts);

    // Sync to Supabase if configured
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const payloadToSave = {
          id: contractToSave.id,
          code: contractToSave.code,
          property_id: contractToSave.propertyId,
          property_title: contractToSave.propertyTitle,
          property_cover_image: contractToSave.propertyCoverImage || null,
          type: contractToSave.type,
          modalidade: contractToSave.modalidade || contractToSave.type,
          status: contractToSave.status,
          start_date: contractToSave.startDate,
          end_date: contractToSave.endDate,
          financial: contractToSave.financial,
          parties: contractToSave.parties,
          fiador_details: contractToSave.financial?.fiadorDetails || null,
          files: contractToSave.files,
          minuta_texto: contractToSave.minutaTexto || null,
          notes: contractToSave.notes || null,
          closed_at: contractToSave.closedAt || null,
          close_reason: contractToSave.closeReason || null,
          updated_at: new Date().toISOString()
        };

        const upsertRes = await supabase.from('contracts').upsert(payloadToSave);
        if (upsertRes.error) {
          await supabase.from('contratos').upsert(payloadToSave);
        }
      } catch (err) {
        console.warn('Erro ao sincronizar contrato com Supabase:', err);
      }
    }

    return NextResponse.json({ success: true, contracts });
  } catch (error) {
    console.error('Erro no POST /api/contracts:', error);
    return NextResponse.json({ error: 'Falha ao processar contrato' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do contrato é obrigatório' }, { status: 400 });
    }

    const contracts = readContracts();
    const filtered = contracts.filter(c => c.id !== id);
    writeContracts(filtered);

    // Sync deletion to Supabase
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const delRes = await supabase.from('contracts').delete().eq('id', id);
        if (delRes.error) {
          await supabase.from('contratos').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('Erro ao excluir contrato no Supabase:', err);
      }
    }

    return NextResponse.json({ success: true, contracts: filtered });
  } catch (error) {
    console.error('Erro no DELETE /api/contracts:', error);
    return NextResponse.json({ error: 'Falha ao excluir contrato' }, { status: 500 });
  }
}
