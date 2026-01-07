'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ChevronDown, ChevronUp, Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCookieConsent, CookieConsent } from '@/contexts/CookieConsentContext';

export function CookieBanner() {
    const t = useTranslations('cookieBanner');
    const locale = useLocale();
    const { showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent();
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState<Partial<CookieConsent>>({
        analytics: false,
        marketing: false,
        maps: true,
    });

    if (!showBanner) return null;

    const togglePreference = (key: keyof Omit<CookieConsent, 'necessary'>) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
            >
                <div className="max-w-4xl mx-auto bg-[var(--navy-800)] border border-[var(--gold-500)]/30 rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--gold-500)]/10 flex items-center justify-center flex-shrink-0">
                                <Cookie className="w-6 h-6 text-[var(--gold-500)]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-serif text-xl text-[var(--cream)] mb-2">
                                    {t('title')}
                                </h3>
                                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                                    {t('description')}{' '}
                                    <Link href={`/${locale}/cookie`} className="text-[var(--gold-500)] hover:underline">
                                        Cookie Policy
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Details Panel */}
                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-[var(--border)]"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Necessary Cookies - Always enabled */}
                                    <div className="flex items-center justify-between p-4 bg-[var(--navy-700)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-[var(--gold-500)]" />
                                            <div>
                                                <p className="text-[var(--cream)] font-medium">{t('necessary')}</p>
                                                <p className="text-[var(--muted-foreground)] text-xs">{t('necessaryDesc')}</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-[var(--gold-500)] rounded-full flex items-center justify-end px-1">
                                            <div className="w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </div>

                                    {/* Maps Cookie */}
                                    <CookieToggle
                                        label={t('maps')}
                                        description={t('mapsDesc')}
                                        checked={preferences.maps ?? false}
                                        onChange={() => togglePreference('maps')}
                                    />

                                    {/* Analytics Cookie */}
                                    <CookieToggle
                                        label={t('analytics')}
                                        description={t('analyticsDesc')}
                                        checked={preferences.analytics ?? false}
                                        onChange={() => togglePreference('analytics')}
                                    />

                                    {/* Marketing Cookie */}
                                    <CookieToggle
                                        label={t('marketing')}
                                        description={t('marketingDesc')}
                                        checked={preferences.marketing ?? false}
                                        onChange={() => togglePreference('marketing')}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="p-6 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--cream)] transition-colors text-sm"
                        >
                            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {t('customize')}
                        </button>
                        <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={rejectAll}
                                className="px-6 py-3 border border-[var(--border)] text-[var(--cream)] hover:bg-[var(--navy-700)] transition-colors text-sm font-medium rounded-lg"
                            >
                                {t('rejectAll')}
                            </button>
                            {showDetails ? (
                                <button
                                    onClick={() => savePreferences(preferences)}
                                    className="px-6 py-3 bg-[var(--gold-500)] text-[var(--navy-900)] hover:bg-[var(--gold-400)] transition-colors text-sm font-medium rounded-lg"
                                >
                                    {t('save')}
                                </button>
                            ) : (
                                <button
                                    onClick={acceptAll}
                                    className="px-6 py-3 bg-[var(--gold-500)] text-[var(--navy-900)] hover:bg-[var(--gold-400)] transition-colors text-sm font-medium rounded-lg"
                                >
                                    {t('acceptAll')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function CookieToggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-[var(--navy-700)] rounded-lg">
            <div>
                <p className="text-[var(--cream)] font-medium">{label}</p>
                <p className="text-[var(--muted-foreground)] text-xs">{description}</p>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${checked ? 'bg-[var(--gold-500)] justify-end' : 'bg-[var(--navy-600)] justify-start'
                    }`}
            >
                <div className="w-4 h-4 bg-white rounded-full" />
            </button>
        </div>
    );
}
