"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Scale, X, Check, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Property } from "@/lib/types";
import { formatCurrency, formatArea } from "@/lib/utils";

interface PropertyComparatorProps {
  allProperties: Property[];
}

export default function PropertyComparator({ allProperties }: PropertyComparatorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load comparison from session/state
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gallo_compare_ids");
      if (saved) setSelectedIds(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const saveComparison = (ids: string[]) => {
    setSelectedIds(ids);
    try {
      sessionStorage.setItem("gallo_compare_ids", JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      saveComparison(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("Você pode comparar no máximo 3 imóveis simultaneamente.");
        return;
      }
      saveComparison([...selectedIds, id]);
    }
  };

  const selectedProperties = allProperties.filter((p) => selectedIds.includes(p.id));

  const formatPricePerMeter = (p: Property) => {
    const area = p.areaBuilt || p.areaTotal;
    if (!area || !p.price) return "Sob consulta";
    const perMeter = p.price / area;
    return formatCurrency(perMeter) + "/m²";
  };

  const handleShareComparison = () => {
    const lines = selectedProperties.map(
      (p) => `• ${p.title} (${formatCurrency(p.price)}) - ${p.address.neighborhood}`
    );
    const text = encodeURIComponent(
      `Olá! Estou comparando estes ${selectedProperties.length} imóveis no site da Miyashiro Imóveis e gostaria de mais informações:\n\n${lines.join("\n")}`
    );
    window.open(`https://wa.me/5519993673949?text=${text}`, "_blank");
  };

  return (
    <>
      {/* Floating compare pill if 1 or more items selected */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 animate-fade-in">
          <div className="bg-stone-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold font-urbanist block">
                  Comparador Ativo ({selectedIds.length}/3)
                </span>
                <span className="text-[10px] text-stone-400">
                  {selectedIds.length === 1 ? "Selecione mais um imóvel" : "Pronto para comparar lado a lado"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow"
            >
              Comparar Agora
            </button>

            <button
              onClick={() => saveComparison([])}
              className="text-stone-400 hover:text-white p-1"
              title="Limpar seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-stone-900 font-urbanist">
                    Comparativo Lado a Lado de Imóveis
                  </h3>
                  <p className="text-xs text-stone-500">
                    Analise metragem, valor por m², condomínio e diferenciais com precisão
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedProperties.length > 0 && (
                  <button
                    onClick={handleShareComparison}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Dúvidas no WhatsApp</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedProperties.length === 0 ? (
                <div className="text-center py-12 text-stone-500 space-y-2">
                  <Scale className="w-12 h-12 text-stone-300 mx-auto" />
                  <p className="text-sm">Nenhum imóvel selecionado para o comparador.</p>
                  <p className="text-xs">Clique no botão &quot;Comparar&quot; nos cards dos imóveis para adicionar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="p-4 w-44 font-medium text-stone-400 uppercase tracking-wider text-[10px]">
                          Característica
                        </th>
                        {selectedProperties.map((prop) => (
                          <th key={prop.id} className="p-4 min-w-[240px] align-top">
                            <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-stone-100">
                              <Image
                                src={prop.images[0] || "/images/brand/logo.png"}
                                alt={prop.title}
                                fill
                                className="object-cover"
                              />
                              <button
                                onClick={() => toggleSelect(prop.id)}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                                title="Remover"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                              {prop.type} • {prop.purpose === "venda" ? "Venda" : "Aluguel"}
                            </span>
                            <h4 className="text-sm font-medium text-stone-900 font-urbanist line-clamp-2">
                              {prop.title}
                            </h4>
                            <p className="text-base font-bold text-gallo-800 font-urbanist mt-1">
                              {formatCurrency(prop.price)}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Valor do m²</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 font-bold text-stone-900">
                            {formatPricePerMeter(p)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Bairro / Cidade</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 text-stone-700">
                            {p.address.neighborhood}, {p.address.city}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Área Construída / Total</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 text-stone-700">
                            {p.areaBuilt ? formatArea(p.areaBuilt) : "-"} / {formatArea(p.areaTotal)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Dormitórios / Suítes</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 text-stone-700">
                            {p.bedrooms} quartos ({p.suites} suíte{p.suites !== 1 ? "s" : ""})
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Vagas de Garagem</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 text-stone-700">
                            {p.parkingSpots} vaga{p.parkingSpots !== 1 ? "s" : ""}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Condomínio & IPTU</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4 text-stone-700">
                            Cond: {p.condoFee ? formatCurrency(p.condoFee) : "Isento"} | IPTU: {p.iptu ? formatCurrency(p.iptu) : "Isento"}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-stone-700 bg-stone-50/50">Ação</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="p-4">
                            <Link
                              href={`/imovel/${p.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition"
                            >
                              <span>Acessar Ficha</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
