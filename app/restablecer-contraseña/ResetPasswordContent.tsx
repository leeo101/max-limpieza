'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailSent(true);
        if (result.resetLink) {
          console.log('Reset link (dev mode):', result.resetLink);
        }
      } else {
        setError(result.error || 'Error al enviar el email de recuperación');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Error al restablecer la contraseña');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6 group">
              <div className="relative w-24 h-24 mx-auto group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="MAX Limpieza Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {token ? 'Nueva contraseña' : 'Recuperar contraseña'}
            </h1>
            <p className="text-gray-600 mt-2">
              {token 
                ? 'Ingresá tu nueva contraseña' 
                : 'Ingresá tu email para recuperar tu acceso'}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Contraseña restablecida!</h2>
                <p className="text-gray-600 mb-4">
                  Tu contraseña fue actualizada correctamente
                </p>
                <Link
                  href="/iniciar-sesion"
                  className="inline-block bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 transition"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : token ? (
              // Reset password form (with token)
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                    placeholder="Repetí tu contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
              </form>
            ) : emailSent ? (
              // Email sent confirmation
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Email enviado!</h2>
                <p className="text-gray-600 mb-4">
                  Revisá tu bandeja de entrada y hacé clic en el enlace para restablecer tu contraseña
                </p>
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                >
                  ¿No recibiste el email? Intentar de nuevo
                </button>
              </div>
            ) : (
              // Forgot password form
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                    placeholder="tu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/iniciar-sesion" className="text-sky-600 hover:text-sky-700 font-semibold">
                  Volvé al login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
