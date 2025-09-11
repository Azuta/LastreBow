// src/components/user/DiscardChangesModal.tsx
"use client";

interface DiscardChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DiscardChangesModal = ({ isOpen, onConfirm, onCancel }: DiscardChangesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6 text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white">Cambios sin guardar</h3>
        <p className="text-gray-400 my-4">
          Tienes cambios pendientes. ¿Estás seguro de que quieres salir sin guardar y descartarlos?
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">
            Cancelar
          </button>
          <button onClick={onConfirm} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
            Sí, descartar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardChangesModal;