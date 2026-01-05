'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, Calendar, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { getLocalizedArticles, getSiteSetting } from '@/lib/supabase';
import type { Article, ArticleCategory } from '@/lib/types';

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';

const categories: ArticleCategory[] = ['blog', 'escursioni', 'news', 'info'];

export default function BlogPage() {
    const t = useTranslations('blog');
    const locale = useLocale();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE);
    const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'all'>('all');

    useEffect(() => {
        loadData();
    }, [locale]);

    const loadData = async () => {
        try {
            const [articlesData, image] = await Promise.all([
                getLocalizedArticles(locale),
                getSiteSetting('contact_hero_image'),
            ]);
            setArticles(articlesData);
            if (image) setHeroImage(image);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = activeCategory === 'all'
        ? articles
        : articles.filter(a => a.category === activeCategory);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'it-IT', {
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
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        <Filter className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 text-sm whitespace-nowrap transition-all rounded ${activeCategory === 'all'
                                ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                : 'border border-[var(--border)] text-[var(--cream)] hover:border-[var(--gold-500)]'
                                }`}
                        >
                            {t('categories.all')}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm whitespace-nowrap transition-all rounded ${activeCategory === category
                                    ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                    : 'border border-[var(--border)] text-[var(--cream)] hover:border-[var(--gold-500)]'
                                    }`}
                            >
                                {t(`categories.${category}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="section-padding">
                <div className="container-luxury">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
                        </div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--muted-foreground)] text-lg">
                                {t('noArticles')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredArticles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <Link href={`/blog/${article.slug}`} className="block">
                                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4">
                                            {article.cover_image ? (
                                                <img
                                                    src={article.cover_image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--navy-800)] flex items-center justify-center">
                                                    <span className="text-4xl">🚤</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-900)]/60 to-transparent" />
                                            <span className="absolute top-4 left-4 px-3 py-1 text-xs bg-[var(--gold-500)] text-[var(--navy-900)] rounded">
                                                {t(`categories.${article.category}`)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(article.published_at)}</span>
                                        </div>

                                        <h2 className="font-serif text-xl text-[var(--cream)] mb-2 group-hover:text-[var(--gold-500)] transition-colors">
                                            {article.title}
                                        </h2>

                                        {article.excerpt && (
                                            <p className="text-[var(--muted-foreground)] text-sm line-clamp-2 mb-4">
                                                {article.excerpt}
                                            </p>
                                        )}

                                        <span className="inline-flex items-center text-[var(--gold-500)] text-sm font-medium">
                                            {t('readMore')}
                                            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
