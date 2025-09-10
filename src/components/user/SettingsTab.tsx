// src/components/user/SettingsTab.tsx
"use client";

import { useUserPreferences, UserPreferences } from "@/context/UserPreferencesContext";
import { useAuth } from "@/context/AuthContext";

// --- Iconos ---
const SaveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const UndoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path><path d="M3 13h6a2 2 0 1 0 0-4H3"></path></svg>;

// --- Componentes reutilizables ---
const SettingsSwitch = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void; }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30">
        <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <label className="theme-switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    </div>
);

const SettingsOption = ({ label, description, value, options, onChange }: { label: string; description: string; value: string; options: string[]; onChange: (value: any) => void; }) => (
     <div className="p-4 rounded-lg bg-gray-700/30">
        <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400 mb-3">{description}</p>
        </div>
        <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
            {options.map(option => (
                 <button 
                    key={option}
                    onClick={() => onChange(option)}
                    className={`flex-1 capitalize py-1.5 text-sm font-semibold rounded-md transition-colors ${value === option ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-600/50 text-gray-300'}`}
                >
                    {option}
                 </button>
            ))}
        </div>
    </div>
);

const SettingsTab = () => {
    const { preferences, setPreference, savePreferences, isDirty, resetPreferences } = useUserPreferences();
    const { addToast } = useAuth();

    const handleSave = () => {
        savePreferences();
        addToast('¡Configuración guardada!', 'success');
    };
    
    const handleDiscard = () => {
        resetPreferences();
        addToast('Cambios descartados.', 'info');
    };
    
    return (
        <div className="max-w-screen-md mx-auto space-y-8 py-8">
             {isDirty && (
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
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <SaveIcon /> Guardar Cambios
                        </button>
                    </div>
                </div>
            )}
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Experiencia de Navegación</h3>
                <div className="space-y-4">
                    <SettingsOption
                        label="Modo de Vista"
                        description="Elige cómo se muestran las listas de mangas al explorar."
                        value={preferences.viewMode}
                        options={['grid', 'list']}
                        onChange={() => setPreference('viewMode', preferences.viewMode === 'grid' ? 'list' : 'grid')}
                    />
                    <SettingsOption
                        label="Estilo de Paginación"
                        description="Selecciona entre páginas numeradas o scroll infinito."
                        value={preferences.paginationStyle}
                        options={['pagination', 'infinite']}
                        onChange={() => setPreference('paginationStyle', preferences.paginationStyle === 'pagination' ? 'infinite' : 'pagination')}
                    />
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Contenido y Seguridad</h3>
                <div className="space-y-4">
                   <SettingsSwitch
                        label="Advertir sobre enlaces externos"
                        description="Muestra un aviso antes de redirigirte a un sitio externo para leer."
                        checked={preferences.warnOnExternalLinks}
                        onChange={() => setPreference('warnOnExternalLinks', !preferences.warnOnExternalLinks)}
                    />
                     <SettingsSwitch
                        label="Ocultar todos los enlaces externos"
                        description="Esconde completamente los botones que llevan a sitios de lectura externos."
                        checked={preferences.hideExternalLinks}
                        onChange={() => setPreference('hideExternalLinks', !preferences.hideExternalLinks)}
                    />
                     <SettingsSwitch
                        label="Mostrar contenido para adultos (+18)"
                        description="Permite la visualización de mangas catalogados como para adultos."
                        checked={preferences.showAdultContent}
                        onChange={() => setPreference('showAdultContent', !preferences.showAdultContent)}
                    />
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Privacidad y Notificaciones</h3>
                <div className="space-y-4">
                    <SettingsSwitch
                        label="Perfil Privado"
                        description="Solo los usuarios que apruebes podrán ver tu perfil y actividad."
                        checked={preferences.profileIsPrivate}
                        onChange={() => setPreference('profileIsPrivate', !preferences.profileIsPrivate)}
                    />
                    <SettingsSwitch
                        label="Ocultar contenido +18 en mi perfil"
                        description="Aunque tengas activado ver contenido adulto, este no aparecerá en tu perfil público."
                        checked={preferences.hideAdultContentOnProfile}
                        onChange={() => setPreference('hideAdultContentOnProfile', !preferences.hideAdultContentOnProfile)}
                    />
                    <SettingsSwitch
                        label="Recibir notificaciones por correo"
                        description="Recibe un email cuando haya actividad relevante (nuevos capítulos, respuestas, etc.)."
                        checked={preferences.notifyByEmail}
                        onChange={() => setPreference('notifyByEmail', !preferences.notifyByEmail)}
                    />
                </div>
            </section>
        </div>
    );
};

export default SettingsTab;