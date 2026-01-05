'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    GripVertical,
    Eye,
    EyeOff,
    User,
    Wine,
    PartyPopper,
    Compass,
    Anchor,
    Languages,
} from 'lucide-react';
import { getAllServices, createService, updateService, deleteService } from '@/lib/supabase';
import type { Service } from '@/lib/types';

const ICON_OPTIONS = [
    { value: 'User', label: 'Skipper', Icon: User },
    { value: 'Wine', label: 'Aperitivo', Icon: Wine },
    { value: 'PartyPopper', label: 'Eventi', Icon: PartyPopper },
    { value: 'Compass', label: 'Tour', Icon: Compass },
    { value: 'Anchor', label: 'Ancora', Icon: Anchor },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    User, Wine, PartyPopper, Compass, Anchor,
};

const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

interface ServiceFormDataExtended {
    name: string;
    name_en: string;
    slug: string;
    description: string;
    description_en: string;
    features: string[];
    features_en: string[];
    price_text: string;
    price_text_en: string;
    icon: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'it' | 'en'>('it');

    const [formData, setFormData] = useState<ServiceFormDataExtended>({
        name: '',
        name_en: '',
        slug: '',
        description: '',
        description_en: '',
        features: [],
        features_en: [],
        price_text: '',
        price_text_en: '',
        icon: 'Anchor',
        image_url: '',
        display_order: 0,
        is_active: true,
    });
    const [featuresText, setFeaturesText] = useState('');
    const [featuresTextEn, setFeaturesTextEn] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await getAllServices();
            setServices(data);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({
            name: '',
            name_en: '',
            slug: '',
            description: '',
            description_en: '',
            features: [],
            features_en: [],
            price_text: '',
            price_text_en: '',
            icon: 'Anchor',
            image_url: '',
            display_order: services.length + 1,
            is_active: true,
        });
        setFeaturesText('');
        setFeaturesTextEn('');
        setActiveTab('it');
        setShowModal(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            name_en: service.name_en || '',
            slug: service.slug,
            description: service.description || '',
            description_en: service.description_en || '',
            features: service.features,
            features_en: service.features_en || [],
            price_text: service.price_text || '',
            price_text_en: service.price_text_en || '',
            icon: service.icon,
            image_url: service.image_url || '',
            display_order: service.display_order,
            is_active: service.is_active,
        });
        setFeaturesText(service.features.join('\n'));
        setFeaturesTextEn((service.features_en || []).join('\n'));
        setActiveTab('it');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
            const features_en = featuresTextEn.split('\n').map(f => f.trim()).filter(Boolean);
            const dataToSave = {
                ...formData,
                features,
                features_en: features_en.length > 0 ? features_en : undefined,
                name_en: formData.name_en || undefined,
                description_en: formData.description_en || undefined,
                price_text_en: formData.price_text_en || undefined,
            };

            if (editingService) {
                await updateService(editingService.id, dataToSave);
            } else {
                await createService(dataToSave);
            }

            await loadServices();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving service:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteService(id);
            setServices(services.filter(s => s.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const toggleActive = async (service: Service) => {
        try {
            await updateService(service.id, { is_active: !service.is_active });
            setServices(services.map(s =>
                s.id === service.id ? { ...s, is_active: !s.is_active } : s
            ));
        } catch (error) {
            console.error('Error toggling service:', error);
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl text-[var(--cream)]">Servizi</h1>
                    <p className="text-[var(--muted-foreground)] text-sm">
                        Gestisci i servizi (IT/EN)
                    </p>
                </div>
                <button onClick={openCreateModal} className="btn-gold">
                    <Plus className="w-4 h-4" />
                    Nuovo Servizio
                </button>
            </div>

            {/* Services List */}
            <div className="space-y-3">
                {services.map((service, index) => {
                    const IconComponent = ICON_MAP[service.icon] || Anchor;
                    const hasTranslation = !!(service.name_en || service.description_en);

                    return (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-[var(--navy-800)] border rounded-xl p-4 flex items-center gap-4 ${service.is_active ? 'border-[var(--border)]' : 'border-red-500/30 opacity-60'
                                }`}
                        >
                            <div className="text-[var(--muted-foreground)] cursor-grab">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="w-12 h-12 rounded-full bg-[var(--navy-700)] flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-6 h-6 text-[var(--gold-500)]" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[var(--cream)] font-medium">{service.name}</h3>
                                    {hasTranslation && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                                            <Languages className="w-3 h-3" />
                                            EN
                                        </span>
                                    )}
                                    {!service.is_active && (
                                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                                            Disattivo
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                                    {service.description}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[var(--gold-500)] text-sm font-medium">
                                        {service.price_text}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(service)}
                                    className={`p-2 rounded-lg transition-colors ${service.is_active
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : 'bg-[var(--navy-700)] text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                        }`}
                                    title={service.is_active ? 'Disattiva' : 'Attiva'}
                                >
                                    {service.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => openEditModal(service)}
                                    className="p-2 bg-[var(--navy-700)] text-[var(--cream)] rounded-lg hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(service.id)}
                                    className="p-2 bg-[var(--navy-700)] text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {services.length === 0 && (
                    <div className="text-center py-12 bg-[var(--navy-800)] border border-[var(--border)] rounded-xl">
                        <p className="text-[var(--muted-foreground)]">Nessun servizio</p>
                        <button onClick={openCreateModal} className="btn-gold-outline mt-4">
                            Crea il primo servizio
                        </button>
                    </div>
                )}
            </div>

            {/* Modal with Language Tabs */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                            <h2 className="font-serif text-xl text-[var(--cream)]">
                                {editingService ? 'Modifica Servizio' : 'Nuovo Servizio'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:text-[var(--gold-500)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Language Tabs */}
                        <div className="flex border-b border-[var(--border)]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('it')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'it'
                                        ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)]'
                                        : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                    }`}
                            >
                                🇮🇹 Italiano
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('en')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'en'
                                        ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)]'
                                        : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                    }`}
                            >
                                🇬🇧 English
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {activeTab === 'it' ? (
                                <>
                                    {/* Italian Fields */}
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Nome (IT) *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                    slug: editingService ? formData.slug : generateSlug(e.target.value),
                                                });
                                            }}
                                            required
                                            className="w-full"
                                            placeholder="Es: Tour Costiero"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Descrizione (IT)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full resize-none"
                                            placeholder="Descrizione del servizio..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Prezzo (IT)</label>
                                        <input
                                            type="text"
                                            value={formData.price_text}
                                            onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                                            className="w-full"
                                            placeholder="Es: Da €150/persona"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Features IT (una per riga)</label>
                                        <textarea
                                            value={featuresText}
                                            onChange={(e) => setFeaturesText(e.target.value)}
                                            rows={4}
                                            className="w-full resize-none"
                                            placeholder="Skipper certificato&#10;Bevande incluse"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* English Fields */}
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-blue-400">
                                            Se lasci vuoto, verrà usata la versione italiana.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Name (EN)</label>
                                        <input
                                            type="text"
                                            value={formData.name_en}
                                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                            className="w-full"
                                            placeholder="Es: Coastal Tour"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Description (EN)</label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                            rows={3}
                                            className="w-full resize-none"
                                            placeholder="Service description..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Price (EN)</label>
                                        <input
                                            type="text"
                                            value={formData.price_text_en}
                                            onChange={(e) => setFormData({ ...formData, price_text_en: e.target.value })}
                                            className="w-full"
                                            placeholder="Es: From €150/person"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Features EN (one per line)</label>
                                        <textarea
                                            value={featuresTextEn}
                                            onChange={(e) => setFeaturesTextEn(e.target.value)}
                                            rows={4}
                                            className="w-full resize-none"
                                            placeholder="Certified skipper&#10;Drinks included"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Common fields - always visible */}
                            <div className="border-t border-[var(--border)] pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-1">Icona</label>
                                        <div className="flex gap-2">
                                            {ICON_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                                                    className={`p-2 rounded-lg border transition-colors ${formData.icon === opt.value
                                                        ? 'border-[var(--gold-500)] bg-[var(--gold-500)]/10'
                                                        : 'border-[var(--border)]'
                                                        }`}
                                                    title={opt.label}
                                                >
                                                    <opt.Icon className={`w-4 h-4 ${formData.icon === opt.value ? 'text-[var(--gold-500)]' : 'text-[var(--cream)]'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm text-[var(--cream)] mb-1">URL Immagine</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-[var(--cream)]">
                                        Servizio attivo
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-gold-outline">
                                    Annulla
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 btn-gold">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingService ? 'Salva' : 'Crea'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 max-w-sm"
                    >
                        <h3 className="text-lg text-[var(--cream)] mb-2">Conferma eliminazione</h3>
                        <p className="text-[var(--muted-foreground)] text-sm mb-4">
                            Sei sicuro di voler eliminare questo servizio?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-gold-outline">
                                Annulla
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                                Elimina
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
