// azuta/mangauserpage/MangaUserPage-main/src/app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { useRouter } from 'next/navigation'; // <-- Importa useRouter

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const router = useRouter(); // <-- Obtén la instancia del router

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await signUpWithEmail(username, email, password);

    if (success) {
      // Al tener éxito, el listener de AuthContext se activará y
      // redirigirá al usuario a /welcome si es necesario.
      // Nosotros solo lo sacamos de la página de registro.
      router.push('/');
    } else {
      // El error específico ya se muestra con addToast, pero mantenemos un genérico.
      setError('No se pudo crear la cuenta. El email o usuario puede que ya exista.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a24] p-4">
        <div className="w-full max-w-md bg-[#201f31] p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-white mb-2">Crear Cuenta</h2>
          <p className="text-center text-gray-400 mb-6">Únete a la comunidad.</p>
          
          {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300">Nombre de Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-2 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" required />
              <PasswordStrengthMeter password={password} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-[#ffbade] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;