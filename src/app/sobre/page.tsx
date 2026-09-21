import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Award, Users, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function SobrePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-medium uppercase tracking-wider text-gallo-700">Nossa Trajetória</span>
        <h1 className="text-3xl sm:text-4xl font-medium text-stone-900 font-urbanist">
          Credibilidade, segurança e tradição conectando você ao imóvel ideal em Amparo
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-light">
          A Miyashiro Imóveis nasceu com o compromisso de unir a tradicional cordialidade do interior paulista ao rigor técnico e segurança jurídica imobiliária.
        </p>
      </div>

      {/* Brand Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gallo-50 text-gallo-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 font-urbanist">Segurança & Legalidade</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Registro oficial <strong>CRECI 155957F</strong>. Cada contrato, certidão e negociação passa por auditoria documental detalhada, resguardando os direitos de todas as partes.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gallo-50 text-gallo-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 font-urbanist">Experiência Consolidada</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Conhecemos cada rua, condomínio, loteamento e chácara de Amparo e região. Essa vivência nos permite oferecer avaliações justas e oportunidades reais.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gallo-50 text-gallo-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 font-urbanist">Atendimento Personalizado</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Acreditamos que comprar ou alugar um imóvel é um marco na vida das pessoas. Por isso, oferecemos atenção individualizada do primeiro contato até o pós-venda.
          </p>
        </div>
      </div>

      {/* Sede e Instalações */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gallo-700">Venha nos Visitar</span>
          <h2 className="text-2xl sm:text-3xl font-medium text-stone-900 font-urbanist">
            Nossa Sede no Centro de Amparo
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
            Estamos estrategicamente localizados na Rua Ana Cintra, 246 no Centro de Amparo, com estrutura acolhedora para receber você, tomar um café e conversar sobre seus projetos imobiliários.
          </p>
          <div className="space-y-2 pt-2 text-xs text-stone-700">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gallo-700" />
              Rua Ana Cintra, 246 - Centro, Amparo - SP, CEP 13900-005
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gallo-700" />
              Fixo: (19) 3808-5638 • (19) 99609-5119 / (19) 99609-4312 • WhatsApp: (19) 99367-3949
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gallo-700" />
              miyashiroimoveis@gmail.com
            </p>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
          <Image
            src="/images/properties/comercial_amparo_1.jpg"
            alt="Sede da Miyashiro Imóveis"
            fill
            className="object-cover"
          />
        </div>
      </div>

    </div>
  );
}
