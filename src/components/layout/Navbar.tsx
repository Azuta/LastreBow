// src/components/layout/Navbar.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserMenu from './UserMenu';
import NotificationsPanel from './NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

const Navbar = () => {
    // 1. Obtenemos las notificaciones reales desde el AuthContext
    const { isLoggedIn, profile, notifications } = useAuth();
    const [isDayMode, setIsDayMode] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // 2. Calculamos las notificaciones no leídas de forma dinámica
    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => { document.body.classList.toggle('day-mode', isDayMode); }, [isDayMode]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const navClasses = `shadow-lg sticky top-0 z-50 ${isDayMode ? 'bg-white' : 'bg-[#201f31]'}`;
    const brandClasses = `flex-shrink-0 text-2xl font-bold ${isDayMode ? 'text-gray-900' : 'text-white'}`;
    const linkClasses = `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isDayMode ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

    return (
        <nav className={navClasses}>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        {/* Se mantiene tu logo y enlaces de navegación */}
                        <Link href="/" className="flex-shrink-0">
                             <Image src="/azuta.svg" alt="Azuta Logo" width={100} height={40} />
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/browse/all" className={linkClasses}>Explorar</Link>
                                <Link href="/groups" className={linkClasses}>Grupos</Link>
                                <Link href="/marketplace" className={linkClasses}>Marketplace</Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearchSubmit}>
                            <input 
                                type="text" 
                                placeholder="Buscar manga..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade] hidden sm:block ${isDayMode ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white'}`} 
                            />
                        </form>
                        <label className="theme-switch"><input type="checkbox" checked={isDayMode} onChange={() => setIsDayMode(!isDayMode)} /><span className="slider"></span></label>
                        
                        {isLoggedIn && profile ? (
                            <>
                                {/* 3. El botón de notificaciones ahora es funcional */}
                                <div className="relative" ref={notificationsRef}>
                                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2 rounded-full transition-colors ${isDayMode ? 'text-gray-500 hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700'}`}>
                                        <BellIcon />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {/* 4. El panel recibe las props necesarias para funcionar con tu lógica de cierre */}
                                    <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                                </div>

                                <div className="relative" ref={userMenuRef}>
                                    <img src={profile.avatar_url} className="w-8 h-8 rounded-full cursor-pointer" alt="User Avatar" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} />
                                    {isUserMenuOpen && <UserMenu />}
                                </div>
                            </>
                        ) : (
                            <Link href="/login" className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;