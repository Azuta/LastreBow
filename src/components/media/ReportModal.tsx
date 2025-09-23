"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import { CommentType } from './CommentCard';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    commentToReport: CommentType | null;
}

const supabase = createClient();

const ReportModal = ({ isOpen, onClose, commentToReport }: ReportModalProps) => {
    const { profile, addToast } = useAuth();
    const [reportType, setReportType] = useState('');
    const [reason, setReason] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile) {
            // Dejamos vacío para que el usuario lo llene si quiere.
            setContactEmail(''); 
        }
    }, [profile]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportType || !reason.trim() || !commentToReport || !profile) return;

        setIsSubmitting(true);
        try {
            // 1. Guardar el reporte en la base de datos
            const { error: dbError } = await supabase.from('reports').insert({
                comment_id: commentToReport.id,
                reported_user_id: commentToReport.profile.id,
                reporter_user_id: profile.id,
                reporter_contact_email: contactEmail,
                report_type: reportType,
                reason: reason,
            });

            if (dbError) throw dbError;

            // 2. Invocar la Edge Function para enviar el correo
            const { error: functionError } = await supabase.functions.invoke('send-report-email', {
                body: {
                    reportedUsername: commentToReport.profile.username,
                    reporterUsername: profile.username,
                    reporterContactEmail: contactEmail,
                    reportType,
                    reason,
                    commentContent: commentToReport.content,
                },
            });

            if (functionError) throw functionError;
            
            addToast('Reporte enviado con éxito. Gracias por tu ayuda.', 'success');
            onClose();
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
            addToast('No se pudo enviar el reporte. Inténtalo de nuevo.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !commentToReport) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#201f31] rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white">Reportar Comentario</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Estás reportando un comentario de <span className="font-semibold text-white">{commentToReport.profile.username}</span>.
                        </p>
                        
                        <div className="mt-4 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                            <p className="text-xs text-gray-500">Contenido del comentario:</p>
                            <p className="text-sm text-gray-300 italic">"{commentToReport.content}"</p>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="reportType" className="block text-sm font-medium text-gray-300">Motivo del Reporte</label>
                                <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} required className="mt-1 block w-full bg-gray-700/50 border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-[#ffbade] focus:border-[#ffbade]">
                                    <option value="">Selecciona un motivo...</option>
                                    <option value="Spam">Spam o Publicidad</option>
                                    <option value="Acoso">Acoso o Discurso de Odio</option>
                                    <option value="Contenido Inapropiado (NSFW)">Contenido Inapropiado (NSFW)</option>
                                    <option value="Informacion Falsa">Información Falsa</option>
                                    <option value="Otro">Otro (explícalo abajo)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-300">Explica la wea</label>
                                <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className="mt-1 block w-full bg-gray-700/50 border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-[#ffbade] focus:border-[#ffbade] resize-none"></textarea>
                            </div>
                             <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300">Email de Contacto (Opcional)</label>
                                <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 block w-full bg-gray-700/50 border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-[#ffbade] focus:border-[#ffbade]" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;