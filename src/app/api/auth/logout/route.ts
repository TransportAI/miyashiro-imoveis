import { NextResponse } from 'next/server';

function clearSessionCookies(response: NextResponse) {
  const cookieNames = ['gallo_session', 'miyashiro_session', 'primavera_session', 'celeste_session'];
  for (const name of cookieNames) {
    response.cookies.delete(name);
    response.cookies.set({
      name,
      value: '',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  clearSessionCookies(response);
  return response;
}

export async function GET(request: Request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  clearSessionCookies(response);
  return response;
}
