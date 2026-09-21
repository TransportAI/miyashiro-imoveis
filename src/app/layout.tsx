import type { Metadata, Viewport } from 'next';
import { Urbanist, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppCTA from '@/components/WhatsAppCTA';
import PropertyJsonLd from '@/components/seo/PropertyJsonLd';
import ComparisonFloatingBar from '@/components/ComparisonFloatingBar';
import TriagemWidget from '@/components/TriagemWidget';
import MobileDock from '@/components/MobileDock';
import Toast from '@/components/Toast';
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-urbanist',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Miyashiro Imóveis | Amparo e Região - CRECI 155957F',
  description: 'Encontre casas, apartamentos, chácaras e terrenos em Amparo e no Circuito das Águas Paulista com a S. Miyashiro Corretora de Imóveis. Vendas, locações e assessoria completa.',
  keywords: 'imobiliaria amparo, miyashiro imoveis, corretora miyashiro amparo, casas a venda amparo, terrenos amparo, aluguel amparo sp',
  openGraph: {
    title: 'S. Miyashiro Corretora de Imóveis | Amparo e Região',
    description: 'Casas, apartamentos, chácaras e terrenos em Amparo com a tradição e credibilidade da Miyashiro Imóveis.',
    url: 'https://www.miyashiroimoveis.com.br',
    siteName: 'Miyashiro Imóveis',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${urbanist.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-800 antialiased selection:bg-gallo-50 selection:text-gallo-800">
        <SmoothScrollProvider>
          <PropertyJsonLd />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppCTA />
          <ComparisonFloatingBar />
          <TriagemWidget />
          <MobileDock />
          <Toast />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
