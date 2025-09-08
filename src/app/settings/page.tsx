// src/app/settings/page.tsx
"use client";

import Navbar from '@/components/layout/Navbar';
import { useUserPreferences } from '@/context/UserPreferencesContext';

// Componente reutilizable para un switch de configuración
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

// Componente reutilizable para una opción con botones
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


const SettingsPage = () => {
    const {
        viewMode,
        paginationStyle,
        warnOnExternalLinks,
        hideExternalLinks,
        toggleViewMode,
        togglePaginationStyle,
        setWarnOnExternalLinks,
        setHideExternalLinks,
    } = useUserPreferences();

    return (
        <>
            <Navbar />
            <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Configuración</h1>

                <div className="space-y-10">
                    {/* Sección de Experiencia de Lectura */}
                    <section>
                        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Experiencia de Navegación</h2>
                        <div className="space-y-4">
                            <SettingsOption
                                label="Modo de Vista"
                                description="Elige cómo se muestran las listas de mangas al explorar."
                                value={viewMode}
                                options={['grid', 'list']}
                                onChange={toggleViewMode}
                            />
                            <SettingsOption
                                label="Estilo de Paginación"
                                description="Selecciona entre páginas numeradas o scroll infinito."
                                value={paginationStyle}
                                options={['pagination', 'infinite']}
                                onChange={togglePaginationStyle}
                            />
                        </div>
                    </section>
                    
                    {/* Sección de Contenido */}
                    <section>
                         <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Contenido y Seguridad</h2>
                         <div className="space-y-4">
                            <SettingsSwitch
                                label="Advertir sobre enlaces externos"
                                description="Muestra un aviso antes de redirigirte a un sitio externo para leer."
                                checked={warnOnExternalLinks}
                                onChange={() => setWarnOnExternalLinks(!warnOnExternalLinks)}
                            />
                             <SettingsSwitch
                                label="Ocultar todos los enlaces externos"
                                description="Esconde completamente los botones que llevan a sitios de lectura externos."
                                checked={hideExternalLinks}
                                onChange={() => setHideExternalLinks(!hideExternalLinks)}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
};

export default SettingsPage;