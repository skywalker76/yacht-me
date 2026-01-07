'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Cookie, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export default function CookiePage() {
    const t = useTranslations('cookie');
    const locale = useLocale();
    const { setShowBanner, consent } = useCookieConsent();

    const cookieTypes = [
        {
            name: 'Cookie Tecnici (Necessari)',
            description: 'Essenziali per il funzionamento del sito. Includono cookie per la gestione della sessione e delle preferenze di lingua.',
            examples: 'NEXT_LOCALE, yacht-me-cookie-consent',
            duration: 'Sessione / 1 anno',
            always: true
        },
        {
            name: 'Google Maps',
            description: 'Utilizziamo Google Maps per mostrarti la posizione del nostro porto base. Questi cookie sono impostati da Google quando carichi la mappa.',
            examples: 'NID, 1P_JAR, CONSENT',
            duration: 'Variabile (fino a 2 anni)',
            always: false
        }
    ];

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)]" />
                <div className="container-luxury relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Cookie className="w-16 h-16 text-[var(--gold-500)] mx-auto mb-6" />
                        <h1 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-4">
                            {t('title')}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="section-padding">
                <div className="container-luxury max-w-4xl space-y-12">
                    {/* What Are Cookies */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 md:p-8"
                    >
                        <h2 className="font-serif text-xl text-[var(--cream)] mb-4">{t('whatAreCookies')}</h2>
                        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                            I cookie sono piccoli file di testo che vengono salvati sul tuo dispositivo quando visiti un sito web.
                            Servono a ricordare le tue preferenze, migliorare la tua esperienza di navigazione e, in alcuni casi,
                            a fornire funzionalità aggiuntive come mappe interattive.
                        </p>
                    </motion.div>

                    {/* Cookies Used */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 md:p-8"
                    >
                        <h2 className="font-serif text-xl text-[var(--cream)] mb-6">{t('cookiesUsed')}</h2>
                        <div className="space-y-6">
                            {cookieTypes.map((cookie, index) => (
                                <div key={index} className="border-b border-[var(--border)] pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[var(--cream)] font-medium">{cookie.name}</h3>
                                        {cookie.always ? (
                                            <span className="text-xs bg-[var(--gold-500)]/20 text-[var(--gold-500)] px-2 py-1 rounded">
                                                Sempre attivo
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-[var(--navy-700)] text-[var(--muted-foreground)] px-2 py-1 rounded">
                                                {consent?.maps ? 'Attivo' : 'Disattivato'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--muted-foreground)] text-sm mb-2">{cookie.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-[var(--muted-foreground)]">
                                        <div>
                                            <span className="text-[var(--cream)]">Cookie:</span> {cookie.examples}
                                        </div>
                                        <div>
                                            <span className="text-[var(--cream)]">Durata:</span> {cookie.duration}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Manage Cookies */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 md:p-8"
                    >
                        <h2 className="font-serif text-xl text-[var(--cream)] mb-4">{t('manage')}</h2>
                        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6">
                            Puoi modificare le tue preferenze sui cookie in qualsiasi momento cliccando il pulsante qui sotto,
                            oppure cancellando i cookie direttamente dal tuo browser.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowBanner(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--gold-500)] text-[var(--navy-900)] hover:bg-[var(--gold-400)] transition-colors text-sm font-medium rounded-lg"
                            >
                                <Settings className="w-4 h-4" />
                                Modifica Preferenze Cookie
                            </button>
                        </div>
                    </motion.div>

                    {/* Back Link */}
                    <div className="text-center">
                        <Link href={`/${locale}/privacy`} className="text-[var(--gold-500)] hover:underline">
                            ← Leggi anche la Privacy Policy
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
