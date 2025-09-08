// src/components/layout/NotificationsPanel.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const NotificationsPanel = () => {
    const { user, markNotificationsAsRead } = useAuth();

    if (!user) return null;

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#2b2d42] rounded-lg shadow-lg z-50 border border-gray-700 max-h-96 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-bold text-white">Notificaciones</h3>
                <button onClick={markNotificationsAsRead} className="text-sm text-[#ffbade] hover:underline">Marcar como leídas</button>
            </div>
            <div className="overflow-y-auto">
                {user.notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center p-4">No tienes notificaciones.</p>
                ) : (
                    user.notifications.map(notif => (
                        <Link href={notif.link} key={notif.id}>
                            <div className={`p-3 border-b border-gray-700/50 hover:bg-gray-700/40 ${!notif.read ? 'bg-indigo-900/30' : ''}`}>
                                <p className="text-sm text-gray-200">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;