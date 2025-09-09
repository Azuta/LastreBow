// src/components/group/RecruitmentTab.tsx
"use client";
import { useState } from 'react';

const MOCK_ROLES = [
    { role: 'Traductor (JP-ES)', description: 'Se requiere nivel N2 o superior y experiencia previa.', status: 'open' },
    { role: 'Cleaner', description: 'Experiencia en limpieza de SFX complejos. Se requiere prueba.', status: 'open' },
    { role: 'Typesetter', description: 'Manejo avanzado de estilos de capa de Photoshop.', status: 'closed' },
];

const RecruitmentTab = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Aplicación enviada (simulación). ¡Gracias!');
        // Aquí iría la lógica para enviar el formulario
    };

    return (
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <h2 className="text-2xl font-bold text-white">Únete al Equipo</h2>
                <p className="text-gray-400">Buscamos gente apasionada para ayudarnos a traer más proyectos a la comunidad.</p>
                {MOCK_ROLES.map(r => (
                    <div key={r.role} className={`p-3 rounded-lg ${r.status === 'open' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-white">{r.role}</h4>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {r.status === 'open' ? 'Abierto' : 'Cerrado'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{r.description}</p>
                    </div>
                ))}
            </div>
            <div className="md:col-span-2 bg-[#201f31] p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Formulario de Aplicación</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (campos del formulario) */}
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Enviar Aplicación</button>
                </form>
            </div>
        </div>
    );
};

export default RecruitmentTab;