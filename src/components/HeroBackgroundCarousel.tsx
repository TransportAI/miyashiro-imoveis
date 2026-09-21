"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const BACKGROUND_IMAGES = [
  {
    src: "/images/properties/casa_condominio_1.jpg",
    alt: "Casa de Alto Padrão em Condomínio Fechado - Amparo",
  },
  {
    src: "/images/properties/chacara_serra_1.jpg",
    alt: "Chácara Recanto da Serra - Circuito das Águas",
  },
  {
    src: "/images/properties/apartamento_centro_1.jpg",
    alt: "Apartamento com Vista Panorâmica no Centro de Amparo",
  },
  {
    src: "/images/properties/casa_jardim_1.jpg",
    alt: "Residência Contemporânea com Lazer e Piscina",
  },
];

export default function HeroBackgroundCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Background Slideshow com Transição Suave e Fundo Claro */}
      {BACKGROUND_IMAGES.map((item, idx) => (
        <div
          key={item.src}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            idx === currentIndex ? "opacity-25" : "opacity-0"
          }`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            priority={idx === 0}
            className="object-cover object-center scale-105 transition-transform duration-10000 ease-out"
          />
        </div>
      ))}

      {/* Gradiente Claro Luminoso (Sem preto, mantendo o 3D e as fotos visíveis) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/75 via-[#FAF7F2]/40 to-[#FAF7F2]" />
    </div>
  );
}
