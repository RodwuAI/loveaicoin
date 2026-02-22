'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
}>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Expose globally for simple alert replacements
  useEffect(() => {
    (window as any).__toast = (msg: string) => showToast(msg, 'info');
    return () => { delete (window as any).__toast; };
  }, [showToast]);

  const iconMap = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  const bgMap = { info: 'bg-navy', success: 'bg-green-600', warning: 'bg-amber-500', error: 'bg-red-500' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`${bgMap[t.type]} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-in pointer-events-auto max-w-[360px]`}>
            <span>{iconMap[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
