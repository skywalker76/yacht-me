'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, CreditCard, XCircle, Scale, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    const t = useTranslations('terms');

    const sections = [
        {
            icon: CheckCircle,
            title: t('acceptance'),
            content: `
Utilizzando il sito web YACHT~ME e i nostri servizi, accetti di essere vincolato dai presenti Termini e Condizioni. 
Se non accetti questi termini, ti preghiamo di non utilizzare il nostro sito o i nostri servizi.
            `.trim()
        },
        {
            icon: FileText,
            title: t('services'),
            content: `
YACHT~ME offre servizi di noleggio imbarcazioni con e senza equipaggio, escursioni in mare e eventi privati. 
Tutti i servizi sono soggetti a disponibilità e alle condizioni meteorologiche.

Le immagini e le descrizioni presenti sul sito sono indicative e possono variare.
            `.trim()
        },
        {
            icon: CreditCard,
            title: t('reservations'),
            content: `
• Le prenotazioni sono confermate al ricevimento dell'acconto del 30%.
• Il saldo deve essere versato almeno 7 giorni prima della data del noleggio.
• I prezzi indicati sono da intendersi IVA inclusa, salvo diversa indicazione.
• Lo skipper, ove incluso, è sempre a carico del noleggiatore.
            `.trim()
        },
        {
            icon: XCircle,
            title: t('cancellation'),
            content: `
• Cancellazione oltre 30 giorni: rimborso completo dell'acconto.
• Cancellazione tra 15 e 30 giorni: rimborso del 50% dell'acconto.
• Cancellazione sotto i 15 giorni: nessun rimborso.
• In caso di maltempo certificato, la prenotazione può essere spostata senza penali.
            `.trim()
        },
        {
            icon: Scale,
            title: t('liability'),
            content: `
YACHT~ME si impegna a fornire imbarcazioni in perfetto stato di manutenzione e conformi alle normative di sicurezza.

Il noleggiatore è responsabile per eventuali danni causati all'imbarcazione per negligenza o uso improprio.
È obbligatoria un'assicurazione responsabilità civile, inclusa nel prezzo del noleggio.
            `.trim()
        },
        {
            icon: Gavel,
            title: t('law'),
            content: `
I presenti Termini e Condizioni sono regolati dalla legge italiana.
Per qualsiasi controversia è competente il Foro di Rimini.
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
                        <FileText className="w-16 h-16 text-[var(--gold-500)] mx-auto mb-6" />
                        <h1 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-4">
                            {t('title')}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="section-padding">
                <div className="container-luxury max-w-4xl">
                    <div className="space-y-8">
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
                                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
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
