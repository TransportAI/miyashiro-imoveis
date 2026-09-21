import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  response.cookies.delete('gallo_session');
  response.cookies.delete('primavera_session');
  response.cookies.delete('celeste_session');
  return response;
}
