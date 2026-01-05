'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Upload,
    Check,
    AlertCircle,
    Loader2,
    RefreshCw,
    Save,
    Building,
    Phone,
    Mail,
    Clock,
    MapPin,
    Facebook,
    Instagram,
    MessageCircle,
    Palette,
} from 'lucide-react';
import {
    getSiteSettings,
    updateSiteSetting,
    uploadSiteImage,
    type SiteSetting,
} from '@/lib/supabase';
import { useTheme, THEMES } from '@/components/ThemeProvider';

const IMAGE_SETTINGS = ['hero_image', 'fleet_hero_image', 'contact_hero_image', 'services_hero_image', 'about_section_image'];

const SETTING_LABELS: Record<string, { label: string; description: string; icon?: React.ComponentType<{ className?: string }> }> = {
    hero_image: { label: 'Homepage Hero', description: 'Homepage' },
    fleet_hero_image: { label: 'Pagina Flotta', description: 'Flotta' },
    contact_hero_image: { label: 'Pagina Contatti', description: 'Contatti' },
    services_hero_image: { label: 'Pagina Servizi', description: 'Servizi' },
    about_section_image: { label: 'Chi Siamo', description: 'About' },
    site_name: { label: 'Nome Sito', description: '', icon: Building },
    site_tagline: { label: 'Slogan', description: '', icon: Building },
    contact_email: { label: 'Email', description: '', icon: Mail },
    contact_phone: { label: 'Tel 1', description: '', icon: Phone },
    contact_phone_2: { label: 'Tel 2', description: '', icon: Phone },
    contact_address: { label: 'Indirizzo', description: '', icon: MapPin },
    contact_hours: { label: 'Orari', description: '', icon: Clock },
    social_facebook: { label: 'Facebook', description: '', icon: Facebook },
    social_instagram: { label: 'Instagram', description: '', icon: Instagram },
    social_whatsapp: { label: 'WhatsApp', description: '', icon: MessageCircle },
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
            showNotification('error', 'Errore nel caricamento');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 2000);
    };

    const handleTextChange = (key: string, value: string) => {
        setPendingChanges(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveText = async (key: string) => {
        const value = pendingChanges[key];
        if (value === undefined) return;

        setSaving(key);
        try {
            await updateSiteSetting(key, value);
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
            setPendingChanges(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            showNotification('success', 'Salvato');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('error', 'Errore');
        } finally {
            setSaving(null);
        }
    };

    const handleFileUpload = async (key: string, file: File) => {
        if (!file.type.startsWith('image/')) {
            showNotification('error', 'Solo immagini');
            return;
        }

        setSaving(key);
        try {
            const url = await uploadSiteImage(file, key);
            await updateSiteSetting(key, url);
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value: url } : s));
            showNotification('success', 'Caricata');
        } catch (error) {
            console.error('Error uploading:', error);
            showNotification('error', 'Errore upload');
        } finally {
            setSaving(null);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';
    const hasPendingChange = (key: string) => pendingChanges[key] !== undefined;

    const imageSettings = settings.filter(s => IMAGE_SETTINGS.includes(s.key));
    const siteInfoSettings = settings.filter(s => s.key.startsWith('site_'));
    const contactSettings = settings.filter(s => s.key.startsWith('contact_'));
    const socialSettings = settings.filter(s => s.key.startsWith('social_'));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    const TextSettingRow = ({ setting }: { setting: SiteSetting }) => {
        const meta = SETTING_LABELS[setting.key] || { label: setting.key, description: '' };
        const Icon = meta.icon;
        const currentValue = pendingChanges[setting.key] ?? setting.value ?? '';
        const hasChange = hasPendingChange(setting.key);
        const isSaving = saving === setting.key;

        return (
            <div className="flex items-center gap-2 py-1.5">
                {Icon && <Icon className="w-4 h-4 text-[var(--gold-500)] flex-shrink-0" />}
                <span className="text-xs text-[var(--muted-foreground)] w-16 flex-shrink-0">{meta.label}</span>
                <input
                    type="text"
                    value={currentValue}
                    onChange={e => handleTextChange(setting.key, e.target.value)}
                    className="flex-1 bg-[var(--navy-700)] border-none py-1 px-2 text-sm text-[var(--cream)] rounded"
                />
                {hasChange && (
                    <button
                        onClick={() => handleSaveText(setting.key)}
                        disabled={isSaving}
                        className="p-1 bg-[var(--gold-500)] text-[var(--navy-900)] rounded hover:bg-[var(--gold-400)]"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    </button>
                )}
            </div>
        );
    };

    const ThemeSection = () => {
        const { theme, setTheme, isLoading } = useTheme();

        return (
            <div className="grid grid-cols-4 gap-2">
                {THEMES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        disabled={isLoading}
                        className={`relative p-2 rounded-lg border transition-all ${theme === t.id
                                ? 'border-[var(--gold-500)] ring-1 ring-[var(--gold-500)]'
                                : 'border-[var(--border)] hover:border-[var(--gold-500)]/50'
                            }`}
                        style={{ backgroundColor: t.colors.bg }}
                    >
                        <div className="flex gap-1 justify-center mb-1">
                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.colors.accent }} />
                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.colors.text }} />
                        </div>
                        <span className="text-xs font-medium block text-center" style={{ color: t.colors.text }}>{t.name}</span>
                        {theme === t.id && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--gold-500)] rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-[var(--navy-900)]" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl text-[var(--cream)]">Impostazioni</h1>
                <button onClick={loadSettings} className="btn-gold-outline text-xs py-1.5 px-3">
                    <RefreshCw className="w-3 h-3" />
                    Ricarica
                </button>
            </div>

            {/* Grid Layout - 2 columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                    {/* Site Info */}
                    {siteInfoSettings.length > 0 && (
                        <section className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-3">
                            <h2 className="text-sm font-medium text-[var(--cream)] mb-2 flex items-center gap-2">
                                <Building className="w-4 h-4 text-[var(--gold-500)]" />
                                Info Sito
                            </h2>
                            <div className="space-y-1">
                                {siteInfoSettings.map(setting => (
                                    <TextSettingRow key={setting.id} setting={setting} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Theme */}
                    <section className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-3">
                        <h2 className="text-sm font-medium text-[var(--cream)] mb-2 flex items-center gap-2">
                            <Palette className="w-4 h-4 text-[var(--gold-500)]" />
                            Tema
                        </h2>
                        <ThemeSection />
                    </section>

                    {/* Contacts */}
                    {contactSettings.length > 0 && (
                        <section className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-3">
                            <h2 className="text-sm font-medium text-[var(--cream)] mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[var(--gold-500)]" />
                                Contatti
                            </h2>
                            <div className="space-y-1">
                                {contactSettings.map(setting => (
                                    <TextSettingRow key={setting.id} setting={setting} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Social */}
                    {socialSettings.length > 0 && (
                        <section className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-3">
                            <h2 className="text-sm font-medium text-[var(--cream)] mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-[var(--gold-500)]" />
                                Social
                            </h2>
                            <div className="space-y-1">
                                {socialSettings.map(setting => (
                                    <TextSettingRow key={setting.id} setting={setting} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT COLUMN - Images */}
                <section className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-3">
                    <h2 className="text-sm font-medium text-[var(--cream)] mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[var(--gold-500)]" />
                        Immagini di Sfondo
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {imageSettings.map((setting) => {
                            const meta = SETTING_LABELS[setting.key] || { label: setting.key };
                            const isSaving = saving === setting.key;

                            return (
                                <div key={setting.id} className="space-y-1">
                                    <div className="relative aspect-[16/10] bg-[var(--navy-700)] rounded-lg overflow-hidden group">
                                        {setting.value ? (
                                            <img
                                                src={setting.value}
                                                alt={meta.label}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
                                            </div>
                                        )}
                                        {isSaving && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-[var(--gold-500)]" />
                                            </div>
                                        )}
                                        {/* Overlay Upload Button */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => fileInputRefs.current[setting.key]?.click()}
                                                disabled={isSaving}
                                                className="p-2 bg-[var(--gold-500)] text-[var(--navy-900)] rounded-full"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-[var(--muted-foreground)]">{meta.label}</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => { fileInputRefs.current[setting.key] = el; }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(setting.key, file);
                                        }}
                                        className="hidden"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {settings.length === 0 && (
                <div className="text-center py-8 bg-[var(--navy-800)] border border-[var(--border)] rounded-xl">
                    <AlertCircle className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-[var(--cream)] text-sm">Nessuna impostazione trovata</p>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {notification.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{notification.message}</span>
                </motion.div>
            )}
        </div>
    );
}
