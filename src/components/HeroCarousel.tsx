"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, MapPin, Sparkles, 
  ArrowUpRight, Maximize2, X 
} from "lucide-react";

import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SlideItem {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  image: string;
  slug: string;
  tag: string;
}

const FEATURED_SLIDES: SlideItem[] = [
  {
    id: "1",
    title: "Casa de Alto Padrão no Jardim Silvestre",
    category: "Residencial Premium",
    location: "Jardim Silvestre, Amparo - SP",
    price: "R$ 1.850.000",
    image: "/images/properties/casa_condominio_1.jpg",
    slug: "casa-alto-padrao-jardim-silvestre",
    tag: "Exclusividade Miyashiro",
  },
  {
    id: "2",
    title: "Apartamento Elegante com Vista Panorâmica",
    category: "Apartamento Central",
    location: "Centro, Amparo - SP",
    price: "R$ 820.000",
    image: "/images/properties/apartamento_centro_1.jpg",
    slug: "apartamento-vista-panoramica-centro",
    tag: "Oportunidade",
  },
  {
    id: "3",
    title: "Chácara Recanto da Serra com Lazer Completo",
    category: "Chácara & Campo",
    location: "Serra Negra / Amparo - SP",
    price: "R$ 1.350.000",
    image: "/images/properties/chacara_serra_1.jpg",
    slug: "chacara-recanto-da-serra",
    tag: "Natureza & Lazer",
  },
  {
    id: "4",
    title: "Residência Contemporânea com Piscina",
    category: "Casa em Condomínio",
    location: "Residencial Floresta, Amparo - SP",
    price: "R$ 2.100.000",
    image: "/images/properties/casa_jardim_1.jpg",
    slug: "residencia-contemporanea-com-piscina",
    tag: "Alto Padrão",
  },
];

interface HeroCarouselProps {
  properties?: Property[];
}

export default function HeroCarousel({ properties: initialProperties }: HeroCarouselProps) {
  const [items, setItems] = useState<Property[]>(initialProperties || []);

  useEffect(() => {
    // 1. Sync from localStorage if present
    try {
      const stored = localStorage.getItem('gallo_custom_properties');
      if (stored) {
        const parsed: Property[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const featured = parsed.filter(p => p.featured && p.status !== 'arquivado');
          setItems(featured);
          return;
        }
      }
    } catch (e) {}

    // 2. Otherwise sync from server API
    fetch('/api/properties', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const featured = data.filter((p: Property) => p.featured && p.status !== 'arquivado');
          setItems(featured);
        }
      })
      .catch(() => {});
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // When no featured properties exist, the carousel MUST disappear completely
  if (!items || items.length === 0) {
    return null;
  }

  const slides = items.slice(0, 6).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.type === "casa" ? "Casa de Alto Padrão" : p.type === "apartamento" ? "Apartamento Exclusivo" : p.type === "chacara" ? "Chácara & Lazer" : "Imóvel Selecionado",
    location: `${p.address.neighborhood}, ${p.address.city} - ${p.address.state}`,
    price: formatCurrency(p.price),
    image: p.images[0] || "/images/properties/casa_condominio_1.jpg",
    slug: p.slug,
    tag: p.featured ? "Destaque Miyashiro" : "Exclusividade",
  }));

  if (slides.length === 0) {
    return null;
  }

  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, isModalOpen, slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, prevSlide, nextSlide]);

  const current = slides[currentSlide] || slides[0];

  return (
    <>
      <div className="max-w-5xl mx-auto mb-10">
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-900 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
        {/* Aspect Ratio Container */}
        <div className="relative h-[420px] sm:h-[480px] md:h-[540px] w-full">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              onClick={() => setIsModalOpen(true)}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-zoom-in ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              title="Clique para ampliar a imagem"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover transition-transform duration-7000 ease-out group-hover:scale-105"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-stone-950/20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-transparent to-transparent hidden md:block pointer-events-none" />
            </div>
          ))}

          {/* Top Badges & Expand Button */}
          <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium pointer-events-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.tag}</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-medium backdrop-blur-md border border-white/20 transition cursor-pointer shadow-md hover:scale-105"
                title="Ampliar visualização em tela cheia"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Ampliar Foto</span>
              </button>

              <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono">
                0{currentSlide + 1} / 0{slides.length}
              </div>
            </div>
          </div>

          {/* Slide Content Card (Bottom) */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl text-white space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
                {current.category}
              </span>
              <h3 
                onClick={() => setIsModalOpen(true)}
                className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight font-urbanist drop-shadow-md line-clamp-2 cursor-zoom-in hover:text-amber-200 transition"
                title="Clique para ampliar"
              >
                {current.title}
              </h3>
              <div className="flex items-center gap-1.5 text-stone-300 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{current.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-stone-300 block">Valor</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-urbanist">
                  {current.price}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                  title="Ampliar visualização"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <Link
                  href={`/imovel/${current.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gallo-700 hover:bg-gallo-800 text-white text-xs sm:text-sm font-medium transition shadow-lg hover:shadow-xl group/btn"
                >
                  <span>Ver Imóvel</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

      {/* Lightbox Modal de Ampliação em Tela Cheia */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Top Controls */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
            <span className="text-xs font-mono text-stone-300 bg-stone-900/80 px-3 py-1.5 rounded-full border border-white/20">
              0{currentSlide + 1} de 0{slides.length}
            </span>
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Fechar visualização ampliada"
              className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-white/20 transition cursor-pointer shadow-xl hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Container */}
          <div 
            className="relative w-full max-w-6xl max-h-[85vh] h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enlarged Image */}
            <div className="relative w-full h-[65vh] sm:h-[72vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-950">
              <Image
                src={current.image}
                alt={current.title}
                fill
                priority
                className="object-contain"
              />

              {/* Prev / Next inside modal */}
              <button
                onClick={prevSlide}
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white border border-white/20 flex items-center justify-center transition cursor-pointer shadow-2xl hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white border border-white/20 flex items-center justify-center transition cursor-pointer shadow-2xl hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Info Bar in Modal */}
            <div className="w-full mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                  {current.category} • {current.tag}
                </span>
                <h4 className="text-base sm:text-lg font-medium font-urbanist text-white">
                  {current.title}
                </h4>
                <p className="text-xs text-stone-300">{current.location}</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-stone-400 block uppercase">Valor</span>
                  <span className="text-lg sm:text-xl font-bold font-urbanist text-amber-400">
                    {current.price}
                  </span>
                </div>

                <Link
                  href={`/imovel/${current.slug}`}
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gallo-700 hover:bg-gallo-800 text-white text-xs font-semibold transition shadow"
                >
                  <span>Acessar Ficha</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
