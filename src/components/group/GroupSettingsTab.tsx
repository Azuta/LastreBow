// src/components/group/GroupSettingsTab.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import { ScanGroup } from '@/types/AniListResponse';

const SaveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const UndoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path><path d="M3 13h6a2 2 0 1 0 0-4H3"></path></svg>;

const supabase = createClient();

interface GroupSettingsTabProps {
    groupData: ScanGroup;
    isAdmin: boolean;
    onSettingsSaved: () => void;
}

// LÓGICA CORREGIDA PARA PERMITIR TEXTOS LARGOS
const SettingsSwitch = ({ label, description, checked, onChange, disabled = false }: { label: string; description: string; checked: boolean; onChange: () => void; disabled?: boolean; }) => (
    <div className="flex justify-between p-4 rounded-lg bg-gray-700/30">
        <div className="flex-1 flex flex-col pr-4">
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="flex-shrink-0">
            <label className={`theme-switch ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
                <span className="slider"></span>
            </label>
        </div>
    </div>
);

const GroupSettingsTab = ({ groupData, isAdmin, onSettingsSaved }: GroupSettingsTabProps) => {
    const { addToast } = useAuth();
    const [settings, setSettings] = useState({
        kanbanIsPublic: groupData.kanban_is_public,
        allowProjectProposals: groupData.allow_project_proposals
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const hasUnsavedChanges = 
            settings.kanbanIsPublic !== groupData.kanban_is_public ||
            settings.allowProjectProposals !== groupData.allow_project_proposals;
        setHasChanges(hasUnsavedChanges);
    }, [settings, groupData]);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('scan_groups')
            .update({
                kanban_is_public: settings.kanbanIsPublic,
                allow_project_proposals: settings.allowProjectProposals
            })
            .eq('id', groupData.id);

        if (error) {
            console.error("Error saving group settings:", error);
            addToast('Error al guardar la configuración.', 'error');
        } else {
            addToast('Configuración guardada.', 'success');
            onSettingsSaved(); // Recargar datos en la página principal
        }
        setIsSaving(false);
    };

    const handleDiscard = () => {
        setSettings({
            kanbanIsPublic: groupData.kanban_is_public,
            allowProjectProposals: groupData.allow_project_proposals
        });
        addToast('Cambios descartados.', 'info');
    };
    
    if (!isAdmin) {
        return <p className="text-center text-gray-400 py-8">No tienes permisos para ver esta página.</p>;
    }

    return (
        <div className="max-w-screen-md mx-auto space-y-8 py-8">
            {hasChanges && (
                <div className="sticky top-20 z-10 p-4 bg-[#2b2d42]/90 backdrop-blur-sm rounded-lg border border-gray-700 flex justify-between items-center">
                    <p className="text-white font-semibold">Tienes cambios sin guardar.</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleDiscard}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600/80 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                        >
                            <UndoIcon /> Descartar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <SaveIcon /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            )}
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Configuración del Grupo</h3>
                <div className="space-y-4">
                    <SettingsSwitch
                        label="Tablero Kanban Público"
                        description="Permite que cualquier persona (no miembros) vea el estado de tus proyectos en el tablero Kanban. Si está desactivado, solo los miembros pueden verlo."
                        checked={settings.kanbanIsPublic}
                        onChange={() => setSettings(prev => ({ ...prev, kanbanIsPublic: !prev.kanbanIsPublic }))}
                        disabled={!isAdmin}
                    />
                    <SettingsSwitch
                        label="Permitir Sugerencias de Proyectos"
                        description="Si está activado, los usuarios podrán sugerir mangas para que tu grupo los traduzca."
                        checked={settings.allowProjectProposals}
                        onChange={() => setSettings(prev => ({ ...prev, allowProjectProposals: !prev.allowProjectProposals }))}
                        disabled={!isAdmin}
                    />
                </div>
            </section>
        </div>
    );
};

export default GroupSettingsTab;