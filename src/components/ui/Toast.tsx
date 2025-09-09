// src/components/ui/Toast.tsx
"use client";

import { useEffect } from 'react';

export interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: number) => void;
}

const toastColors = {
  success: 'bg-green-600 border-green-500',
  error: 'bg-red-600 border-red-500',
  info: 'bg-blue-600 border-blue-500',
};

const Toast = ({ id, message, type, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // El toast desaparece después de 5 segundos

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className={`w-full max-w-sm p-4 text-white rounded-lg shadow-lg border-l-4 ${toastColors[type]} animate-fade-in-right`}>
      <div className="flex items-start">
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button onClick={() => onDismiss(id)} className="ml-4 flex-shrink-0 text-white/70 hover:text-white">
          &times;
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }: { toasts: Omit<ToastProps, 'onDismiss'>[]; onDismiss: (id: number) => void; }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};