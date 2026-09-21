"use client";

import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function HouseModel() {
  const gltf = useGLTF("/models/house.glb");

  const normalizedScene = useMemo(() => {
    if (!gltf.scene) return null;

    const cloned = gltf.scene.clone(true);

    // 1. Calcular Bounding Box original
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 2. Centralizar na origem exata (0, 0, 0)
    cloned.position.x = -center.x;
    cloned.position.y = -center.y;
    cloned.position.z = -center.z;

    // 3. Normalizar escala para que caiba perfeitamente no viewport da câmera
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetDimension = 4.2; // Dimensão ideal para o frustum Three.js da tela
    const scaleFactor = maxDimension > 0 ? targetDimension / maxDimension : 1;

    // 4. Criar um grupo wrapper com a escala normalizada
    const wrapper = new THREE.Group();
    wrapper.add(cloned);
    wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // 5. Ajustar sombras e propriedades de renderização preservando as texturas PBR reais
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((m) => {
            m.side = THREE.DoubleSide;
            if (m.transparent) {
              m.depthWrite = true;
            }
          });
        }
      }
    });

    return wrapper;
  }, [gltf]);

  if (!normalizedScene) return null;

  return <primitive object={normalizedScene} />;
}

