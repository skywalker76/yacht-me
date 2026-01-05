'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { FleetCard } from '@/components/luxury';
import type { Boat, BoatType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getLocalizedBoats, getSiteSetting } from '@/lib/supabase';

const DEFAULT_FLEET_IMAGE = 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80';

const filterValues: (BoatType | 'all')[] = ['all', 'motor_yacht_20m', 'sailboat_14m', 'dinghy', 'jetski'];

export default function FleetPage() {
    const t = useTranslations('fleetPage');
    const tTypes = useTranslations('fleet.types');
    const locale = useLocale();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<BoatType | 'all'>('all');
    const [heroImage, setHeroImage] = useState(DEFAULT_FLEET_IMAGE);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [boatsData, fleetImage] = await Promise.all([
                    getLocalizedBoats(locale),
                    getSiteSetting('fleet_hero_image'),
                ]);
                setBoats(boatsData);
                if (fleetImage) setHeroImage(fleetImage);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [locale]);

    const filteredBoats = activeFilter === 'all'
        ? boats
        : boats.filter(boat => boat.type === activeFilter);

    const getFilterLabel = (value: BoatType | 'all') => {
        if (value === 'all') return t('all');
        return tTypes(value);
    };

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${heroImage})`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/80 via-[var(--navy-900)]/60 to-[var(--navy-900)]" />

                <div className="container-luxury relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                            {t('sectionTitle')}
                        </span>
                        <h1 className="font-serif text-5xl md:text-6xl text-[var(--cream)] mb-6">
                            {t('title')}
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="sticky top-20 z-30 bg-[var(--navy-900)]/95 backdrop-blur-md border-b border-[var(--border)]">
                <div className="container-luxury py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {filterValues.map((value) => (
                            <button
                                key={value}
                                onClick={() => setActiveFilter(value)}
                                className={cn(
                                    'px-5 py-2 text-sm whitespace-nowrap transition-all',
                                    activeFilter === value
                                        ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                        : 'border border-[var(--border)] text-[var(--cream)] hover:border-[var(--gold-500)]'
                                )}
                            >
                                {getFilterLabel(value)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fleet Grid */}
            <section className="section-padding">
                <div className="container-luxury">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
                        </div>
                    ) : (
                        <motion.div
                            key={activeFilter}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredBoats.map((boat, index) => (
                                <FleetCard key={boat.id} boat={boat} index={index} />
                            ))}
                        </motion.div>
                    )}

                    {!loading && filteredBoats.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-[var(--muted-foreground)]">
                                {t('noBoats')}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
