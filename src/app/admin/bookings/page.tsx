'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Eye,
    Check,
    X,
    Clock,
    User,
    Mail,
    Phone,
    Ship,
    Plus,
    Edit2,
    Trash2,
    Save,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import type { Booking, BookingStatus, Boat } from '@/lib/types';
import { formatCurrency, formatDateShort, formatDate } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    getBookingsWithBoat,
    getBoats,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
} from '@/lib/supabase';

type BookingWithBoat = Booking & { boat: Boat };

const statusFilters: { label: string; value: BookingStatus | 'all' }[] = [
    { label: 'Tutte', value: 'all' },
    { label: 'In Attesa', value: 'pending' },
    { label: 'Confermate', value: 'confirmed' },
    { label: 'Annullate', value: 'cancelled' },
];

const emptyBookingForm = {
    boat_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    notes: '',
    total_price: 0,
    status: 'pending' as BookingStatus,
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<BookingWithBoat[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    const [selectedBooking, setSelectedBooking] = useState<BookingWithBoat | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Partial<Booking> | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bookingsData, boatsData] = await Promise.all([
                getBookingsWithBoat(),
                getBoats(),
            ]);
            setBookings(bookingsData);
            setBoats(boatsData);
        } catch (error) {
            console.error('Error loading data:', error);
            showNotification('error', 'Errore nel caricamento dati');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        const boatName = booking.boat?.name || '';
        const matchesSearch =
            booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        return { daysInMonth, startingDay };
    };

    const getBookingsForDate = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter((b) => b.start_date <= dateStr && b.end_date >= dateStr && b.status !== 'cancelled');
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    // CRUD Operations
    const handleOpenForm = (booking?: BookingWithBoat) => {
        if (booking) {
            setEditingBooking({
                id: booking.id,
                boat_id: booking.boat_id,
                customer_name: booking.customer_name,
                customer_email: booking.customer_email,
                customer_phone: booking.customer_phone || '',
                start_date: booking.start_date,
                end_date: booking.end_date,
                notes: booking.notes || '',
                total_price: booking.total_price || 0,
                status: booking.status,
            });
        } else {
            setEditingBooking({ ...emptyBookingForm });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingBooking(null);
    };

    const handleSave = async () => {
        if (!editingBooking?.customer_name || !editingBooking?.customer_email || !editingBooking?.boat_id) {
            showNotification('error', 'Compila tutti i campi obbligatori');
            return;
        }

        setSaving(true);
        try {
            if (editingBooking.id) {
                // Update existing
                await updateBooking(editingBooking.id, {
                    boat_id: editingBooking.boat_id,
                    customer_name: editingBooking.customer_name,
                    customer_email: editingBooking.customer_email,
                    customer_phone: editingBooking.customer_phone || null,
                    start_date: editingBooking.start_date!,
                    end_date: editingBooking.end_date!,
                    notes: editingBooking.notes || null,
                    total_price: editingBooking.total_price || null,
                    status: editingBooking.status!,
                });
                showNotification('success', 'Prenotazione aggiornata');
            } else {
                // Create new
                await createBooking(
                    editingBooking.boat_id,
                    {
                        customer_name: editingBooking.customer_name,
                        customer_email: editingBooking.customer_email,
                        customer_phone: editingBooking.customer_phone || '',
                        start_date: editingBooking.start_date!,
                        end_date: editingBooking.end_date!,
                        notes: editingBooking.notes || '',
                    },
                    editingBooking.total_price || null
                );
                showNotification('success', 'Prenotazione creata');
            }
            handleCloseForm();
            loadData();
        } catch (error) {
            console.error('Error saving booking:', error);
            showNotification('error', 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
        try {
            await updateBookingStatus(id, newStatus);
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
            );
            if (selectedBooking?.id === id) {
                setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
            }
            showNotification('success', `Prenotazione ${newStatus === 'confirmed' ? 'confermata' : 'annullata'}`);
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('error', 'Errore nell\'aggiornamento');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBooking(id);
            setBookings((prev) => prev.filter((b) => b.id !== id));
            setDeleteConfirm(null);
            showNotification('success', 'Prenotazione eliminata');
        } catch (error) {
            console.error('Error deleting booking:', error);
            showNotification('error', 'Errore nell\'eliminazione');
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            confirmed: 'bg-green-500/20 text-green-400',
            cancelled: 'bg-red-500/20 text-red-400',
        };
        return (
            <span className={`px-2 py-1 text-xs rounded ${styles[status]}`}>
                {BOOKING_STATUS_LABELS[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl text-[var(--cream)]">Prenotazioni</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {filteredBookings.length} prenotazioni
                    </p>
                </div>
                <button onClick={() => handleOpenForm()} className="btn-gold">
                    <Plus className="w-4 h-4" />
                    Nuova Prenotazione
                </button>
            </div>

            {/* Calendar */}
            <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-lg text-[var(--cream)] capitalize">{monthName}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--cream)] hover:bg-[var(--navy-700)] rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--cream)] hover:bg-[var(--navy-700)] rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                        <div key={day} className="text-center text-xs text-[var(--muted-foreground)] py-1 font-medium">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: startingDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-12" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayBookings = getBookingsForDate(day);
                        const confirmedCount = dayBookings.filter((b) => b.status === 'confirmed').length;
                        const pendingCount = dayBookings.filter((b) => b.status === 'pending').length;
                        const hasConfirmed = confirmedCount > 0;
                        const hasPending = pendingCount > 0;
                        const isToday =
                            new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();

                        // Determine background color based on bookings
                        let bgClass = 'bg-[var(--navy-700)]/30';
                        let borderClass = 'border-[var(--border)]';

                        if (hasConfirmed && hasPending) {
                            bgClass = 'bg-gradient-to-br from-green-500/30 to-amber-500/30';
                            borderClass = 'border-green-500/50';
                        } else if (hasConfirmed) {
                            bgClass = 'bg-green-500/20';
                            borderClass = 'border-green-500/50';
                        } else if (hasPending) {
                            bgClass = 'bg-amber-500/20';
                            borderClass = 'border-amber-500/50';
                        }

                        if (isToday) {
                            borderClass = 'border-[var(--gold-500)] border-2';
                        }

                        return (
                            <div
                                key={day}
                                className={cn(
                                    'h-12 p-1 border rounded-lg relative transition-all hover:scale-105 cursor-pointer flex flex-col justify-between',
                                    bgClass,
                                    borderClass
                                )}
                                title={dayBookings.length > 0 ? `${confirmedCount} confermate, ${pendingCount} in attesa` : ''}
                            >
                                <span className={cn(
                                    'text-xs font-medium',
                                    isToday ? 'text-[var(--gold-500)]' : 'text-[var(--cream)]'
                                )}>
                                    {day}
                                </span>

                                {dayBookings.length > 0 && (
                                    <div className="flex items-center justify-center gap-0.5">
                                        {hasConfirmed && (
                                            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-green-500/40 rounded text-[9px] text-green-300 font-bold">
                                                <Check className="w-2 h-2" />
                                                {confirmedCount}
                                            </div>
                                        )}
                                        {hasPending && (
                                            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-500/40 rounded text-[9px] text-amber-300 font-bold">
                                                <Clock className="w-2 h-2" />
                                                {pendingCount}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50" />
                        <span className="text-sm text-[var(--muted-foreground)]">Confermate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/50" />
                        <span className="text-sm text-[var(--muted-foreground)]">In attesa</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500/30 to-amber-500/30 border border-green-500/50" />
                        <span className="text-sm text-[var(--muted-foreground)]">Miste</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Cerca prenotazioni..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 bg-[var(--navy-800)]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                'px-4 py-2 text-sm whitespace-nowrap transition-all rounded-lg',
                                statusFilter === filter.value
                                    ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                    : 'bg-[var(--navy-800)] text-[var(--cream)] hover:bg-[var(--navy-700)]'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div >

            {/* Bookings List */}
            < div className="space-y-3" >
                {
                    filteredBookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--navy-700)] flex items-center justify-center flex-shrink-0">
                                        <Ship className="w-5 h-5 text-[var(--gold-500)]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-[var(--cream)] font-medium">{booking.boat?.name || 'N/A'}</p>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <p className="text-[var(--muted-foreground)] text-sm mt-1">
                                            {booking.customer_name} · {formatDateShort(booking.start_date)}
                                            {booking.start_date !== booking.end_date && ` - ${formatDateShort(booking.end_date)}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="text-[var(--gold-500)] font-medium">
                                        {formatCurrency(booking.total_price)}
                                    </span>

                                    {booking.status === 'pending' && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                title="Conferma"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                                title="Annulla"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] hover:bg-[var(--navy-700)] rounded-lg"
                                        title="Dettagli"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleOpenForm(booking)}
                                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] hover:bg-[var(--navy-700)] rounded-lg"
                                        title="Modifica"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setDeleteConfirm(booking.id)}
                                        className="p-2 text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        title="Elimina"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                }

                {
                    filteredBookings.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                            <p className="text-[var(--muted-foreground)]">Nessuna prenotazione trovata</p>
                        </div>
                    )
                }
            </div >

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {
                    isFormOpen && editingBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70"
                                onClick={handleCloseForm}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-[var(--navy-800)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                    <h2 className="font-serif text-xl text-[var(--cream)]">
                                        {editingBooking.id ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
                                    </h2>
                                    <button onClick={handleCloseForm} className="text-[var(--muted-foreground)] hover:text-[var(--cream)]">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Barca *</label>
                                        <select
                                            value={editingBooking.boat_id || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, boat_id: e.target.value }))}
                                            className="w-full"
                                        >
                                            <option value="">Seleziona barca...</option>
                                            {boats.map((boat) => (
                                                <option key={boat.id} value={boat.id}>{boat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Data Inizio *</label>
                                            <input
                                                type="date"
                                                value={editingBooking.start_date || ''}
                                                onChange={(e) => setEditingBooking((prev) => ({ ...prev, start_date: e.target.value }))}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Data Fine *</label>
                                            <input
                                                type="date"
                                                value={editingBooking.end_date || ''}
                                                onChange={(e) => setEditingBooking((prev) => ({ ...prev, end_date: e.target.value }))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <hr className="border-[var(--border)]" />

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Nome Cliente *</label>
                                        <input
                                            type="text"
                                            value={editingBooking.customer_name || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, customer_name: e.target.value }))}
                                            placeholder="Mario Rossi"
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={editingBooking.customer_email || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, customer_email: e.target.value }))}
                                            placeholder="mario@email.com"
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Telefono</label>
                                        <input
                                            type="tel"
                                            value={editingBooking.customer_phone || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, customer_phone: e.target.value }))}
                                            placeholder="+39 333 123 4567"
                                            className="w-full"
                                        />
                                    </div>

                                    <hr className="border-[var(--border)]" />

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Totale (€)</label>
                                        <input
                                            type="number"
                                            value={editingBooking.total_price || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, total_price: Number(e.target.value) }))}
                                            placeholder="0"
                                            className="w-full"
                                        />
                                    </div>

                                    {editingBooking.id && (
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Stato</label>
                                            <select
                                                value={editingBooking.status || 'pending'}
                                                onChange={(e) => setEditingBooking((prev) => ({ ...prev, status: e.target.value as BookingStatus }))}
                                                className="w-full"
                                            >
                                                <option value="pending">In Attesa</option>
                                                <option value="confirmed">Confermata</option>
                                                <option value="cancelled">Annullata</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Note</label>
                                        <textarea
                                            value={editingBooking.notes || ''}
                                            onChange={(e) => setEditingBooking((prev) => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                            placeholder="Richieste speciali..."
                                            className="w-full resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-[var(--border)] flex gap-3">
                                    <button onClick={handleCloseForm} className="btn-gold-outline flex-1" disabled={saving}>
                                        Annulla
                                    </button>
                                    <button onClick={handleSave} className="btn-gold flex-1" disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? 'Salvataggio...' : 'Salva'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Detail Modal */}
            <AnimatePresence>
                {
                    selectedBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70"
                                onClick={() => setSelectedBooking(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-[var(--navy-800)] border border-[var(--border)] rounded-xl w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                    <h2 className="font-serif text-xl text-[var(--cream)]">Dettagli Prenotazione</h2>
                                    <button
                                        onClick={() => setSelectedBooking(null)}
                                        className="text-[var(--muted-foreground)] hover:text-[var(--cream)]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--muted-foreground)]">Barca</span>
                                        <span className="text-[var(--cream)] font-medium">{selectedBooking.boat?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--muted-foreground)]">Stato</span>
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--muted-foreground)]">Date</span>
                                        <span className="text-[var(--cream)]">
                                            {formatDateShort(selectedBooking.start_date)}
                                            {selectedBooking.start_date !== selectedBooking.end_date &&
                                                ` - ${formatDateShort(selectedBooking.end_date)}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--muted-foreground)]">Totale</span>
                                        <span className="text-[var(--gold-500)] font-medium">
                                            {formatCurrency(selectedBooking.total_price)}
                                        </span>
                                    </div>

                                    <hr className="border-[var(--border)]" />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-[var(--gold-500)]" />
                                            <span className="text-[var(--cream)]">{selectedBooking.customer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-[var(--gold-500)]" />
                                            <span className="text-[var(--cream)]">{selectedBooking.customer_email}</span>
                                        </div>
                                        {selectedBooking.customer_phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-[var(--gold-500)]" />
                                                <span className="text-[var(--cream)]">{selectedBooking.customer_phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedBooking.notes && (
                                        <>
                                            <hr className="border-[var(--border)]" />
                                            <div>
                                                <p className="text-[var(--muted-foreground)] text-sm mb-1">Note</p>
                                                <p className="text-[var(--cream)]">{selectedBooking.notes}</p>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                        <Clock className="w-3 h-3" />
                                        Creata il {formatDate(selectedBooking.created_at)}
                                    </div>
                                </div>

                                {selectedBooking.status === 'pending' && (
                                    <div className="p-6 border-t border-[var(--border)] flex gap-3">
                                        <button
                                            onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                                            className="flex-1 px-4 py-3 border border-red-500 text-red-400 rounded hover:bg-red-500/10 transition-colors"
                                        >
                                            Annulla
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                                            className="flex-1 btn-gold"
                                        >
                                            <Check className="w-4 h-4" />
                                            Conferma
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Delete Confirmation */}
            <AnimatePresence>
                {
                    deleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70"
                                onClick={() => setDeleteConfirm(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm"
                            >
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <h3 className="font-serif text-xl text-[var(--cream)] mb-2">Conferma eliminazione</h3>
                                    <p className="text-[var(--muted-foreground)] text-sm mb-6">
                                        Sei sicuro di voler eliminare questa prenotazione? L&apos;azione non può essere annullata.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDeleteConfirm(null)} className="btn-gold-outline flex-1">
                                            Annulla
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deleteConfirm)}
                                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            Elimina
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Notification Toast */}
            <AnimatePresence>
                {
                    notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}
                        >
                            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>{notification.message}</span>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
