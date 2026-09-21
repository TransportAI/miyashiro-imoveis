import { NextResponse } from 'next/server';
import leadsData from '@/data/leads.json';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email,
          interestType: l.interest_type,
          propertyType: l.property_type,
          bedroomsCount: l.bedrooms_count,
          bathroomsCount: l.bathrooms_count,
          preferredHoods: l.preferred_hoods,
          dataNascimento: l.data_nascimento,
          rendaMensal: Number(l.renda_mensal) || undefined,
          fgtsDisponivel: Number(l.fgts_disponivel) || 0,
          status: l.status,
          temperature: l.temperature,
          channel: l.channel,
          origin: l.origin,
          notes: l.notes,
          corretorId: l.corretor_id,
          createdAt: l.created_at,
        }));
        return NextResponse.json(formatted);
      }
    } catch (e) {
      console.warn('Fallback leads:', e);
    }
  }

  return NextResponse.json(leadsData);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (supabase) {
      try {
        await supabase.from('leads').insert({
          id: body.id || `lead-${Date.now()}`,
          name: body.name,
          phone: body.phone,
          email: body.email || null,
          interest_type: body.interestType || 'COMPRA',
          property_type: body.propertyType || null,
          bedrooms_count: body.bedroomsCount || 1,
          bathrooms_count: body.bathroomsCount || 1,
          preferred_hoods: body.preferredHoods || ['Amparo e Região'],
          data_nascimento: body.dataNascimento || null,
          renda_mensal: body.rendaMensal || null,
          fgts_disponivel: body.fgtsDisponivel || 0,
          status: body.status || 'novo',
          temperature: body.temperature || 'morna',
          channel: body.channel || 'site',
          origin: body.origin || 'WIDGET_TRIAGEM',
          notes: body.notes || null,
          corretor_id: body.corretorId || null,
        });
      } catch (e) {
        console.warn('Aviso Supabase lead insert:', e);
      }
    }

    return NextResponse.json({ success: true, lead: body }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (supabase && body.id) {
      try {
        await supabase.from('leads').update({
          status: body.status,
          temperature: body.temperature,
          corretor_id: body.corretorId,
          notes: body.notes,
          updated_at: new Date().toISOString(),
        }).eq('id', body.id);
      } catch (e) {
        console.warn('Aviso Supabase lead update:', e);
      }
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
