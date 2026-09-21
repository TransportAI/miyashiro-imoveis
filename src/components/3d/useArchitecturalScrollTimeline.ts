"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ArchitecturalTransform {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

export function useArchitecturalScrollTimeline() {
  const transform = useRef<ArchitecturalTransform>({
    x: 2.2,
    y: 0.1,
    z: 0.5,
    rotX: 0.15,
    rotY: -0.55,
    rotZ: 0.02,
    scale: 1.0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 1024;

    // 1. Hero: Vista ampla 3/4 da fachada residencial na margem direita
    const heroPos: ArchitecturalTransform = {
      x: isMobile ? 0 : 2.2,
      y: isMobile ? -0.8 : 0.1,
      z: isMobile ? -1.5 : 0.5,
      rotX: 0.15,
      rotY: isMobile ? -0.2 : -0.55,
      rotZ: 0.02,
      scale: isMobile ? 0.65 : 1.05,
    };

    // 2. Busca de Imóveis: Rotação para a margem esquerda, desimpedindo o centro
    const buscaPos: ArchitecturalTransform = {
      x: isMobile ? 0 : -2.5,
      y: isMobile ? -0.9 : 0.0,
      z: isMobile ? -1.8 : 0.2,
      rotX: 0.18,
      rotY: isMobile ? 0.2 : 0.75,
      rotZ: -0.04,
      scale: isMobile ? 0.6 : 0.95,
    };

    // 3. Imóveis em Destaque: Câmera com aproximação sutil na margem direita
    const destaquesPos: ArchitecturalTransform = {
      x: isMobile ? 0 : 2.4,
      y: isMobile ? -0.9 : -0.2,
      z: isMobile ? -1.5 : 0.6,
      rotX: 0.12,
      rotY: isMobile ? -0.2 : -0.4,
      rotZ: 0.02,
      scale: isMobile ? 0.65 : 1.0,
    };

    // 4. Contato / Corretor: Recuo suave em profundidade Z
    const contatoPos: ArchitecturalTransform = {
      x: isMobile ? 0 : 1.8,
      y: isMobile ? -1.1 : -0.5,
      z: isMobile ? -2.8 : -1.2,
      rotX: 0.2,
      rotY: isMobile ? -0.1 : -0.3,
      rotZ: 0.02,
      scale: isMobile ? 0.5 : 0.8,
    };

    // Inicializar no estado Hero
    Object.assign(transform.current, heroPos);

    const ctx = gsap.context(() => {
      // Hero -> Busca
      ScrollTrigger.create({
        trigger: "#busca",
        start: "top 95%",
        end: "top 30%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          transform.current.x = gsap.utils.interpolate(heroPos.x, buscaPos.x, p);
          transform.current.y = gsap.utils.interpolate(heroPos.y, buscaPos.y, p);
          transform.current.z = gsap.utils.interpolate(heroPos.z, buscaPos.z, p);
          transform.current.rotX = gsap.utils.interpolate(heroPos.rotX, buscaPos.rotX, p);
          transform.current.rotY = gsap.utils.interpolate(heroPos.rotY, buscaPos.rotY, p);
          transform.current.rotZ = gsap.utils.interpolate(heroPos.rotZ, buscaPos.rotZ, p);
          transform.current.scale = gsap.utils.interpolate(heroPos.scale, buscaPos.scale, p);
        },
      });

      // Busca -> Destaques
      ScrollTrigger.create({
        trigger: "#destaques",
        start: "top 90%",
        end: "top 30%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          transform.current.x = gsap.utils.interpolate(buscaPos.x, destaquesPos.x, p);
          transform.current.y = gsap.utils.interpolate(buscaPos.y, destaquesPos.y, p);
          transform.current.z = gsap.utils.interpolate(buscaPos.z, destaquesPos.z, p);
          transform.current.rotX = gsap.utils.interpolate(buscaPos.rotX, destaquesPos.rotX, p);
          transform.current.rotY = gsap.utils.interpolate(buscaPos.rotY, destaquesPos.rotY, p);
          transform.current.rotZ = gsap.utils.interpolate(buscaPos.rotZ, destaquesPos.rotZ, p);
          transform.current.scale = gsap.utils.interpolate(buscaPos.scale, destaquesPos.scale, p);
        },
      });

      // 4. Destaques -> Contato
      ScrollTrigger.create({
        trigger: "#contato",
        start: "top 90%",
        end: "top 35%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          transform.current.x = gsap.utils.interpolate(destaquesPos.x, contatoPos.x, p);
          transform.current.y = gsap.utils.interpolate(destaquesPos.y, contatoPos.y, p);
          transform.current.z = gsap.utils.interpolate(destaquesPos.z, contatoPos.z, p);
          transform.current.rotX = gsap.utils.interpolate(destaquesPos.rotX, contatoPos.rotX, p);
          transform.current.rotY = gsap.utils.interpolate(destaquesPos.rotY, contatoPos.rotY, p);
          transform.current.rotZ = gsap.utils.interpolate(destaquesPos.rotZ, contatoPos.rotZ, p);
          transform.current.scale = gsap.utils.interpolate(destaquesPos.scale, contatoPos.scale, p);
        },
      });

      // 5. Contato -> Footer: O modelo sai de cena suavemente em direção ao fundo
      const exitPos: ArchitecturalTransform = {
        x: contatoPos.x,
        y: -3.5,
        z: -4.0,
        rotX: 0.3,
        rotY: contatoPos.rotY,
        rotZ: 0.0,
        scale: 0.001,
      };

      ScrollTrigger.create({
        trigger: "footer",
        start: "top 100%",
        end: "top 70%",
        scrub: 1.0,
        onUpdate: (self) => {
          const p = self.progress;
          transform.current.x = gsap.utils.interpolate(contatoPos.x, exitPos.x, p);
          transform.current.y = gsap.utils.interpolate(contatoPos.y, exitPos.y, p);
          transform.current.z = gsap.utils.interpolate(contatoPos.z, exitPos.z, p);
          transform.current.rotX = gsap.utils.interpolate(contatoPos.rotX, exitPos.rotX, p);
          transform.current.rotY = gsap.utils.interpolate(contatoPos.rotY, exitPos.rotY, p);
          transform.current.rotZ = gsap.utils.interpolate(contatoPos.rotZ, exitPos.rotZ, p);
          transform.current.scale = gsap.utils.interpolate(contatoPos.scale, exitPos.scale, p);
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return transform;
}
