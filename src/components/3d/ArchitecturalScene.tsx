"use client";

import React, { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HouseModel } from "./HouseModel";
import { useArchitecturalScrollTimeline } from "./useArchitecturalScrollTimeline";

export function ArchitecturalScene() {
  const modelGroupRef = useRef<THREE.Group>(null);
  const targetTransform = useArchitecturalScrollTimeline();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!modelGroupRef.current) return;

    const t = targetTransform.current;
    timeRef.current += delta;
    const time = timeRef.current;

    // Idle floating suave e rotação orgânica contínua
    const idleY = Math.sin(time * 0.7) * 0.04;
    const idleRotY = Math.sin(time * 0.4) * 0.02;

    const lerpFactor = Math.min(1, delta * 6);

    // Interpolação de Posição
    modelGroupRef.current.position.x = THREE.MathUtils.lerp(
      modelGroupRef.current.position.x,
      t.x,
      lerpFactor
    );
    modelGroupRef.current.position.y = THREE.MathUtils.lerp(
      modelGroupRef.current.position.y,
      t.y + idleY,
      lerpFactor
    );
    modelGroupRef.current.position.z = THREE.MathUtils.lerp(
      modelGroupRef.current.position.z,
      t.z,
      lerpFactor
    );

    // Interpolação de Rotação
    modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      modelGroupRef.current.rotation.x,
      t.rotX,
      lerpFactor
    );
    modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      modelGroupRef.current.rotation.y,
      t.rotY + idleRotY,
      lerpFactor
    );
    modelGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      modelGroupRef.current.rotation.z,
      t.rotZ,
      lerpFactor
    );

    // Interpolação de Escala
    const currentScale = modelGroupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, t.scale, lerpFactor);
    modelGroupRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <>
      {/* 1. ILUMINAÇÃO SOLAR EQUILIBRADA PARA FUNDO CLARO */}
      {/* Luz ambiente natural suave */}
      <ambientLight intensity={0.85} color="#FFFFFF" />

      {/* Luz solar direta quente (Realça texturas e detalhes) */}
      <directionalLight
        position={[6, 9, 7]}
        intensity={1.6}
        color="#FFF9F2"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Luz de preenchimento lateral suave */}
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.6}
        color="#E4F0FA"
      />

      {/* Luz de acento sutil em tom terracota refinado Gallo */}
      <pointLight
        position={[0, -2, 6]}
        intensity={0.6}
        color="#FF8A65"
        distance={20}
      />

      {/* 2. GRUPO DO MODELO COM POSIÇÃO VISÍVEL */}
      <group ref={modelGroupRef} position={[2.2, 0.2, 0]}>
        <Suspense fallback={null}>
          <HouseModel />
        </Suspense>
      </group>
    </>
  );
}
