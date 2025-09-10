// src/components/user/SpoilerWarningModal.tsx
"use client";

interface SpoilerWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SpoilerWarningModal = ({ isOpen, onConfirm, onCancel }: SpoilerWarningModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6 text-center">
        <h3 className="text-xl font-bold text-white">¡Cuidado!</h3>
        <p className="text-gray-400 my-4">
          Esta reseña contiene spoilers. ¿Estás seguro de que quieres continuar y revelar todo el contenido oculto?
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">
            Cancelar
          </button>
          <button onClick={onConfirm} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
            Sí, revelar spoilers
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpoilerWarningModal;