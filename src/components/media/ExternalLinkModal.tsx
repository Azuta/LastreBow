"use client";
import { useState } from 'react';

const ExternalLinkModal = ({ isOpen, onClose, onConfirm, onHideAll }: { isOpen: boolean; onClose: () => void; onConfirm: (dontShowAgain: boolean) => void; onHideAll: () => void; }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 modal-enter">
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/50 mb-4">
                        <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Redireccionando...</h3>
                    <p className="text-sm text-gray-400 mt-2">Estás a punto de viajar a la página directa del Scan para leer este capítulo.</p>
                </div>
                
                <div className="mt-6 flex flex-col items-start">
                    <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-2">No volver a mostrar este aviso.</span>
                    </label>
                </div>

                <div className="mt-4 flex gap-4">
                    <button onClick={onClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors">No</button>
                    <button onClick={() => onConfirm(dontShowAgain)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-opacity">Sí, llévame allí</button>
                </div>
                
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <button onClick={onHideAll} className="w-full px-4 py-2 bg-red-900/50 text-red-300 rounded-lg text-sm font-semibold hover:bg-red-800/60 transition-colors">
                        No mostrar enlaces externos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExternalLinkModal;