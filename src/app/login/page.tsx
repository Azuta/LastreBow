// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, login, addToast } = useAuth(); // Usaremos login para Discord
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await signInWithEmail(email, password);
    if (success) {
      addToast('¡Bienvenido de nuevo!', 'success');
      router.push('/'); // Redirige al inicio
    } else {
      setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
    }
    setIsLoading(false);
  };

  const handleDiscordLogin = async () => {
    await login(); // Esta es la función de login con OAuth de tu AuthContext
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a24] p-4">
        <div className="w-full max-w-md bg-[#201f31] p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Iniciar Sesión</h2>
          <p className="text-center text-gray-400 mb-6">Accede a tu cuenta para continuar.</p>
          
          {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#201f31] text-gray-500">O continúa con</span>
            </div>
          </div>

          <button onClick={handleDiscordLogin} className="w-full flex items-center justify-center gap-2 bg-[#5865F2] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            {/* Icono de Discord (SVG) */}
            <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8245-.618 1.2525a17.2969 17.2969 0 00-5.4624 0 17.5951 17.5951 0 00-.618-1.2525.0741.0741 0 00-.0785-.0371A19.7157 19.7157 0 003.6796 4.3698a.0741.0741 0 00-.0371.0785c.1755.9378.3428 1.921.4962 2.9158a16.5847 16.5847 0 00-1.5663 2.0468.0741.0741 0 00.0128.1024c.759  .5368 1.5032.9898 2.2132 1.3731a.0741.0741 0 00.0869-.004c.0438-.0299.0741-.07.0869-.1182a13.3313 13.3313 0 00-1.129-2.111.0741.0741 0 00.0128-.1182c.0299-.0128.07-.0128.1024-.0128a15.4383 15.4383 0 002.2618 1.3432.0741.0741 0 00.0869 0c.262-.1182.5112-.2492.7476-.393a12.7199 12.7199 0 00-1.8894-1.2155.0741.0741 0 00-.0615-.131c-.3428-.0299-.6728-.0427-.988-.0427-1.1031 0-2.1444.262-3.1189.7476a.0741.0741 0 00-.0427.0869c.07.388.1654.8117.2748 1.2525a18.2384 18.2384 0 004.7212 1.83.0741.0741 0 00.0869 0 16.529 16.529 0 004.7212-1.83c.1094-.4408.2048-.8645.2748-1.2525a.0741.0741 0 00-.0427-.0869 15.4383 15.4383 0 00-3.1189-.7476c-.3151 0-.6451.0128-.988.0427a.0741.0741 0 00-.0615.131 12.7199 12.7199 0 00-1.8894 1.2155c.2364.1438.4856.2748.7476.393a.0741.0741 0 00.0869 0 15.4383 15.4383 0 002.2618-1.3432.0741.0741 0 00.0128.1182c-.3428.691-.7736 1.3522-1.129 2.111a.0741.0741 0 00.0869.1182c.0128 0 .0427-.0128.0574-.0299a13.3313 13.3313 0 002.2132-1.3731.0741.0741 0 00.0128-.1024 16.5847 16.5847 0 00-1.5663-2.0468c.1534-.9948.3216-1.978.4962-2.9158a.0741.0741 0 00-.0371-.0785z" fill="currentColor"/></svg>
            <span>Iniciar Sesión con Discord</span>
          </button>

          <p className="text-center text-sm text-gray-400 mt-8">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-semibold text-[#ffbade] hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;