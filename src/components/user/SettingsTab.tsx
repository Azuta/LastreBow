// src/components/user/SettingsTab.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useUserPreferences } from "@/context/UserPreferencesContext";

const SettingsSwitch = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30">
        <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <label className="theme-switch">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className="slider"></span>
        </label>
    </div>
);

const SettingsTab = () => {
    const { updateUserProfile } = useAuth();
    const {
        showAdultContent,
        setShowAdultContent,
        hideAdultContentOnProfile,
        setHideAdultContentOnProfile
    } = useUserPreferences();

    const handleShowAdultChange = (value: boolean) => {
        setShowAdultContent(value);
        updateUserProfile({ show_adult_content: value });
    };

    const handleHideAdultOnProfileChange = (value: boolean) => {
        setHideAdultContentOnProfile(value);
        updateUserProfile({ hide_adult_content_on_profile: value });
    };
    
    return (
        <div className="max-w-screen-md mx-auto space-y-8 py-8">
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Privacidad y Contenido</h3>
                <div className="space-y-4">
                    <SettingsSwitch
                        label="Mostrar Contenido Adulto (+18)"
                        description="Permitir la visualización de mangas para adultos en toda la página."
                        checked={showAdultContent}
                        onChange={handleShowAdultChange}
                    />
                    <SettingsSwitch
                        label="Ocultar Contenido Adulto en mi Perfil"
                        description="Evita que los mangas para adultos aparezcan en tus listas públicas de favoritos e historial."
                        checked={hideAdultContentOnProfile}
                        onChange={handleHideAdultOnProfileChange}
                    />
                </div>
            </section>
        </div>
    );
};

export default SettingsTab;