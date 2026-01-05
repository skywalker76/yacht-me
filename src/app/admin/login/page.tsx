'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Anchor, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { signIn } from '@/lib/supabase';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signIn(email, password);
            router.push('/admin');
        } catch (err) {
            setError('Credenziali non valide. Riprova.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--navy-900)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--navy-800)] border border-[var(--border)] mb-4">
                        <Anchor className="w-8 h-8 text-[var(--gold-500)]" />
                    </div>
                    <h1 className="font-serif text-3xl text-[var(--cream)]">Admin Panel</h1>
                    <p className="text-[var(--muted-foreground)] mt-2">Rimini Luxury Charter</p>
                </div>

                {/* Login Form */}
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-8">
                    <h2 className="font-serif text-xl text-[var(--cream)] mb-6 text-center">
                        Accedi
                    </h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-[var(--cream)] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@riminicharter.it"
                                required
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--cream)] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--cream)]"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Accesso in corso...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Accedi
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
                        <a
                            href="/"
                            className="text-[var(--muted-foreground)] text-sm hover:text-[var(--gold-500)] transition-colors"
                        >
                            ← Torna al sito
                        </a>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-[var(--muted-foreground)] text-xs mt-6">
                    Per creare un account admin, vai su Supabase Dashboard → Authentication → Users
                </p>
            </motion.div>
        </div>
    );
}
