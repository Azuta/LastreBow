"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: {
    manga: string;
    chapter: string;
    totalPages: number;
    scan: string;
    user: string;
    publishDate: string;
  };
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, summary }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-white text-center mb-4">Confirmar Publicación</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Manga:</span> <span className="text-white">{summary.manga}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Capítulo:</span> <span className="text-white">{summary.chapter}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Páginas Totales:</span> <span className="text-white">{summary.totalPages}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Scanlation:</span> <span className="text-white">{summary.scan}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Usuario:</span> <span className="text-white">{summary.user}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-gray-400">Fecha de Publicación:</span> <span className="text-white">{summary.publishDate}</span></div>
        </div>
        <p className="text-center text-gray-300 my-6">¿Estás seguro de que deseas subir este capítulo?</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
          <button onClick={onConfirm} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;