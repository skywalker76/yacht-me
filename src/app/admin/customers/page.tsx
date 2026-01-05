'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Tag,
    Loader2,
    AlertCircle,
    Ship,
    Eye,
} from 'lucide-react';
import type { Customer, Booking, Boat } from '@/lib/types';
import { formatCurrency, formatDateShort, cn } from '@/lib/utils';
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerBookings,
} from '@/lib/supabase';

const AVAILABLE_TAGS = ['VIP', 'Azienda', 'Fedele', 'Nuovo', 'Problema'];

const TAG_COLORS: Record<string, string> = {
    'VIP': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'Azienda': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'Fedele': 'bg-green-500/20 text-green-400 border-green-500/50',
    'Nuovo': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    'Problema': 'bg-red-500/20 text-red-400 border-red-500/50',
};

const emptyCustomerForm = {
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: [] as string[],
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState<string | null>(null);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerBookings, setCustomerBookings] = useState<(Booking & { boat: Boat })[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
            showNotification('error', 'Errore nel caricamento clienti');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch =
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone && customer.phone.includes(searchTerm));
        const matchesTag = !tagFilter || customer.tags.includes(tagFilter);
        return matchesSearch && matchesTag;
    });

    const handleOpenForm = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer({ ...customer });
        } else {
            setEditingCustomer({ ...emptyCustomerForm });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };

    const handleSave = async () => {
        if (!editingCustomer?.name || !editingCustomer?.email) {
            showNotification('error', 'Nome e email sono obbligatori');
            return;
        }

        setSaving(true);
        try {
            if (editingCustomer.id) {
                await updateCustomer(editingCustomer.id, {
                    name: editingCustomer.name,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone || undefined,
                    notes: editingCustomer.notes || undefined,
                    tags: editingCustomer.tags,
                });
                showNotification('success', 'Cliente aggiornato');
            } else {
                await createCustomer({
                    name: editingCustomer.name,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone || undefined,
                    notes: editingCustomer.notes || undefined,
                    tags: editingCustomer.tags,
                });
                showNotification('success', 'Cliente creato');
            }
            handleCloseForm();
            loadCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
            showNotification('error', 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCustomer(id);
            setCustomers((prev) => prev.filter((c) => c.id !== id));
            setDeleteConfirm(null);
            showNotification('success', 'Cliente eliminato');
        } catch (error) {
            console.error('Error deleting customer:', error);
            showNotification('error', 'Errore nell\'eliminazione');
        }
    };

    const handleViewDetails = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setLoadingBookings(true);
        try {
            const bookings = await getCustomerBookings(customer.email);
            setCustomerBookings(bookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const toggleTag = (tag: string) => {
        if (!editingCustomer) return;
        const currentTags = editingCustomer.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter((t) => t !== tag)
            : [...currentTags, tag];
        setEditingCustomer({ ...editingCustomer, tags: newTags });
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
                    <h1 className="font-serif text-3xl text-[var(--cream)]">Clienti</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {customers.length} clienti totali
                    </p>
                </div>
                <button onClick={() => handleOpenForm()} className="btn-gold">
                    <Plus className="w-4 h-4" />
                    Nuovo Cliente
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Cerca clienti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 bg-[var(--navy-800)]"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setTagFilter(null)}
                        className={cn(
                            'px-3 py-2 text-sm rounded-lg transition-colors',
                            !tagFilter
                                ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                : 'bg-[var(--navy-800)] text-[var(--cream)] hover:bg-[var(--navy-700)]'
                        )}
                    >
                        Tutti
                    </button>
                    {AVAILABLE_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                            className={cn(
                                'px-3 py-2 text-sm rounded-lg transition-colors border',
                                tagFilter === tag
                                    ? TAG_COLORS[tag]
                                    : 'bg-[var(--navy-800)] text-[var(--cream)] border-transparent hover:bg-[var(--navy-700)]'
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--navy-700)] flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[var(--gold-500)]" />
                                </div>
                                <div>
                                    <p className="text-[var(--cream)] font-medium">{customer.name}</p>
                                    <p className="text-[var(--muted-foreground)] text-sm">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleViewDetails(customer)}
                                    className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] hover:bg-[var(--navy-700)] rounded"
                                    title="Dettagli"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleOpenForm(customer)}
                                    className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] hover:bg-[var(--navy-700)] rounded"
                                    title="Modifica"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(customer.id)}
                                    className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 rounded"
                                    title="Elimina"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tags */}
                        {customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {customer.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={cn('px-2 py-0.5 text-xs rounded border', TAG_COLORS[tag] || 'bg-[var(--navy-700)] text-[var(--cream)]')}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                                <span className="text-sm text-[var(--cream)]">{customer.total_bookings} prenotazioni</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[var(--gold-500)]" />
                                <span className="text-sm text-[var(--gold-500)]">{formatCurrency(customer.total_spent)}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                    <p className="text-[var(--muted-foreground)]">Nessun cliente trovato</p>
                </div>
            )}

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={cn(
                            'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg',
                            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        )}
                    >
                        <p className="text-white font-medium">{notification.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isFormOpen && editingCustomer && (
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
                                    {editingCustomer.id ? 'Modifica Cliente' : 'Nuovo Cliente'}
                                </h2>
                                <button onClick={handleCloseForm} className="text-[var(--muted-foreground)] hover:text-[var(--cream)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Nome *</label>
                                    <input
                                        type="text"
                                        value={editingCustomer.name || ''}
                                        onChange={(e) => setEditingCustomer((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Mario Rossi"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={editingCustomer.email || ''}
                                        onChange={(e) => setEditingCustomer((prev) => ({ ...prev, email: e.target.value }))}
                                        placeholder="mario@email.com"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Telefono</label>
                                    <input
                                        type="tel"
                                        value={editingCustomer.phone || ''}
                                        onChange={(e) => setEditingCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+39 333 123 4567"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_TAGS.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={cn(
                                                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                                                    editingCustomer.tags?.includes(tag)
                                                        ? TAG_COLORS[tag]
                                                        : 'bg-[var(--navy-700)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--cream)]'
                                                )}
                                            >
                                                <Tag className="w-3 h-3 inline mr-1" />
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Note</label>
                                    <textarea
                                        value={editingCustomer.notes || ''}
                                        onChange={(e) => setEditingCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        placeholder="Note sul cliente..."
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
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70"
                            onClick={() => setSelectedCustomer(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[var(--navy-800)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                <h2 className="font-serif text-xl text-[var(--cream)]">Dettagli Cliente</h2>
                                <button onClick={() => setSelectedCustomer(null)} className="text-[var(--muted-foreground)] hover:text-[var(--cream)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--navy-700)] flex items-center justify-center">
                                        <Users className="w-8 h-8 text-[var(--gold-500)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl text-[var(--cream)] font-medium">{selectedCustomer.name}</h3>
                                        <p className="text-[var(--muted-foreground)]">{selectedCustomer.source === 'booking' ? 'Da prenotazione' : 'Aggiunto manualmente'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-[var(--gold-500)]" />
                                        <span className="text-[var(--cream)]">{selectedCustomer.email}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-[var(--gold-500)]" />
                                            <span className="text-[var(--cream)]">{selectedCustomer.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedCustomer.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedCustomer.tags.map((tag) => (
                                            <span key={tag} className={cn('px-2 py-0.5 text-xs rounded border', TAG_COLORS[tag])}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--navy-700)] rounded-lg">
                                    <div className="text-center">
                                        <p className="text-2xl text-[var(--cream)] font-semibold">{selectedCustomer.total_bookings}</p>
                                        <p className="text-sm text-[var(--muted-foreground)]">Prenotazioni</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl text-[var(--gold-500)] font-semibold">{formatCurrency(selectedCustomer.total_spent)}</p>
                                        <p className="text-sm text-[var(--muted-foreground)]">Totale Speso</p>
                                    </div>
                                </div>

                                {selectedCustomer.notes && (
                                    <div>
                                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Note</p>
                                        <p className="text-[var(--cream)]">{selectedCustomer.notes}</p>
                                    </div>
                                )}

                                <hr className="border-[var(--border)]" />

                                <div>
                                    <h4 className="font-medium text-[var(--cream)] mb-3">Storico Prenotazioni</h4>
                                    {loadingBookings ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="w-6 h-6 animate-spin text-[var(--gold-500)]" />
                                        </div>
                                    ) : customerBookings.length === 0 ? (
                                        <p className="text-[var(--muted-foreground)] text-center py-4">Nessuna prenotazione</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {customerBookings.slice(0, 5).map((booking) => (
                                                <div key={booking.id} className="flex items-center justify-between p-3 bg-[var(--navy-700)] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Ship className="w-4 h-4 text-[var(--gold-500)]" />
                                                        <div>
                                                            <p className="text-[var(--cream)] text-sm">{booking.boat?.name}</p>
                                                            <p className="text-[var(--muted-foreground)] text-xs">{formatDateShort(booking.start_date)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[var(--gold-500)] text-sm">{formatCurrency(booking.total_price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
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
                                    Sei sicuro di voler eliminare questo cliente? L&apos;azione non può essere annullata.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirm(null)} className="btn-gold-outline flex-1">
                                        Annulla
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                                    >
                                        Elimina
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
