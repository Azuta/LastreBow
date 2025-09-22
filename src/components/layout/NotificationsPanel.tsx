// src/components/layout/NotificationsPanel.tsx
"use client";
import { useAuth, Notification } from '@/context/AuthContext';
import Link from 'next/link';

const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CheckCircleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();

    if (!isOpen) return null;

    const handleNotificationClick = (notification: Notification) => {
        markNotificationAsRead(notification.id);
        onClose();
    };

    const unreadNotifications = notifications.filter(n => !n.is_read);

    return (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-[#201f31] border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notificaciones</h3>
                {unreadNotifications.length > 0 && (
                    <button onClick={markAllNotificationsAsRead} className="text-sm text-indigo-400 hover:underline">
                        Marcar todas como leídas
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <Link 
                            key={notif.id} 
                            href={notif.content.cta || '#'}
                            onClick={() => handleNotificationClick(notif)}
                            className={`block p-3 border-b border-gray-800/50 hover:bg-gray-700/30 ${!notif.is_read ? 'bg-indigo-900/20' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notif.is_read ? 'bg-[#ffbade]' : 'bg-gray-600'}`}></div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-300">{notif.content.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12 px-4">
                        <BellIcon />
                        <p className="text-sm text-gray-400 mt-2">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;