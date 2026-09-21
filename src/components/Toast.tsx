'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastType = 'info' | 'error' | 'success';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gallo_toast', {
        detail: { message, type },
      })
    );
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    let lastToastMsg = '';
    let lastToastTime = 0;

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: ToastType }>;
      const msg = customEvent.detail?.message;
      if (!msg) return;

      const now = Date.now();
      // Previne disparos duplicados idênticos dentro de 3 segundos
      if (msg === lastToastMsg && now - lastToastTime < 3000) {
        return;
      }
      lastToastMsg = msg;
      lastToastTime = now;

      const newToast: ToastData = {
        id: now,
        message: msg,
        type: customEvent.detail.type || 'info',
      };

      setToasts((prev) => {
        // Se já existe um toast exibindo a mesma mensagem, não duplica
        if (prev.some((t) => t.message === msg)) {
          return prev;
        }
        return [...prev, newToast];
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('gallo_toast', handleToastEvent);
    window.addEventListener('primavera_toast', handleToastEvent);
    return () => {
      window.removeEventListener('gallo_toast', handleToastEvent);
      window.removeEventListener('primavera_toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto flex items-center justify-between gap-3.5 w-full max-w-md rounded-2xl bg-stone-900/95 text-white backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/10"
              role="alert"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isError
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isError ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5 fill-amber-400/30" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {isError ? 'Atenção' : isSuccess ? 'Sucesso' : 'Imóveis Salvos'}
                  </p>
                  <p className="text-xs font-medium text-stone-100 leading-snug mt-0.5">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
