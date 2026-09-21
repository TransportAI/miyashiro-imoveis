import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Informe seu e-mail e senha de acesso.' },
        { status: 400 }
      );
    }

    // 1. Tentar autenticação direta via Supabase Auth
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: cleanPassword,
        });

        if (!authError && authData?.session) {
          const response = NextResponse.json({
            success: true,
            user: {
              id: authData.user?.id,
              email: authData.user?.email,
              name: authData.user?.user_metadata?.nome || 'Administrador Gallo',
              role: authData.user?.user_metadata?.role || 'admin',
            },
          });

          // Define cookie de sessão administrativa
          response.cookies.set({
            name: 'gallo_session',
            value: 'authenticated_admin',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          return response;
        }
      } catch (e) {
        console.warn('Aviso Supabase Auth login:', e);
      }
    }

    // 2. Fallback de Segurança: Credenciais Mestras Configuradas
    const validEmails = [
      (process.env.ADMIN_EMAIL || '').toLowerCase(),
      'admin@miyashiroimoveis.com.br',
      'contato@miyashiroimoveis.com.br',
      'miyashiroimoveis@gmail.com',
      'admin@gallo.com',
    ].filter(Boolean);

    const validPasswords = [
      process.env.ADMIN_INITIAL_PASSWORD,
      'Miyashiro@2026!',
      'Gallo@2026!',
    ].filter(Boolean);

    const isAuthorized = validEmails.includes(normalizedEmail) && validPasswords.includes(cleanPassword);

    if (isAuthorized) {
      const response = NextResponse.json({
        success: true,
        user: {
          email: normalizedEmail,
          name: 'Administrador Miyashiro',
          role: 'admin',
        },
      });

      response.cookies.set({
        name: 'gallo_session',
        value: 'authenticated_admin',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Credenciais incorretas. Verifique seu e-mail e senha cadastrados.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar autenticação.' },
      { status: 500 }
    );
  }
}
