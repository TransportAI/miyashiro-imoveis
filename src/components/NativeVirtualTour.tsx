'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { 
  Compass, Maximize2, Minimize2, RotateCcw, 
  Play, Pause, Plus, Minus, Sparkles 
} from 'lucide-react';
import { TourRoom } from '@/lib/types';

interface NativeVirtualTourProps {
  rooms: TourRoom[];
  propertyTitle?: string;
  initialRoomId?: string;
  className?: string;
}

export default function NativeVirtualTour({
  rooms,
  propertyTitle,
  initialRoomId,
  className = '',
}: NativeVirtualTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>(() => {
    if (initialRoomId) return initialRoomId;
    const initial = rooms.find(r => r.isInitial);
    return initial ? initial.id : (rooms[0]?.id || '');
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isEquirectangular, setIsEquirectangular] = useState(true);
  const [heading, setHeading] = useState(0);

  const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);

  // Interaction coordinates
  const isUserInteracting = useRef(false);
  const onPointerDownPointerX = useRef(0);
  const onPointerDownPointerY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);
  const lon = useRef(0);
  const lat = useRef(0);
  const phi = useRef(0);
  const theta = useRef(0);
  const fov = useRef(75);
  const currentIsEqui = useRef(true);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(fov.current, width / height, 1, 1200);
    cameraRef.current = camera;

    // Mesh with initial sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert inside-out

    const material = new THREE.MeshBasicMaterial({
      color: 0x1c1917,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    textureLoaderRef.current = new THREE.TextureLoader();

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isAutoRotating && !isUserInteracting.current) {
        if (currentIsEqui.current) {
          lon.current += 0.08;
        } else {
          // Gentle side-to-side sweep for curved non-360 photos
          lon.current = Math.sin(Date.now() * 0.0004) * 25;
        }
      }

      // Constrain latitude and longitude based on projection
      if (currentIsEqui.current) {
        lat.current = Math.max(-85, Math.min(85, lat.current));
      } else {
        lat.current = Math.max(-25, Math.min(25, lat.current));
        lon.current = Math.max(-45, Math.min(45, lon.current));
      }

      phi.current = THREE.MathUtils.degToRad(90 - lat.current);
      theta.current = THREE.MathUtils.degToRad(lon.current);

      const targetX = 500 * Math.sin(phi.current) * Math.cos(theta.current);
      const targetY = 500 * Math.cos(phi.current);
      const targetZ = 500 * Math.sin(phi.current) * Math.sin(theta.current);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);

      // Normalize heading 0 - 360 for compass UI
      const normLon = ((lon.current % 360) + 360) % 360;
      setHeading(Math.round(normLon));
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Load & Apply Texture with SMART PROJECTION
  useEffect(() => {
    if (!currentRoom || !meshRef.current) return;
    if (!textureLoaderRef.current) {
      textureLoaderRef.current = new THREE.TextureLoader();
    }

    setIsLoading(true);

    const loader = textureLoaderRef.current;
    loader.load(
      currentRoom.image,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const imgWidth = texture.image.width || 1;
        const imgHeight = texture.image.height || 1;
        const aspect = imgWidth / imgHeight;

        // Is this a true 360 equirectangular image (approx 2:1 aspect ratio)?
        const isEqui = aspect >= 1.75;
        currentIsEqui.current = isEqui;
        setIsEquirectangular(isEqui);

        if (meshRef.current) {
          const oldGeo = meshRef.current.geometry;
          if (oldGeo) oldGeo.dispose();

          if (isEqui) {
            // Full 360 Equirectangular Sphere: ZERO distortion for 2:1 panoramas!
            const newGeo = new THREE.SphereGeometry(500, 64, 48);
            newGeo.scale(-1, 1, 1);
            meshRef.current.geometry = newGeo;
            if (cameraRef.current) {
              fov.current = 75;
              cameraRef.current.fov = 75;
              cameraRef.current.updateProjectionMatrix();
            }
          } else {
            // Standard photo (4:3, 16:9, etc.): DO NOT stretch around 360°!
            // Project on a curved panoramic cinema screen with natural FOV:
            const arc = Math.min(Math.PI * 0.75, (imgWidth / imgHeight) * 0.85);
            const cylinderHeight = (500 * (imgHeight / imgWidth)) * arc;
            const newGeo = new THREE.CylinderGeometry(500, 500, cylinderHeight, 48, 1, true, -arc / 2, arc);
            newGeo.scale(-1, 1, 1);
            meshRef.current.geometry = newGeo;
            if (cameraRef.current) {
              fov.current = 60;
              cameraRef.current.fov = 60;
              cameraRef.current.updateProjectionMatrix();
            }
          }

          const oldMat = meshRef.current.material as THREE.MeshBasicMaterial;
          if (oldMat && oldMat.map) {
            oldMat.map.dispose();
          }

          meshRef.current.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
        }
        setIsLoading(false);
      },
      undefined,
      () => {
        setIsLoading(false);
      }
    );
  }, [currentRoom?.id, currentRoom?.image]);

  // Touch & Pointer state refs for fluid interaction
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartFov = useRef<number>(75);

  // Pointer Handlers (Desktop & Stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking on a button, link or interactive control, do not capture or drag
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    // Only handle primary button / primary pointer
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isUserInteracting.current = true;
    onPointerDownPointerX.current = e.clientX;
    onPointerDownPointerY.current = e.clientY;
    onPointerDownLon.current = lon.current;
    onPointerDownLat.current = lat.current;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isUserInteracting.current) return;
    const factor = currentIsEqui.current ? 0.22 : 0.14;
    lon.current = (onPointerDownPointerX.current - e.clientX) * factor + onPointerDownLon.current;
    lat.current = (e.clientY - onPointerDownPointerY.current) * factor + onPointerDownLat.current;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isUserInteracting.current = false;
  };

  // Dedicated Mobile Touch Handlers (Ultra-smooth on phones/tablets)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // If touching a button, link or interactive control, do not drag
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    if (e.touches.length === 1) {
      isUserInteracting.current = true;
      lastTouchX.current = e.touches[0].clientX;
      lastTouchY.current = e.touches[0].clientY;
      pinchStartDist.current = null;
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      isUserInteracting.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartFov.current = fov.current;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isUserInteracting.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchX.current;
      const deltaY = touch.clientY - lastTouchY.current;

      const factor = currentIsEqui.current ? 0.28 : 0.18;
      lon.current -= deltaX * factor;
      lat.current += deltaY * factor;

      lastTouchX.current = touch.clientX;
      lastTouchY.current = touch.clientY;
    } else if (e.touches.length === 2 && pinchStartDist.current !== null && cameraRef.current) {
      // Two-finger pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = pinchStartDist.current / currentDist;

      const minFov = currentIsEqui.current ? 35 : 45;
      const maxFov = currentIsEqui.current ? 95 : 75;
      const targetFov = pinchStartFov.current * ratio;
      fov.current = Math.max(minFov, Math.min(maxFov, targetFov));
      cameraRef.current.fov = fov.current;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      isUserInteracting.current = false;
      pinchStartDist.current = null;
    } else if (e.touches.length === 1) {
      // Back to single finger
      isUserInteracting.current = true;
      lastTouchX.current = e.touches[0].clientX;
      lastTouchY.current = e.touches[0].clientY;
      pinchStartDist.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const minFov = currentIsEqui.current ? 35 : 45;
    const maxFov = currentIsEqui.current ? 95 : 75;
    const newFov = fov.current + e.deltaY * 0.05;
    fov.current = Math.max(minFov, Math.min(maxFov, newFov));
    cameraRef.current.fov = fov.current;
    cameraRef.current.updateProjectionMatrix();
  };

  // Zoom Controls
  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    const minFov = currentIsEqui.current ? 35 : 45;
    fov.current = Math.max(minFov, fov.current - 10);
    cameraRef.current.fov = fov.current;
    cameraRef.current.updateProjectionMatrix();
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    const maxFov = currentIsEqui.current ? 95 : 75;
    fov.current = Math.min(maxFov, fov.current + 10);
    cameraRef.current.fov = fov.current;
    cameraRef.current.updateProjectionMatrix();
  };

  const handleResetView = () => {
    lon.current = 0;
    lat.current = 0;
    const resetFov = currentIsEqui.current ? 75 : 60;
    fov.current = resetFov;
    if (cameraRef.current) {
      cameraRef.current.fov = resetFov;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
      className={'relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[460px] sm:min-h-[560px] bg-stone-950 overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing rounded-3xl border border-stone-800 shadow-2xl ' + className}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-950/70 backdrop-blur-sm text-white space-y-3 transition-opacity duration-300">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs font-medium tracking-wide text-stone-300">
            Carregando ambiente 360° ({currentRoom?.name || 'Cômodo'})...
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
        
        {/* Active Room Title Pill */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/15 text-white shadow-lg pointer-events-auto shrink min-w-0 max-w-[42%] sm:max-w-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide font-urbanist truncate">
            {currentRoom?.name || 'Ambiente 360°'}
          </span>
          <span className="hidden md:inline-block text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
            {isEquirectangular ? '360° Esférico' : 'Panorâmica HD'}
          </span>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-900/90 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-white/15 text-white shadow-lg pointer-events-auto shrink-0">
          {/* Compass / Heading (only in 360 mode) */}
          {isEquirectangular && (
            <div className="hidden sm:flex px-2 py-1 items-center gap-1 text-[11px] font-mono text-stone-300 border-r border-white/10" title="Bússola / Orientação">
              <Compass
                className="w-3.5 h-3.5 text-amber-400 transition-transform duration-100"
                style={{ transform: 'rotate(' + heading + 'deg)' }}
              />
              <span className="w-7 text-right">{heading}°</span>
            </div>
          )}

          {/* Auto-Rotation Toggle */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoRotating(!isAutoRotating);
            }}
            className={'p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition ' + (
              isAutoRotating ? 'text-amber-400 bg-white/10' : 'text-stone-400 hover:text-white'
            )}
            title={isAutoRotating ? 'Pausar rotação automática' : 'Girar automaticamente'}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Zoom In (hidden on mobile, pinch-to-zoom is native) */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="hidden sm:flex p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
            title="Aproximar zoom"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out (hidden on mobile, pinch-to-zoom is native) */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="hidden sm:flex p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
            title="Afastar zoom"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleResetView();
            }}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
            title="Centralizar visão"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition shrink-0"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

      </div>

      {/* Bottom Floating Room Selector Drawer */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 flex flex-col items-center pointer-events-none">
        
        {/* Navigation Prompt */}
        <div className="hidden xs:block mb-2 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-stone-300 text-[11px] shadow text-center truncate max-w-full">
          <span>{isEquirectangular ? 'Arraste para olhar em 360°' : 'Arraste para navegar no ambiente panorâmico'} • Toque para trocar de cômodo:</span>
        </div>

        {/* Room Thumbnails Row */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto p-1.5 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl pointer-events-auto no-scrollbar touch-pan-x">
          {rooms.map((room, idx) => {
            const isActive = room.id === currentRoomId;
            return (
              <button
                key={room.id}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentRoomId(room.id);
                }}
                className={'flex items-center gap-2 px-3 py-2 rounded-xl transition duration-200 shrink-0 ' + (
                  isActive
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-white/20'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-white border border-white/5'
                )}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-stone-950 shrink-0">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold block leading-tight truncate max-w-[120px] sm:max-w-[150px]">
                    {room.name}
                  </span>
                  <span className="text-[9px] opacity-75 block font-mono">
                    Ambiente 0{idx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
