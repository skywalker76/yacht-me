'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Save,
    AlertCircle,
    Check,
    Ship,
    Settings,
    Anchor,
    CreditCard,
    MapPin,
    Loader2,
    Upload,
    Image,
    Languages,
} from 'lucide-react';
import type { Boat, BoatType, BoatFeatures } from '@/lib/types';
import { formatCurrency, generateSlug } from '@/lib/utils';
import { BOAT_TYPE_LABELS } from '@/lib/types';
import { getBoats, createBoat, updateBoat, deleteBoat, uploadBoatImage } from '@/lib/supabase';

// Feature definitions for checkboxes
const FEATURE_CATEGORIES = {
    navigation: {
        title: 'Navigazione e Sicurezza',
        features: [
            { key: 'gps', label: 'GPS' },
            { key: 'autopilot', label: 'Autopilota' },
            { key: 'radar', label: 'Radar' },
            { key: 'vhf_radio', label: 'Radio VHF' },
            { key: 'life_jackets', label: 'Giubbotti Salvagente' },
        ],
    },
    comfort: {
        title: 'Comfort',
        features: [
            { key: 'air_conditioning', label: 'Aria Condizionata' },
            { key: 'heating', label: 'Riscaldamento' },
            { key: 'wifi', label: 'WiFi' },
            { key: 'generator', label: 'Generatore' },
            { key: 'watermaker', label: 'Dissalatore' },
        ],
    },
    entertainment: {
        title: 'Intrattenimento',
        features: [
            { key: 'tv', label: 'TV' },
            { key: 'stereo', label: 'Stereo/Musica' },
            { key: 'swimming_platform', label: 'Piattaforma Bagno' },
            { key: 'tender', label: 'Tender' },
            { key: 'snorkeling_equipment', label: 'Attrezzatura Snorkeling' },
        ],
    },
};

type TabType = 'base' | 'specs' | 'features' | 'services';

const emptyBoat: Partial<Boat> = {
    name: '',
    type: 'dinghy',
    description: '',
    price_full_day: 0,
    price_half_day: 0,
    capacity: 0,
    length: '',
    image_url: '',
    is_featured: false,
    features: {},
    highlights: [],
    included_services: [],
    excluded_services: [],
    extra_services: [],
};

