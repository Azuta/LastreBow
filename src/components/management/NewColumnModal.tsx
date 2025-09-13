// src/components/management/NewColumnModal.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NewColumnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddColumn: (name: string) => void;
}

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

const NewColumnModal = ({ isOpen, onClose, onAddColumn }: NewColumnModalProps) => {
    const [columnName, setColumnName] = useState('');
    const { addToast } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (columnName.trim() === '') {
            addToast('El nombre de la columna no puede estar vacío.', 'error');
            return;
        }
        onAddColumn(columnName);
        setColumnName('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Nueva Columna</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="columnName" className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Columna</label>
                        <input
                            id="columnName"
                            type="text"
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            placeholder="Ej: Revisión Final"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Crear</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewColumnModal;