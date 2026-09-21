"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ArchitecturalScene } from "./ArchitecturalScene";

export function Background3DCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ArchitecturalScene />
      </Canvas>
    </div>
  );
}
