// src/components/group/UnifiedRecruitmentTab.tsx
"use client";
import { useState } from 'react';
import RecruitmentAdminTab from './RecruitmentAdminTab'; // El panel para ver aplicaciones
import RecruitmentSettingsTab from './RecruitmentSettingsTab'; // El panel para gestionar roles
import RecruitmentTab from './RecruitmentTab'; // La vista pública para aplicar

interface UnifiedRecruitmentTabProps {
  groupId: string;
  isAdmin: boolean;
}

const UnifiedRecruitmentTab = ({ groupId, isAdmin }: UnifiedRecruitmentTabProps) => {
  const [adminTab, setAdminTab] = useState('applications');

  // Si el usuario no es admin, simplemente muestra la vista pública para aplicar a roles.
  if (!isAdmin) {
    return <RecruitmentTab groupId={groupId} isAdmin={false} />;
  }

  // Si el usuario ES admin, muestra el panel de control completo.
  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-white mb-6">Panel de Reclutamiento</h2>
      
      {/* Pestañas internas para el administrador */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setAdminTab('applications')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            adminTab === 'applications' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Gestionar Aplicaciones
        </button>
        <button
          onClick={() => setAdminTab('postings')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            adminTab === 'postings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Gestionar Posiciones
        </button>
      </div>

      {/* Contenido de las pestañas del administrador */}
      <div>
        {adminTab === 'applications' && <RecruitmentAdminTab groupId={groupId} />}
        {adminTab === 'postings' && <RecruitmentSettingsTab groupId={groupId} />}
      </div>
    </div>
  );
};

export default UnifiedRecruitmentTab;