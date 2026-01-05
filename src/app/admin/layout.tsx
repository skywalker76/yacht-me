'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Ship,
    Calendar,
    LogOut,
    Menu,
    X,
    Anchor,
    ChevronLeft,
    Settings,
    FileText,
    Users,
    Briefcase,
} from 'lucide-react';
import { supabase, getUser, signOut } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Ship, label: 'Flotta', href: '/admin/fleet' },
    { icon: Calendar, label: 'Prenotazioni', href: '/admin/bookings' },
    { icon: Users, label: 'Clienti', href: '/admin/customers' },
    { icon: Briefcase, label: 'Servizi', href: '/admin/services' },
    { icon: FileText, label: 'Articoli', href: '/admin/articles' },
    { icon: Settings, label: 'Impostazioni', href: '/admin/settings' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ email?: string | null } | null>(null);

    // Skip auth check for login page
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                const currentUser = await getUser();
                if (!currentUser) {
                    router.push('/admin/login');
                } else {
                    setUser({ email: currentUser.email });
                }
            } catch {
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event) => {
                if (event === 'SIGNED_OUT') {
                    router.push('/admin/login');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router, isLoginPage]);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Show login page without sidebar
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--navy-900)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Anchor className="w-12 h-12 text-[var(--gold-500)] animate-pulse" />
                    <p className="text-[var(--muted-foreground)]">Caricamento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--navy-900)] flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--navy-800)] border-r border-[var(--border)] transform transition-transform lg:transform-none',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <Link href="/admin" className="flex items-center gap-3">
                                <Anchor className="w-7 h-7 text-[var(--gold-500)]" />
                                <div>
                                    <span className="font-serif text-lg text-[var(--cream)] block">
                                        Admin Panel
                                    </span>
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        YACHT~ME
                                    </span>
                                </div>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-[var(--muted-foreground)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--cream)] hover:bg-[var(--navy-700)]'
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-[var(--border)]">
                        <div className="mb-3 px-4">
                            <p className="text-xs text-[var(--muted-foreground)]">Connesso come</p>
                            <p className="text-sm text-[var(--cream)] truncate">
                                {user?.email || 'Admin'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Esci</span>
                        </button>
                    </div>

                    {/* Back to Site */}
                    <div className="p-4 border-t border-[var(--border)]">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Torna al sito
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 bg-[var(--navy-800)] border-b border-[var(--border)] flex items-center px-6 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-[var(--cream)]"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-serif text-lg text-[var(--cream)]">
                        Admin Panel
                    </span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
