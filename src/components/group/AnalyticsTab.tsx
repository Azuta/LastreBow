// src/components/group/AnalyticsTab.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const MOCK_PROJECT_VIEWS = [
    { name: 'Berserk', views: 4820 },
    { name: 'Chainsaw Man', views: 3500 },
    { name: 'One Piece', views: 2800 },
    { name: 'Solo Leveling', views: 2500 },
    { name: 'Nano Machine', views: 1800 },
];

const MOCK_VIEWS_OVER_TIME = [
    { name: 'Ene', views: 1200 }, { name: 'Feb', views: 1800 }, { name: 'Mar', views: 1500 },
    { name: 'Abr', views: 2200 }, { name: 'May', views: 2500 }, { name: 'Jun', views: 3100 },
];

const AnalyticsTab = () => {
    return (
        <div className="py-8 space-y-12">
            <section>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Vistas por Proyecto (Últimos 30 días)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_PROJECT_VIEWS} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <XAxis type="number" stroke="#888888" />
                        <YAxis type="category" dataKey="name" stroke="#888888" width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#201f31', border: '1px solid #4a5568' }} cursor={{fill: '#ffffff10'}}/>
                        <Bar dataKey="views" fill="#ffbade" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Crecimiento de Vistas Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={MOCK_VIEWS_OVER_TIME}>
                        <XAxis dataKey="name" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip contentStyle={{ backgroundColor: '#201f31', border: '1px solid #4a5568' }} />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#ffbade" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
};

export default AnalyticsTab;