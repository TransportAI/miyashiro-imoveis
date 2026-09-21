import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis do .env ou .env.local
const envPath = fs.existsSync(path.join(rootDir, '.env.local'))
  ? path.join(rootDir, '.env.local')
  : path.join(rootDir, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Erro: Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no seu arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function runSeed() {
  console.log('🚀 Iniciando Seed no Supabase...');

  // 1. Corretores
  try {
    const corretoresPath = path.join(rootDir, 'src', 'data', 'corretores.json');
    if (fs.existsSync(corretoresPath)) {
      const corretores = JSON.parse(fs.readFileSync(corretoresPath, 'utf-8'));
      const formatted = corretores.map((c) => ({
        nome: c.nome,
        email: c.email,
        creci: c.creci,
        whatsapp: c.whatsapp,
        telefone_comercial: c.telefoneComercial || null,
        avatar_url: c.avatarUrl || null,
        bio: c.bio || null,
        role: c.role || 'CORRETOR',
        permissions: c.permissions || [],
        is_active: c.isActive !== false,
      }));
      const { error } = await supabase.from('corretores').upsert(formatted, { onConflict: 'email' });
      if (error) console.warn('⚠️ Corretores:', error.message);
      else console.log(`✅ ${formatted.length} corretores sincronizados.`);
    }
  } catch (e) {
    console.warn('⚠️ Erro em corretores:', e.message);
  }

  // 2. Imóveis (Properties)
  try {
    const propsPath = path.join(rootDir, 'src', 'data', 'properties.json');
    if (fs.existsSync(propsPath)) {
      const properties = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));
      const formatted = properties.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || '',
        purpose: p.purpose,
        type: p.type,
        price: p.price || 0,
        iptu: p.iptu || 0,
        condo_fee: p.condoFee || 0,
        area_total: p.areaTotal || 0,
        area_built: p.areaBuilt || 0,
        bedrooms: p.bedrooms || 0,
        suites: p.suites || 0,
        bathrooms: p.bathrooms || 0,
        parking_spots: p.parkingSpots || 0,
        address: p.address || {},
        images: p.images || [],
        amenities: p.amenities || [],
        featured: !!p.featured,
        video_url: p.videoUrl || null,
        virtual_tour_url: p.virtualTourUrl || null,
        virtual_tour_rooms: p.virtualTourRooms || [],
        status: p.status || 'disponivel',
        created_at: p.createdAt || new Date().toISOString(),
      }));
      const { error } = await supabase.from('properties').upsert(formatted, { onConflict: 'id' });
      if (error) console.warn('⚠️ Imóveis:', error.message);
      else console.log(`✅ ${formatted.length} imóveis sincronizados.`);
    }
  } catch (e) {
    console.warn('⚠️ Erro em imóveis:', e.message);
  }

  // 3. Financiamento
  try {
    const finPath = path.join(rootDir, 'src', 'data', 'financing_settings.json');
    if (fs.existsSync(finPath)) {
      const financing = JSON.parse(fs.readFileSync(finPath, 'utf-8'));
      const banks = financing.bankRates || [];
      const formatted = banks.map((f) => ({
        id: f.id,
        bank_name: f.bankName,
        interest_rate_nominal: f.annualRate,
        interest_rate_effective: f.annualRate,
        max_financing_percent: f.minDownPayment ? (100 - f.minDownPayment) : 80,
        max_term_months: (f.maxTermYears || 35) * 12,
        amortization_systems: ['SAC', 'PRICE'],
        is_active: f.isActive !== false,
      }));
      if (formatted.length > 0) {
        const { error } = await supabase.from('financing_settings').upsert(formatted, { onConflict: 'id' });
        if (error) console.warn('⚠️ Financiamento:', error.message);
        else console.log(`✅ ${formatted.length} bancos parceiros sincronizados.`);
      }
    }
  } catch (e) {
    console.warn('⚠️ Erro em financiamento:', e.message);
  }

  // 4. Seguradoras
  try {
    const segPath = path.join(rootDir, 'src', 'data', 'seguradoras.json');
    if (fs.existsSync(segPath)) {
      const seguradoras = JSON.parse(fs.readFileSync(segPath, 'utf-8'));
      const formatted = seguradoras.map((s, idx) => ({
        id: s.id,
        name: s.nome || s.name,
        badge: s.tag || s.badge || 'Parceira',
        rate_description: s.notas || s.rateDescription || 'Garantia locatícia flexível',
        features: s.features || [],
        portal_url: s.portalUrl || s.portal_url,
        is_active: s.isActive !== false,
        order_index: s.ordem || idx,
      }));
      const { error } = await supabase.from('seguradoras').upsert(formatted, { onConflict: 'id' });
      if (error) console.warn('⚠️ Seguradoras:', error.message);
      else console.log(`✅ ${formatted.length} seguradoras sincronizadas.`);
    }
  } catch (e) {
    console.warn('⚠️ Erro em seguradoras:', e.message);
  }

  console.log('🎉 Migração de dados concluída com sucesso!');
}

runSeed().catch((err) => {
  console.error('❌ Falha fatal no seed:', err);
  process.exit(1);
});
