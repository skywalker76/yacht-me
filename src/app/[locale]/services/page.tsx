'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { User, Wine, PartyPopper, Compass, Anchor, ArrowRight, Loader2 } from 'lucide-react';
import { getLocalizedServices, getSiteSetting } from '@/lib/supabase';
import type { Service } from '@/lib/types';

const DEFAULT_SERVICES_IMAGE = 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1920&q=80';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    User: User,
    Wine: Wine,
    PartyPopper: PartyPopper,
    Compass: Compass,
    Anchor: Anchor,
};

export default function ServicesPage() {
    const t = useTranslations('services');
    const locale = useLocale();
    const [services, setServices] = useState<Service[]>([]);
    const [heroImage, setHeroImage] = useState(DEFAULT_SERVICES_IMAGE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [servicesData, image] = await Promise.all([
                    getLocalizedServices(locale),
                    getSiteSetting('services_hero_image'),
                ]);
                setServices(servicesData);
                if (image) setHeroImage(image);
            } catch (error) {
                console.error('Error loading services:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [locale]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/80 via-[var(--navy-900)]/60 to-[var(--navy-900)]" />

                <div className="container-luxury relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                            {t('sectionTitle')}
                        </span>
                        <h1 className="font-serif text-5xl md:text-6xl text-[var(--cream)] mb-4">
                            {t('title')}
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="section-padding">
                <div className="container-luxury">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service, index) => {
                            const IconComponent = ICON_MAP[service.icon] || Anchor;

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-[var(--navy-800)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--gold-500)]/50 transition-all"
                                >
                                    <div className="grid md:grid-cols-2">
                                        <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                                style={{ backgroundImage: `url(${service.image_url || DEFAULT_SERVICES_IMAGE})` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--navy-800)]/80 md:block hidden" />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--navy-700)] border border-[var(--border)] flex items-center justify-center">
                                                    <IconComponent className="w-5 h-5 text-[var(--gold-500)]" />
                                                </div>
                                                <h2 className="font-serif text-xl text-[var(--cream)]">
                                                    {service.name}
                                                </h2>
                                            </div>

                                            <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-2">
                                                {service.description}
                                            </p>

                                            <ul className="space-y-1.5 mb-4">
                                                {service.features.slice(0, 3).map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--cream)]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-500)]" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--gold-500)] font-semibold">
                                                    {service.price_text}
                                                </span>
                                                <a href="/contact" className="text-sm text-[var(--cream)] hover:text-[var(--gold-500)] transition-colors flex items-center gap-1">
                                                    {t('requestInfo')}
                                                    <ArrowRight className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {services.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-[var(--muted-foreground)]">No services available</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[var(--navy-800)]">
                <div className="container-luxury text-center">
                    <h2 className="font-serif text-3xl text-[var(--cream)] mb-4">
                        {t('specialIdea')}
                    </h2>
                    <p className="text-[var(--muted-foreground)] max-w-xl mx-auto mb-6">
                        {t('specialIdeaText')}
                    </p>
                    <a href="/contact" className="btn-gold">
                        {t('talkTogether')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </section>
        </>
    );
}
