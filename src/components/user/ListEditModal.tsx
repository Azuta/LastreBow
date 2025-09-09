// src/components/user/ListEditModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { UserList } from '@/types/AniListResponse';

interface ListEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listData: { name: string; description: string; is_public: boolean }) => void;
  existingList?: UserList | null;
}

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ListEditModal = ({ isOpen, onClose, onSave, existingList }: ListEditModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (existingList) {
      setName(existingList.name);
      setDescription(existingList.description);
      setIsPublic(existingList.is_public ?? true);
    } else {
      // Reset form when opening for a new list
      setName('');
      setDescription('');
      setIsPublic(true);
    }
  }, [existingList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, is_public: isPublic });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{existingList ? 'Editar Lista' : 'Crear Nueva Lista'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="list-name" className="block text-sm font-medium text-gray-300 mb-2">Nombre de la Lista</label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
              required
            />
          </div>
          <div>
            <label htmlFor="list-description" className="block text-sm font-medium text-gray-300 mb-2">Descripción (Opcional)</label>
            <textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
            />
          </div>
           <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30">
              <div>
                  <h4 className="font-semibold text-white">Lista Pública</h4>
                  <p className="text-sm text-gray-400">Otros usuarios podrán ver esta lista en tu perfil.</p>
              </div>
              <label className="theme-switch">
                  <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                  <span className="slider"></span>
              </label>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
            <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListEditModal;