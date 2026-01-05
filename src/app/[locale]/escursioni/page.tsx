'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Calendar, ArrowRight, Compass, Clock, Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getArticles, getSiteSetting } from '@/lib/supabase';
import type { Article } from '@/lib/types';

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80';

export default function EscursioniPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [articlesData, image] = await Promise.all([
                getArticles({ category: 'escursioni', status: 'published' }),
                getSiteSetting('services_hero_image'),
            ]);
            setArticles(articlesData);
            if (image) setHeroImage(image);
        } catch (error) {
            console.error('Error loading escursioni:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
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
                            Scopri la Riviera
                        </span>
                        <h1 className="font-serif text-5xl md:text-6xl text-[var(--cream)] mb-6">
                            Le Nostre Escursioni
                        </h1>
                        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
                            Itinerari esclusivi per esplorare le meraviglie della costa adriatica
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 bg-[var(--navy-800)] border-y border-[var(--border)]">
                <div className="container-luxury">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Compass, label: 'Tour Guidati', desc: 'Con skipper esperto' },
                            { icon: Clock, label: 'Mezza/Intera Giornata', desc: 'Flessibilità totale' },
                            { icon: Users, label: 'Gruppi Privati', desc: 'Esperienza esclusiva' },
                            { icon: MapPin, label: 'Mete Uniche', desc: 'Luoghi nascosti' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <feature.icon className="w-8 h-8 text-[var(--gold-500)] mx-auto mb-3" />
                                <h3 className="text-[var(--cream)] font-medium mb-1">{feature.label}</h3>
                                <p className="text-[var(--muted-foreground)] text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Escursioni List */}
            <section className="section-padding">
                <div className="container-luxury">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20">
                            <Compass className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
                            <h2 className="font-serif text-2xl text-[var(--cream)] mb-2">
                                Nuove escursioni in arrivo
                            </h2>
                            <p className="text-[var(--muted-foreground)] mb-6">
                                Stiamo preparando itinerari esclusivi per te
                            </p>
                            <Link href="/contact" className="btn-gold">
                                Contattaci per Proposte
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {articles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.15 }}
                                    className="group"
                                >
                                    <Link href={`/blog/${article.slug}`}>
                                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                                            }`}>
                                            {/* Image */}
                                            <div className={`relative aspect-[16/10] rounded-xl overflow-hidden ${index % 2 === 1 ? 'lg:col-start-2' : ''
                                                }`}>
                                                {article.cover_image ? (
                                                    <img
                                                        src={article.cover_image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-[var(--navy-800)] flex items-center justify-center">
                                                        <Compass className="w-16 h-16 text-[var(--muted-foreground)]" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-900)]/50 to-transparent" />
                                            </div>

                                            {/* Content */}
                                            <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                                                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(article.published_at)}</span>
                                                </div>

                                                <h2 className="font-serif text-3xl text-[var(--cream)] mb-4 group-hover:text-[var(--gold-500)] transition-colors">
                                                    {article.title}
                                                </h2>

                                                {article.excerpt && (
                                                    <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
                                                        {article.excerpt}
                                                    </p>
                                                )}

                                                <span className="inline-flex items-center text-[var(--gold-500)] font-medium">
                                                    Scopri l'itinerario
                                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-[var(--navy-800)]">
                <div className="container-luxury text-center">
                    <h2 className="font-serif text-3xl text-[var(--cream)] mb-4">
                        Vuoi un&apos;escursione personalizzata?
                    </h2>
                    <p className="text-[var(--muted-foreground)] max-w-xl mx-auto mb-8">
                        Creiamo itinerari su misura per te: destinazioni speciali,
                        soste per nuotare, pranzo in baia e molto altro.
                    </p>
                    <Link href="/contact" className="btn-gold">
                        Richiedi Preventivo
                    </Link>
                </div>
            </section>
        </>
    );
}
