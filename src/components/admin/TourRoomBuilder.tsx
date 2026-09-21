'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, Trash2, Star, Compass, Eye, Sparkles, Upload 
} from 'lucide-react';
import { TourRoom } from '@/lib/types';
import NativeVirtualTour from '@/components/NativeVirtualTour';

interface TourRoomBuilderProps {
  rooms: TourRoom[];
  onChange: (rooms: TourRoom[]) => void;
  availableImages?: string[];
}

export default function TourRoomBuilder({
  rooms,
  onChange,
  availableImages = [],
}: TourRoomBuilderProps) {
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomImage, setNewRoomImage] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const handleAddRoom = () => {
    const finalName = newRoomName.trim();
    if (!finalName) {
      alert('Por favor, digite o nome do cômodo.');
      return;
    }
    const chosenImage = newRoomImage.trim() || availableImages[0] || '/images/properties/gallo_prop_1.jpg';
    
    const newRoom: TourRoom = {
      id: 'room-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: finalName,
      image: chosenImage,
      isInitial: rooms.length === 0,
    };

    onChange([...rooms, newRoom]);
    setNewRoomName('');
    setNewRoomImage('');
  };

  const handleRemoveRoom = (id: string) => {
    const filtered = rooms.filter(r => r.id !== id);
    if (filtered.length > 0 && !filtered.some(r => r.isInitial)) {
      filtered[0].isInitial = true;
    }
    onChange(filtered);
  };

  const handleSetInitial = (id: string) => {
    const updated = rooms.map(r => ({
      ...r,
      isInitial: r.id === id,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-5 bg-stone-50 border border-stone-200/80 rounded-2xl p-4 sm:p-5">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs sm:text-sm font-semibold text-stone-900 font-urbanist">
              Passeio Virtual 360° do Imóvel
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Cadastre os ambientes com fotos panorâmicas para criar a experiência 360° interativa para os clientes.
          </p>
        </div>

        {rooms.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ' + (
              showLivePreview
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'Fechar Teste 360°' : 'Testar Tour 360° ao Vivo'}</span>
          </button>
        )}
      </div>

      {/* Live Interactive 360° Preview */}
      {showLivePreview && rooms.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-800">Pré-visualização Interativa (Exatamente como o cliente verá):</span>
            <span>{rooms.length} cômodo(s) configurado(s)</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-md">
            <NativeVirtualTour rooms={rooms} className="min-h-[360px] sm:min-h-[440px]" />
          </div>
        </div>
      )}

      {/* List of Configured Rooms */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-800 block flex items-center justify-between">
          <span>Cômodos Cadastrados no Tour ({rooms.length})</span>
          {rooms.length === 0 && (
            <span className="text-amber-700 font-normal text-[11px]">Nenhum cômodo adicionado ainda</span>
          )}
        </label>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rooms.map((room, idx) => (
              <div
                key={room.id}
                className={'flex items-center justify-between gap-3 p-2.5 rounded-xl border transition bg-white ' + (
                  room.isInitial ? 'border-amber-400 ring-1 ring-amber-300/50' : 'border-stone-200'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {room.name}
                      </p>
                      {room.isInitial && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                          Inicial
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Ambiente 0{idx + 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!room.isInitial && (
                    <button
                      type="button"
                      onClick={() => handleSetInitial(room.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 text-[10px] flex items-center gap-1"
                      title="Definir como ambiente de entrada"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(room.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-emerald-50"
                    title="Excluir cômodo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-stone-200 rounded-2xl bg-white/50">
            <Compass className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-xs text-stone-600 font-medium">Nenhum cômodo configurado para este imóvel.</p>
            <p className="text-[10px] text-stone-400 mt-0.5 max-w-sm mx-auto">
              Adicione os ambientes abaixo para ativar automaticamente o Tour Virtual 360° na vitrine do imóvel.
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Room Box */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 space-y-3 shadow-2xs">
        <span className="text-xs font-semibold text-stone-800 block">
          + Adicionar Outro Cômodo Personalizado
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-stone-700 block mb-1">
              Nome do Cômodo *
            </label>
            <input
              type="text"
              placeholder="Ex: Sala de Almoço / Varanda Gourmet"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-stone-700 block mb-1">
              Imagem do Cômodo (Foto 360° ou Panorâmica)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL da foto 360° ou faça upload..."
                value={newRoomImage}
                onChange={(e) => setNewRoomImage(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <label className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Upload 360°</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setNewRoomImage(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Existing Property Photos Picker */}
        {availableImages.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-stone-100">
            <span className="text-[10px] text-stone-500 block font-medium">
              Ou selecione uma das fotos já cadastradas no imóvel:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {availableImages.map((imgUrl, i) => {
                const isSelected = newRoomImage === imgUrl;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewRoomImage(imgUrl)}
                    className={'relative w-12 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ' + (
                      isSelected ? 'border-amber-500 scale-105 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                    )}
                    title={'Usar foto ' + (i + 1)}
                  >
                    <Image src={imgUrl} alt={'Foto ' + (i + 1)} fill className="object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Button */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => handleAddRoom()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Cômodo ao Tour</span>
          </button>
        </div>

      </div>

    </div>
  );
}
