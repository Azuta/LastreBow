// src/components/group/CreateGroupModal.tsx
"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (file: File, filePath: string) => {
  const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_GROUPS_BUCKET_NAME;
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_GROUPS_PUBLIC_URL;

  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error('Variables de entorno de R2 para grupos no configuradas.');
  }

  const fileContent = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: filePath,
    Body: Buffer.from(fileContent),
    ContentType: file.type,
  });

  console.log(command)

  await R2.send(command);
  return `${R2_PUBLIC_URL}/${filePath}`;
};

const CreateGroupModal = ({ isOpen, onClose }: CreateGroupModalProps) => {
  const { user, createGroup, updateGroupImagesAndSocials, addToast } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [socials, setSocials] = useState({ twitter: '', discord: '', website: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null); // <--- NUEVO estado para el error
  const router = useRouter();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  
  // <--- NUEVO handler para limpiar el error al escribir
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      if (nameError) setNameError(null);
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSocials(prev => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        addToast('Debes iniciar sesión para crear un grupo.', 'error');
        return;
    }
    if (!name) {
        addToast('El nombre del grupo es obligatorio.', 'error');
        return;
    }

    setIsSaving(true);
    setNameError(null);
    
    try {
      // Paso 1: Crear el registro del grupo para obtener el ID
      const newGroupId = await createGroup(name, description);
      if (!newGroupId) {
          // Si createGroup devuelve null, es un error (probablemente de nombre duplicado)
          setNameError('Este nombre de grupo ya existe.');
          return;
      }

      let logoUrl = null;
      let bannerUrl = null;

      // Paso 2: Subir las imágenes con el ID del grupo
      if (logoFile) {
        const logoPath = `${newGroupId}/logo.jpg`;
        logoUrl = await uploadFile(logoFile, logoPath);
      }
      if (bannerFile) {
        const bannerPath = `${newGroupId}/banner.jpg`;
        bannerUrl = await uploadFile(bannerFile, bannerPath);
      }
      
      // Paso 3: Actualizar el registro del grupo con las URLs y redes sociales
      const updates = { logo_url: logoUrl, banner_url: bannerUrl, social_links: socials };
      await updateGroupImagesAndSocials(newGroupId, updates);

      addToast(`Grupo "${name}" creado con éxito.`, 'success');
      onClose();
      router.push(`/group/${newGroupId}`);

    } catch (error) {
      console.error("Error al crear el grupo:", error);
      addToast('Hubo un error al crear el grupo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Crear Nuevo Grupo</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            {/* Banner Preview */}
            <div className="relative w-full h-24 bg-gray-700 rounded-lg group overflow-hidden">
                {bannerPreview && <Image src={bannerPreview} alt="Banner Preview" fill style={{ objectFit: "cover" }} className="rounded-lg" sizes="100vw" />}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg pointer-events-none group-hover:pointer-events-auto" onClick={() => bannerInputRef.current?.click()}>
                    <UploadIcon /> <span className="ml-2">Subir Banner</span>
                    <input type="file" ref={bannerInputRef} onChange={e => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
                </div>
            </div>
          {/* Logo Preview */}
            <div className="relative -mt-12 w-24 h-24 rounded-full border-4 border-[#201f31] shadow-lg group overflow-hidden bg-gray-800 flex items-center justify-center">
                {/* CAMBIO: Se añade rounded-full a la imagen */}
                {logoPreview && <Image src={logoPreview} alt="Logo Preview" fill style={{ objectFit: "cover" }} className="rounded-full" sizes="96px" />}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full" onClick={() => logoInputRef.current?.click()}>
                    <UploadIcon />
                    <input type="file" ref={logoInputRef} onChange={e => handleFileChange(e, 'logo')} className="hidden" accept="image/*" />
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-2">Nombre del Grupo</label>
            <input
                id="group-name"
                type="text"
                value={name}
                onChange={handleNameChange} // <--- CAMBIO: Nuevo handler
                className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${nameError ? 'border-red-500 ring-red-500' : 'focus:ring-[#ffbade]'}`}
                required
            />
            {nameError && ( // <--- NUEVO: Mensaje de error
                <p className="mt-2 text-sm text-red-400">
                    {nameError} Si este nombre te pertenece, <Link href="/report-problem" className="underline hover:text-white">repórtalo aquí</Link>.
                </p>
            )}
          </div>
          <div>
            <label htmlFor="group-description" className="block text-sm font-medium text-gray-300 mb-2">Descripción (Opcional)</label>
            <textarea id="group-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Redes Sociales</label>
            <input type="url" value={socials.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} placeholder="URL de Twitter" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 mb-2" />
            <input type="url" value={socials.discord} onChange={e => handleSocialChange('discord', e.target.value)} placeholder="URL de Discord" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 mb-2" />
            <input type="url" value={socials.website} onChange={e => handleSocialChange('website', e.target.value)} placeholder="URL de Sitio Web" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
            <button type="submit" disabled={isSaving || !name} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {isSaving ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;