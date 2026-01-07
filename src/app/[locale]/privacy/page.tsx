'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, FileText, Users, Clock, Scale, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    const t = useTranslations('privacy');

    const sections = [
        {
            icon: Shield,
            title: t('controller'),
            content: `
**YACHT~ME - Riviera Sea Life**
[Inserire Ragione Sociale Completa]
[Inserire Indirizzo Sede Legale]
P.IVA: [Inserire P.IVA]
Email: privacy@yachtme.it
            `.trim()
        },
        {
            icon: FileText,
            title: t('purposes'),
            content: `
I tuoi dati personali sono trattati per le seguenti finalità:

• **Risposta alle richieste di contatto** - Quando compili il form di contatto, utilizziamo i tuoi dati (nome, email, telefono, messaggio) per rispondere alla tua richiesta.
• **Assistenza via chat** - I messaggi inviati tramite il nostro assistente virtuale Marina vengono elaborati per fornirti informazioni sui nostri servizi.
• **Gestione delle prenotazioni** - Se effettui una prenotazione, i tuoi dati sono necessari per l'esecuzione del contratto.
            `.trim()
        },
        {
            icon: Scale,
            title: t('legalBasis'),
            content: `
Il trattamento dei tuoi dati si basa su:

• **Consenso** (Art. 6(1)(a) GDPR) - Per l'invio di comunicazioni promozionali.
• **Esecuzione contrattuale** (Art. 6(1)(b) GDPR) - Per la gestione delle prenotazioni.
• **Legittimo interesse** (Art. 6(1)(f) GDPR) - Per rispondere alle tue richieste di informazioni.
            `.trim()
        },
        {
            icon: Clock,
            title: t('dataRetention'),
            content: `
• **Dati di contatto**: Conservati per 2 anni dall'ultimo contatto.
• **Dati di prenotazione**: Conservati per 10 anni per obblighi fiscali.
• **Messaggi chat**: Conservati per 6 mesi per finalità di assistenza.
            `.trim()
        },
        {
            icon: Users,
            title: t('rights'),
            content: `
Hai il diritto di:

• Accedere ai tuoi dati personali
• Rettificare dati inesatti
• Cancellare i tuoi dati ("diritto all'oblio")
• Limitare il trattamento
• Portabilità dei dati
• Opporti al trattamento
• Revocare il consenso in qualsiasi momento

Per esercitare i tuoi diritti, contattaci all'indirizzo **privacy@yachtme.it**.

Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).
            `.trim()
        },
        {
            icon: Mail,
            title: t('contact'),
            content: `
Per qualsiasi domanda relativa al trattamento dei tuoi dati personali, puoi contattarci:

**Email**: privacy@yachtme.it
**Indirizzo**: [Inserire indirizzo]
            `.trim()
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
                        <Shield className="w-16 h-16 text-[var(--gold-500)] mx-auto mb-6" />
                        <h1 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-[var(--muted-foreground)]">
                            {t('lastUpdate')}: 7 Gennaio 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="section-padding">
                <div className="container-luxury max-w-4xl">
                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-6 md:p-8"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--gold-500)]/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-[var(--gold-500)]" />
                                    </div>
                                    <h2 className="font-serif text-xl text-[var(--cream)]">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="text-[var(--muted-foreground)] text-sm leading-relaxed whitespace-pre-line prose prose-invert prose-sm max-w-none">
                                    {section.content.split('**').map((part, i) =>
                                        i % 2 === 0 ? part : <strong key={i} className="text-[var(--cream)]">{part}</strong>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Back Link */}
                    <div className="mt-12 text-center">
                        <Link href="/" className="text-[var(--gold-500)] hover:underline">
                            ← Torna alla Home
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
