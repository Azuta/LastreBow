// src/app/browse/all/error.tsx
"use client";

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

// Icono para la página de error
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffbade]">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default function BrowseError({ error }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
            <LockIcon />
            <h1 className="mt-6 text-4xl font-bold text-white">Acceso Restringido</h1>
            <p className="mt-4 text-lg text-gray-400 max-w-md">
                No pudimos encontrar la lista de este usuario. Puede que sea privada, que el usuario no exista, o que el enlace sea incorrecto.
            </p>
            <p className="mt-2 text-gray-500 text-sm">
                (Error: {error.message})
            </p>
            <Link href="/browse/all" className="mt-8 px-6 py-3 bg-[#ffbade] text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                Volver a Explorar
            </Link>
        </div>
    </>
  );
}