// src/components/user/ProfileEditModal.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

// --- Iconos ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2"/></svg>;
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

// --- LÓGICA DE VALIDACIÓN ---
const socialLinkValidators: { [key: string]: (url: string) => boolean } = {
    twitter: (url) => url.startsWith('https://twitter.com/') || url.startsWith('https://x.com/'),
    discord: (url) => url.startsWith('https://discord.gg/') || url.startsWith('https://discord.com/users/'),
    website: (url) => url.startsWith('http://') || url.startsWith('https://'),
};

const SocialLinkInput = ({ platform, value, onChange, error }: { platform: string; value: string; onChange: (platform: string, value: string) => void; error?: string }) => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const hasError = !!error;
    
    return (
        <div>
            <label htmlFor={platform} className="block text-sm font-medium text-gray-300 mb-2">{platformName} URL</label>
            <input 
                id={platform} 
                name={platform} 
                type="url" 
                value={value} 
                onChange={(e) => onChange(platform, e.target.value)} 
                placeholder={platform === 'website' ? `https://...` : `https://${platform}.com/...`}
                className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none transition-colors ${hasError ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-[#ffbade]'}`}
            />
            {hasError && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};


interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    banner_url?: string;
    bio?: string;
    social_links?: { [key: string]: string };
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => Promise<void>; // <-- TIPO DE onSave ACTUALIZADO
}

const ProfileEditModal = ({ isOpen, onClose, onSave }: ProfileEditModalProps) => {
  const { profile, user, updateUserProfile, addToast } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    social_links: {} as { [key: string]: string },
    avatarFile: null as File | null,
    bannerFile: null as File | null,
  });
  
  // --- NUEVO ESTADO PARA ERRORES DE VALIDACIÓN ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && profile) {
      setEditData({
        username: profile.username || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
        bannerUrl: profile.banner_url || '',
        social_links: profile.social_links || {},
        avatarFile: null,
        bannerFile: null,
      });
      setErrors({}); // Limpia errores al abrir
    }
  }, [isOpen, profile]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditData(prev => ({ ...prev, [`${type}File`]: file, [`${type}Url`]: previewUrl }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialLinkChange = (platform: string, value: string) => {
    setEditData(prev => {
        const newSocials = { ...prev.social_links };
        if (value) {
            newSocials[platform] = value;
        } else {
            delete newSocials[platform];
        }
        return { ...prev, social_links: newSocials };
    });

    // Validar en tiempo real
    if (value && !socialLinkValidators[platform](value)) {
        setErrors(prev => ({ ...prev, [platform]: `Debe ser un enlace válido de ${platform}.` }));
    } else {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[platform];
            return newErrors;
        });
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    // --- VALIDACIÓN ANTES DE GUARDAR ---
    if (Object.keys(errors).length > 0) {
        addToast('Por favor, corrige los enlaces no válidos.', 'error');
        return;
    }

    setIsSaving(true);
    let updates: any = { 
        username: editData.username, 
        bio: editData.bio,
        social_links: editData.social_links
    };

    try {
      if (editData.bannerFile) {
        const filePath = `${user.id}/banner-${Date.now()}`;
        const { error } = await supabase.storage.from('profiles').upload(filePath, editData.bannerFile, { upsert: true });
        if (error) throw error;
        updates.banner_url = supabase.storage.from('profiles').getPublicUrl(filePath).data.publicUrl;
      }
      if (editData.avatarFile) {
        const filePath = `${user.id}/avatar-${Date.now()}`;
        const { error } = await supabase.storage.from('profiles').upload(filePath, editData.avatarFile, { upsert: true });
        if (error) throw error;
        updates.avatar_url = supabase.storage.from('profiles').getPublicUrl(filePath).data.publicUrl;
      }

      const success = await updateUserProfile(updates);
      if (success) {
        addToast('Perfil actualizado con éxito', 'success');
        await onSave(success);
        onClose();
      } else {
        addToast('No se pudo actualizar el perfil.', 'error');
      }
    } catch (error: any) {
      addToast(error.message || 'Error al subir archivos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Banner y Avatar (sin cambios) */}
            <div className="relative h-32 bg-gray-700 rounded-lg group">
                {editData.bannerUrl && <Image src={editData.bannerUrl} alt="Banner Preview" layout="fill" objectFit="cover" className="rounded-lg" />}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg" onClick={() => bannerInputRef.current?.click()}>
                    <UploadIcon /> <span className="ml-2">Cambiar Banner</span>
                    <input type="file" ref={bannerInputRef} onChange={e => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
                </div>
            </div>
            <div className="-mt-12 ml-6 relative w-24 h-24 rounded-full border-4 border-[#201f31] group bg-gray-800">
                {editData.avatarUrl && <Image src={editData.avatarUrl} alt="Avatar Preview" layout="fill" objectFit="cover" className="rounded-full" />}
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full" onClick={() => avatarInputRef.current?.click()}>
                    <UploadIcon />
                    <input type="file" ref={avatarInputRef} onChange={e => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
                </div>
            </div>

            {/* Campos de texto (sin cambios) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Nombre de Usuario</label>
              <input id="username" name="username" type="text" value={editData.username} onChange={handleInputChange} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Biografía</label>
              <textarea id="bio" name="bio" value={editData.bio} onChange={handleInputChange} rows={3} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" />
            </div>

            {/* --- SECCIÓN DE REDES SOCIALES ACTUALIZADA --- */}
            <div>
                <h4 className="text-lg font-semibold text-white mb-3">Redes Sociales</h4>
                <div className="space-y-4">
                    <SocialLinkInput platform="twitter" value={editData.social_links.twitter || ''} onChange={handleSocialLinkChange} error={errors.twitter} />
                    <SocialLinkInput platform="discord" value={editData.social_links.discord || ''} onChange={handleSocialLinkChange} error={errors.discord} />
                    <SocialLinkInput platform="website" value={editData.social_links.website || ''} onChange={handleSocialLinkChange} error={errors.website} />
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600/80 text-gray-300 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
            <button type="button" onClick={handleSave} disabled={isSaving || Object.keys(errors).length > 0} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;