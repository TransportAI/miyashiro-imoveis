import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FinancingSettings, defaultFinancingSettings } from '@/lib/types/financing';
import { createAdminClient } from '@/lib/supabase/server';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'financing_settings.json');

function readSettings(): FinancingSettings {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Erro ao ler financing_settings.json:', error);
  }
  return defaultFinancingSettings;
}

function writeSettings(settings: FinancingSettings): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('financing_settings')
        .select('*')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Obter configuração geral ou lista de bancos
        const settings = readSettings();
        return NextResponse.json(settings);
      }
    } catch (e) {
      console.warn('Fallback financing settings:', e);
    }
  }

  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const updatedSettings: FinancingSettings = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase && payload.banks && Array.isArray(payload.banks)) {
      try {
        const banksFormatted = payload.banks.map((b: any) => ({
          id: b.id,
          bank_name: b.name,
          interest_rate_nominal: b.nominalRate,
          interest_rate_effective: b.effectiveRate,
          max_financing_percent: b.maxLTV || 80,
          max_term_months: b.maxTermMonths || 420,
          amortization_systems: b.amortizationSystems || ['SAC', 'PRICE'],
          is_active: b.isActive !== false,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('financing_settings').upsert(banksFormatted, { onConflict: 'id' });
      } catch (e) {
        console.warn('Aviso Supabase financing upsert:', e);
      }
    }

    writeSettings(updatedSettings);
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Erro no POST /api/financing/settings:', error);
    return NextResponse.json({ error: 'Falha ao salvar configurações de financiamento' }, { status: 500 });
  }
}