export default function AdminFleetPage() {
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBoat, setEditingBoat] = useState<Partial<Boat> | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('base');
    const [langTab, setLangTab] = useState<'it' | 'en'>('it');

    // Dynamic list inputs
    const [newHighlight, setNewHighlight] = useState('');
    const [newIncluded, setNewIncluded] = useState('');
    const [newExcluded, setNewExcluded] = useState('');
    const [newExtra, setNewExtra] = useState<{ name: string; price: number; unit: 'day' | 'trip' | 'person' }>({ name: '', price: 0, unit: 'day' });

    // Image upload state
    const [uploading, setUploading] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    // Load boats from Supabase
    useEffect(() => {
        loadBoats();
    }, []);

    const loadBoats = async () => {
        try {
            setLoading(true);
            const data = await getBoats();
            setBoats(data);
        } catch (error) {
            console.error('Error loading boats:', error);
            showNotification('error', 'Errore nel caricamento delle barche');
        } finally {
            setLoading(false);
        }
    };

    const filteredBoats = boats.filter(
        (boat) =>
            boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            BOAT_TYPE_LABELS[boat.type].toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenModal = (boat?: Boat) => {
        if (boat) {
            setEditingBoat({ ...boat });
        } else {
            setEditingBoat({ ...emptyBoat });
        }
        setActiveTab('base');
        setLangTab('it');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBoat(null);
        setNewHighlight('');
        setNewIncluded('');
        setNewExcluded('');
        setNewExtra({ name: '', price: 0, unit: 'day' });
    };

    const handleSave = async () => {
        if (!editingBoat?.name) {
            showNotification('error', 'Il nome è obbligatorio');
            return;
        }

        setSaving(true);
        try {
            const slug = generateSlug(editingBoat.name || '');

            if (editingBoat.id) {
                // Update existing
                const updated = await updateBoat(editingBoat.id, {
                    ...editingBoat,
                    slug,
                });
                setBoats((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                showNotification('success', 'Barca aggiornata con successo');
            } else {
                // Create new
                const newBoat = await createBoat({
                    name: editingBoat.name,
                    slug,
                    type: editingBoat.type || 'dinghy',
                    description: editingBoat.description || null,
                    price_full_day: editingBoat.price_full_day || null,
                    price_half_day: editingBoat.price_half_day || null,
                    capacity: editingBoat.capacity || null,
                    length: editingBoat.length || null,
                    image_url: editingBoat.image_url || null,
                    gallery_urls: editingBoat.gallery_urls || [],
                    features: editingBoat.features || {},
                    is_featured: editingBoat.is_featured || false,
                    year: editingBoat.year,
                    refurbished_year: editingBoat.refurbished_year,
                    location: editingBoat.location,
                    engine_power: editingBoat.engine_power,
                    fuel_consumption: editingBoat.fuel_consumption,
                    highlights: editingBoat.highlights || [],
                    included_services: editingBoat.included_services || [],
                    excluded_services: editingBoat.excluded_services || [],
                    extra_services: editingBoat.extra_services || [],
                    cancellation_policy: editingBoat.cancellation_policy,
                    // English translation fields
                    name_en: editingBoat.name_en || undefined,
                    description_en: editingBoat.description_en || undefined,
                });
                setBoats((prev) => [newBoat, ...prev]);
                showNotification('success', 'Barca aggiunta con successo');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving boat:', error);
            showNotification('error', 'Errore nel salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBoat(id);
            setBoats((prev) => prev.filter((b) => b.id !== id));
            setDeleteConfirm(null);
            showNotification('success', 'Barca eliminata');
        } catch (error) {
            console.error('Error deleting boat:', error);
            showNotification('error', 'Errore nell\'eliminazione');
        }
    };

    // Feature toggle handler
    const toggleFeature = (key: string) => {
        setEditingBoat((prev) => ({
            ...prev,
            features: {
                ...prev?.features,
                [key]: !prev?.features?.[key as keyof BoatFeatures],
            },
        }));
    };

    // List management handlers
    const addToList = (field: 'highlights' | 'included_services' | 'excluded_services', value: string) => {
        if (!value.trim()) return;
        setEditingBoat((prev) => ({
            ...prev,
            [field]: [...(prev?.[field] || []), value.trim()],
        }));
    };

    const removeFromList = (field: 'highlights' | 'included_services' | 'excluded_services', index: number) => {
        setEditingBoat((prev) => ({
            ...prev,
            [field]: prev?.[field]?.filter((_, i) => i !== index),
        }));
    };

    const addExtraService = () => {
        if (!newExtra.name.trim() || newExtra.price <= 0) return;
        setEditingBoat((prev) => ({
            ...prev,
            extra_services: [...(prev?.extra_services || []), { ...newExtra }],
        }));
        setNewExtra({ name: '', price: 0, unit: 'day' });
    };

    const removeExtraService = (index: number) => {
        setEditingBoat((prev) => ({
            ...prev,
            extra_services: prev?.extra_services?.filter((_, i) => i !== index),
        }));
    };

    // Image upload handlers
    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadBoatImage(file);
            setEditingBoat((prev) => ({ ...prev, image_url: url }));
            showNotification('success', 'Immagine caricata con successo');
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('error', 'Errore nel caricamento immagine');
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingGallery(true);
            const url = await uploadBoatImage(file);
            setEditingBoat((prev) => ({
                ...prev,
                gallery_urls: [...(prev?.gallery_urls || []), url],
            }));
            showNotification('success', 'Immagine aggiunta alla galleria');
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            showNotification('error', 'Errore nel caricamento immagine');
        } finally {
            setUploadingGallery(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setEditingBoat((prev) => ({
            ...prev,
            gallery_urls: prev?.gallery_urls?.filter((_, i) => i !== index),
        }));
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'base', label: 'Base', icon: <Ship className="w-4 h-4" /> },
        { id: 'specs', label: 'Specifiche', icon: <Settings className="w-4 h-4" /> },
        { id: 'features', label: 'Dotazioni', icon: <Anchor className="w-4 h-4" /> },
        { id: 'services', label: 'Servizi', icon: <CreditCard className="w-4 h-4" /> },
    ];

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
                    <h1 className="font-serif text-3xl text-[var(--cream)]">Gestione Flotta</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {boats.length} imbarcazioni
                    </p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-gold">
                    <Plus className="w-4 h-4" />
                    Aggiungi Barca
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                <input
                    type="text"
                    placeholder="Cerca barche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 bg-[var(--navy-800)]"
                />
            </div>

            {/* Table */}
            <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left p-4 text-[var(--muted-foreground)] font-medium text-sm">Barca</th>
                                <th className="text-left p-4 text-[var(--muted-foreground)] font-medium text-sm hidden md:table-cell">Tipo</th>
                                <th className="text-left p-4 text-[var(--muted-foreground)] font-medium text-sm hidden lg:table-cell">Posizione</th>
                                <th className="text-left p-4 text-[var(--muted-foreground)] font-medium text-sm">Prezzo/Giorno</th>
                                <th className="text-right p-4 text-[var(--muted-foreground)] font-medium text-sm">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBoats.map((boat) => (
                                <tr key={boat.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--navy-700)]/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-[var(--navy-700)] overflow-hidden flex-shrink-0">
                                                {boat.image_url ? (
                                                    <img src={boat.image_url} alt={boat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Ship className="w-5 h-5 text-[var(--muted-foreground)]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[var(--cream)] font-medium">{boat.name}</p>
                                                    {(boat.name_en || boat.description_en) && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                                                            <Languages className="w-3 h-3" />
                                                            EN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[var(--muted-foreground)] text-sm md:hidden">
                                                    {BOAT_TYPE_LABELS[boat.type]}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="px-2 py-1 text-xs bg-[var(--navy-700)] text-[var(--cream)] rounded">
                                            {BOAT_TYPE_LABELS[boat.type]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--muted-foreground)] text-sm hidden lg:table-cell">
                                        {boat.location || '-'}
                                    </td>
                                    <td className="p-4 text-[var(--gold-500)] font-medium">
                                        {formatCurrency(boat.price_full_day)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(boat)}
                                                className="p-2 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] hover:bg-[var(--navy-700)] rounded-lg transition-colors"
                                                title="Modifica"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(boat.id)}
                                                className="p-2 text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Elimina"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBoats.length === 0 && (
                    <div className="p-8 text-center">
                        <Ship className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                        <p className="text-[var(--muted-foreground)]">Nessuna barca trovata</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal with Tabs */}
            <AnimatePresence>
                {isModalOpen && editingBoat && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70"
                            onClick={handleCloseModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[var(--navy-800)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                <h2 className="font-serif text-xl text-[var(--cream)]">
                                    {editingBoat.id ? 'Modifica Barca' : 'Nuova Barca'}
                                </h2>
                                <button onClick={handleCloseModal} className="text-[var(--muted-foreground)] hover:text-[var(--cream)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-[var(--border)]">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)] -mb-[1px]'
                                            : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Tab: Base */}
                                {activeTab === 'base' && (
                                    <div className="space-y-4">
                                        {/* Language Sub-Tabs */}
                                        <div className="flex border-b border-[var(--border)] -mx-6 px-6">
                                            <button
                                                type="button"
                                                onClick={() => setLangTab('it')}
                                                className={`flex-1 py-2 text-sm font-medium transition-colors ${langTab === 'it'
                                                    ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)]'
                                                    : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                                    }`}
                                            >
                                                🇮🇹 Italiano
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLangTab('en')}
                                                className={`flex-1 py-2 text-sm font-medium transition-colors ${langTab === 'en'
                                                    ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)]'
                                                    : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                                    }`}
                                            >
                                                🇬🇧 English
                                            </button>
                                        </div>

                                        {langTab === 'it' ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm text-[var(--cream)] mb-2">Nome (IT) *</label>
                                                    <input
                                                        type="text"
                                                        value={editingBoat.name || ''}
                                                        onChange={(e) => setEditingBoat((prev) => ({ ...prev, name: e.target.value }))}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-[var(--cream)] mb-2">Descrizione (IT)</label>
                                                    <textarea
                                                        value={editingBoat.description || ''}
                                                        onChange={(e) => setEditingBoat((prev) => ({ ...prev, description: e.target.value }))}
                                                        rows={3}
                                                        className="w-full resize-none"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-2">
                                                    <p className="text-sm text-blue-400">Se lasci vuoto, verrà usata la versione italiana.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-[var(--cream)] mb-2">Name (EN)</label>
                                                    <input
                                                        type="text"
                                                        value={editingBoat.name_en || ''}
                                                        onChange={(e) => setEditingBoat((prev) => ({ ...prev, name_en: e.target.value }))}
                                                        className="w-full"
                                                        placeholder="Boat name in English"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-[var(--cream)] mb-2">Description (EN)</label>
                                                    <textarea
                                                        value={editingBoat.description_en || ''}
                                                        onChange={(e) => setEditingBoat((prev) => ({ ...prev, description_en: e.target.value }))}
                                                        rows={3}
                                                        className="w-full resize-none"
                                                        placeholder="Boat description in English"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Tipo *</label>
                                            <select
                                                value={editingBoat.type || 'dinghy'}
                                                onChange={(e) => setEditingBoat((prev) => ({ ...prev, type: e.target.value as BoatType }))}
                                                className="w-full"
                                            >
                                                {Object.entries(BOAT_TYPE_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Prezzo Giornata (€)</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.price_full_day || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, price_full_day: Number(e.target.value) }))}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Prezzo Mezza G. (€)</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.price_half_day || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, price_half_day: Number(e.target.value) }))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Main Image Upload */}
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Immagine Principale</label>
                                            <div className="space-y-3">
                                                {/* Preview */}
                                                {editingBoat.image_url ? (
                                                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[var(--navy-700)]">
                                                        <img
                                                            src={editingBoat.image_url}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            onClick={() => setEditingBoat((prev) => ({ ...prev, image_url: '' }))}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-40 rounded-lg bg-[var(--navy-700)] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center">
                                                        <Image className="w-8 h-8 text-[var(--muted-foreground)] mb-2" />
                                                        <span className="text-sm text-[var(--muted-foreground)]">Nessuna immagine</span>
                                                    </div>
                                                )}

                                                {/* Upload/URL Options */}
                                                <div className="flex gap-2">
                                                    <label className="flex-1">
                                                        <div className="btn-gold-outline w-full flex items-center justify-center gap-2 cursor-pointer">
                                                            {uploading ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-4 h-4" />
                                                            )}
                                                            {uploading ? 'Caricamento...' : 'Carica Immagine'}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleMainImageUpload}
                                                            className="hidden"
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                </div>

                                                {/* URL Alternative */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[var(--muted-foreground)]">oppure URL:</span>
                                                    <input
                                                        type="url"
                                                        value={editingBoat.image_url || ''}
                                                        onChange={(e) => setEditingBoat((prev) => ({ ...prev, image_url: e.target.value }))}
                                                        placeholder="https://..."
                                                        className="flex-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gallery Section */}
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Galleria Immagini</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {/* Existing gallery images */}
                                                {editingBoat.gallery_urls?.map((url, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--navy-700)]">
                                                        <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => removeGalleryImage(index)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Add new image button */}
                                                <label className="aspect-square rounded-lg bg-[var(--navy-700)] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--gold-500)] transition-colors">
                                                    {uploadingGallery ? (
                                                        <Loader2 className="w-6 h-6 text-[var(--gold-500)] animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Plus className="w-6 h-6 text-[var(--muted-foreground)]" />
                                                            <span className="text-xs text-[var(--muted-foreground)] mt-1">Aggiungi</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleGalleryImageUpload}
                                                        className="hidden"
                                                        disabled={uploadingGallery}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="featured"
                                                checked={editingBoat.is_featured || false}
                                                onChange={(e) => setEditingBoat((prev) => ({ ...prev, is_featured: e.target.checked }))}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="featured" className="text-sm text-[var(--cream)]">
                                                In evidenza sulla homepage
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Specs */}
                                {activeTab === 'specs' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Anno Costruzione</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.year || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, year: Number(e.target.value) || undefined }))}
                                                    placeholder="2020"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Anno Ristrutturazione</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.refurbished_year || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, refurbished_year: Number(e.target.value) || undefined }))}
                                                    placeholder="2023"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Lunghezza</label>
                                                <input
                                                    type="text"
                                                    value={editingBoat.length || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, length: e.target.value }))}
                                                    placeholder="20m"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Capacità (persone)</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.capacity || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Cabine</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.features?.cabins || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({
                                                        ...prev,
                                                        features: { ...prev?.features, cabins: Number(e.target.value) || undefined }
                                                    }))}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Bagni</label>
                                                <input
                                                    type="number"
                                                    value={editingBoat.features?.bathrooms || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({
                                                        ...prev,
                                                        features: { ...prev?.features, bathrooms: Number(e.target.value) || undefined }
                                                    }))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Potenza Motore</label>
                                                <input
                                                    type="text"
                                                    value={editingBoat.engine_power || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, engine_power: e.target.value }))}
                                                    placeholder="2x 800 HP"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--cream)] mb-2">Consumo Carburante</label>
                                                <input
                                                    type="text"
                                                    value={editingBoat.fuel_consumption || ''}
                                                    onChange={(e) => setEditingBoat((prev) => ({ ...prev, fuel_consumption: e.target.value }))}
                                                    placeholder="150 L/h"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                Posizione/Marina
                                            </label>
                                            <input
                                                type="text"
                                                value={editingBoat.location || ''}
                                                onChange={(e) => setEditingBoat((prev) => ({ ...prev, location: e.target.value }))}
                                                placeholder="Marina di Rimini"
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="crew"
                                                checked={editingBoat.features?.crew || false}
                                                onChange={(e) => setEditingBoat((prev) => ({
                                                    ...prev,
                                                    features: { ...prev?.features, crew: e.target.checked }
                                                }))}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="crew" className="text-sm text-[var(--cream)]">
                                                Include Equipaggio
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="license"
                                                checked={editingBoat.features?.license_required === false}
                                                onChange={(e) => setEditingBoat((prev) => ({
                                                    ...prev,
                                                    features: { ...prev?.features, license_required: !e.target.checked }
                                                }))}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="license" className="text-sm text-[var(--cream)]">
                                                Patente NON richiesta
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Features */}
                                {activeTab === 'features' && (
                                    <div className="space-y-6">
                                        {Object.entries(FEATURE_CATEGORIES).map(([key, category]) => (
                                            <div key={key}>
                                                <h3 className="text-[var(--gold-500)] text-sm font-medium mb-3">{category.title}</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {category.features.map((feature) => (
                                                        <label key={feature.key} className="flex items-center gap-2 p-2 rounded hover:bg-[var(--navy-700)] cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!editingBoat.features?.[feature.key as keyof BoatFeatures]}
                                                                onChange={() => toggleFeature(feature.key)}
                                                                className="w-4 h-4"
                                                            />
                                                            <span className="text-sm text-[var(--cream)]">{feature.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tab: Services */}
                                {activeTab === 'services' && (
                                    <div className="space-y-6">
                                        {/* Highlights */}
                                        <div>
                                            <h3 className="text-[var(--gold-500)] text-sm font-medium mb-3">Highlights (tag principali)</h3>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newHighlight}
                                                    onChange={(e) => setNewHighlight(e.target.value)}
                                                    placeholder="es. Skipper incluso"
                                                    className="flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToList('highlights', newHighlight);
                                                            setNewHighlight('');
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => { addToList('highlights', newHighlight); setNewHighlight(''); }}
                                                    className="btn-gold-outline px-3"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {editingBoat.highlights?.map((h, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--gold-500)]/20 text-[var(--gold-500)] text-sm rounded-full">
                                                        {h}
                                                        <button onClick={() => removeFromList('highlights', i)} className="hover:text-red-400">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Included */}
                                        <div>
                                            <h3 className="text-emerald-400 text-sm font-medium mb-3">Servizi Inclusi</h3>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newIncluded}
                                                    onChange={(e) => setNewIncluded(e.target.value)}
                                                    placeholder="es. Carburante 4h"
                                                    className="flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToList('included_services', newIncluded);
                                                            setNewIncluded('');
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => { addToList('included_services', newIncluded); setNewIncluded(''); }}
                                                    className="btn-gold-outline px-3"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {editingBoat.included_services?.map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2 bg-emerald-500/10 rounded">
                                                        <span className="text-sm text-emerald-400 flex items-center gap-2">
                                                            <Check className="w-4 h-4" /> {s}
                                                        </span>
                                                        <button onClick={() => removeFromList('included_services', i)} className="text-[var(--muted-foreground)] hover:text-red-400">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Excluded */}
                                        <div>
                                            <h3 className="text-red-400 text-sm font-medium mb-3">Servizi Esclusi</h3>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newExcluded}
                                                    onChange={(e) => setNewExcluded(e.target.value)}
                                                    placeholder="es. Pranzo/Cena"
                                                    className="flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToList('excluded_services', newExcluded);
                                                            setNewExcluded('');
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => { addToList('excluded_services', newExcluded); setNewExcluded(''); }}
                                                    className="btn-gold-outline px-3"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {editingBoat.excluded_services?.map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                                                        <span className="text-sm text-red-400 flex items-center gap-2">
                                                            <X className="w-4 h-4" /> {s}
                                                        </span>
                                                        <button onClick={() => removeFromList('excluded_services', i)} className="text-[var(--muted-foreground)] hover:text-red-400">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Extra Services */}
                                        <div>
                                            <h3 className="text-[var(--cream)] text-sm font-medium mb-3">Servizi Extra (con prezzo)</h3>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={newExtra.name}
                                                    onChange={(e) => setNewExtra((prev) => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Servizio"
                                                    className="flex-1"
                                                />
                                                <input
                                                    type="number"
                                                    value={newExtra.price || ''}
                                                    onChange={(e) => setNewExtra((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                                    placeholder="€"
                                                    className="w-20"
                                                />
                                                <select
                                                    value={newExtra.unit}
                                                    onChange={(e) => setNewExtra((prev) => ({ ...prev, unit: e.target.value as 'day' | 'trip' | 'person' }))}
                                                    className="w-24"
                                                >
                                                    <option value="day">/giorno</option>
                                                    <option value="person">/persona</option>
                                                    <option value="trip">/viaggio</option>
                                                </select>
                                                <button onClick={addExtraService} className="btn-gold-outline px-3">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {editingBoat.extra_services?.map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2 bg-[var(--navy-700)] rounded">
                                                        <span className="text-sm text-[var(--cream)]">{s.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-[var(--gold-500)]">
                                                                {formatCurrency(s.price)}/{s.unit === 'day' ? 'giorno' : s.unit === 'person' ? 'persona' : 'viaggio'}
                                                            </span>
                                                            <button onClick={() => removeExtraService(i)} className="text-[var(--muted-foreground)] hover:text-red-400">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cancellation Policy */}
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">Policy di Cancellazione</label>
                                            <textarea
                                                value={editingBoat.cancellation_policy || ''}
                                                onChange={(e) => setEditingBoat((prev) => ({ ...prev, cancellation_policy: e.target.value }))}
                                                rows={2}
                                                placeholder="es. Cancellazione gratuita fino a 7 giorni prima..."
                                                className="w-full resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[var(--border)] flex gap-3">
                                <button onClick={handleCloseModal} className="btn-gold-outline flex-1" disabled={saving}>
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
                                    Sei sicuro di voler eliminare questa barca? L&apos;azione non può essere annullata.
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
                )}
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
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
                )}
            </AnimatePresence>
        </div>
    );
}
