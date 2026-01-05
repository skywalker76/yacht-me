'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ship, Calendar, DollarSign, Users, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { getBoats, getBookingsWithBoat } from '@/lib/supabase';
import type { Boat, Booking } from '@/lib/types';

interface DashboardStats {
    totalBoats: number;
    totalBookings: number;
    monthlyRevenue: number;
    activeCustomers: number;
}

interface UpcomingBooking extends Booking {
    boat: Boat;
}

export default function AdminDashboardPage() {
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalBoats: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        activeCustomers: 0,
    });
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buongiorno');
        else if (hour < 18) setGreeting('Buon pomeriggio');
        else setGreeting('Buonasera');
    }, []);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);

                // Fetch real data from Supabase
                const [boats, bookings] = await Promise.all([
                    getBoats(),
                    getBookingsWithBoat(),
                ]);

                // Calculate stats
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                // Filter bookings for current month revenue
                const monthlyBookings = bookings.filter(b => {
                    const bookingDate = new Date(b.start_date);
                    return bookingDate >= startOfMonth &&
                        bookingDate <= endOfMonth &&
                        b.status !== 'cancelled';
                });

                // Calculate monthly revenue
                const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

                // Count unique customers (by email)
                const uniqueCustomers = new Set(
                    bookings
                        .filter(b => b.status !== 'cancelled')
                        .map(b => b.customer_email)
                );

                // Get upcoming bookings (future, not cancelled)
                const today = new Date().toISOString().split('T')[0];
                const upcoming = bookings
                    .filter(b => b.start_date >= today && b.status !== 'cancelled' && b.boat)
                    .sort((a, b) => a.start_date.localeCompare(b.start_date))
                    .slice(0, 5) as UpcomingBooking[];

                setStats({
                    totalBoats: boats.length,
                    totalBookings: bookings.filter(b => b.status !== 'cancelled').length,
                    monthlyRevenue,
                    activeCustomers: uniqueCustomers.size,
                });

                setUpcomingBookings(upcoming);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Confermata</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">In Attesa</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Annullata</span>;
            default:
                return null;
        }
    };

    const statCards = [
        { label: 'Barche', value: stats.totalBoats, icon: Ship, color: 'text-blue-400' },
        { label: 'Prenotazioni', value: stats.totalBookings, icon: Calendar, color: 'text-green-400' },
        { label: 'Fatturato Mese', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'text-[var(--gold-500)]' },
        { label: 'Clienti Attivi', value: stats.activeCustomers, icon: Users, color: 'text-purple-400' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl text-[var(--cream)]">{greeting}!</h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                    Ecco un riepilogo delle attività di YACHT~ME.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[var(--muted-foreground)] text-sm">{stat.label}</span>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-semibold text-[var(--cream)]">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Upcoming Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6"
                >
                    <h2 className="font-serif text-xl text-[var(--cream)] mb-4">Azioni Rapide</h2>
                    <div className="space-y-3">
                        <Link
                            href="/admin/fleet"
                            className="flex items-center justify-between p-3 bg-[var(--navy-700)] rounded-lg hover:bg-[var(--navy-600)] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Ship className="w-5 h-5 text-[var(--gold-500)]" />
                                <span className="text-[var(--cream)]">Gestisci Flotta</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--gold-500)] transition-colors" />
                        </Link>
                        <Link
                            href="/admin/bookings"
                            className="flex items-center justify-between p-3 bg-[var(--navy-700)] rounded-lg hover:bg-[var(--navy-600)] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-[var(--gold-500)]" />
                                <span className="text-[var(--cream)]">Vedi Prenotazioni</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--gold-500)] transition-colors" />
                        </Link>
                    </div>
                </motion.div>

                {/* Upcoming Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif text-xl text-[var(--cream)]">Prossime Prenotazioni</h2>
                        <Link
                            href="/admin/bookings"
                            className="text-sm text-[var(--gold-500)] hover:underline"
                        >
                            Vedi tutte
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingBookings.length === 0 ? (
                            <div className="text-center py-8 text-[var(--muted-foreground)]">
                                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p>Nessuna prenotazione in programma</p>
                            </div>
                        ) : (
                            upcomingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-4 bg-[var(--navy-700)] rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--navy-600)] flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-[var(--gold-500)]" />
                                        </div>
                                        <div>
                                            <p className="text-[var(--cream)] font-medium">{booking.boat?.name || 'Barca'}</p>
                                            <p className="text-[var(--muted-foreground)] text-sm">
                                                {booking.customer_name} · {formatDateShort(booking.start_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[var(--cream)] font-medium hidden sm:block">
                                            {formatCurrency(booking.total_price)}
                                        </span>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
