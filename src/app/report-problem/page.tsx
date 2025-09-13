// src/app/report-problem/page.tsx
"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';

const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

const ReportProblemPage = () => {
    const [problemType, setProblemType] = useState('name-dispute');
    const [details, setDetails] = useState('');
    // Estado para los archivos: un array de objetos con el archivo y su URL
    const [screenshots, setScreenshots] = useState<{file: File, previewUrl: string}[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = e.target.files?.[0];
        if (newFile) {
            if (screenshots.length >= 3) {
                setFileError("Solo puedes subir un máximo de 3 archivos.");
            } else {
                setScreenshots(prev => [...prev, { file: newFile, previewUrl: URL.createObjectURL(newFile) }]);
                setFileError(null);
            }
        }
        e.target.value = ''; // Limpiar el input para permitir subir el mismo archivo de nuevo
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setScreenshots(prev => prev.filter((_, index) => index !== indexToRemove));
        if (fileError) setFileError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Aquí iría la lógica para enviar el reporte
        console.log({ 
            problemType, 
            details, 
            files: screenshots.map(s => s.file) 
        });
        alert('Reporte enviado. ¡Gracias por tu ayuda!');
        setIsSubmitting(false);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
                <div className="bg-[#201f31] p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-white mb-2">Reportar un Problema</h1>
                    <p className="text-gray-400 mb-6">Usa este formulario para reportar nombres de grupos duplicados o cualquier otro problema.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de problema</label>
                            <select value={problemType} onChange={(e) => setProblemType(e.target.value)} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]">
                                <option value="name-dispute">Disputa de nombre de grupo</option>
                                <option value="bug">Error en la página</option>
                                <option value="inappropriate-content">Contenido inapropiado</option>
                                <option value="corrupt-files">Archivos corruptos o faltantes</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción detallada</label>
                            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Adjuntar imágenes (Opcional, máx. 3)</label>
                            {/* Input para un solo archivo */}
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#ffbade] hover:file:bg-violet-100" 
                                accept="image/*"
                            />
                            {fileError && <p className="mt-2 text-red-400 text-sm">{fileError}</p>}
                            
                            {/* Previsualización y eliminación */}
                            {screenshots.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-4">
                                    {screenshots.map((item, index) => (
                                        <div key={item.file.name} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                            <Image 
                                                src={item.previewUrl} 
                                                alt={item.file.name} 
                                                width={96} 
                                                height={96} 
                                                className="object-cover"
                                            />
                                            <button 
                                                onClick={() => handleRemoveFile(index)} 
                                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <CloseIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={isSubmitting || !details || !!fileError} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
};

export default ReportProblemPage;