'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, Calendar, ArrowLeft, User, Clock, MapPin, Users, Star, Check, Phone } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { getLocalizedArticleBySlug, getLocalizedArticles, getSiteSetting } from '@/lib/supabase';
import type { Article } from '@/lib/types';

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const t = useTranslations('article');
    const tBlog = useTranslations('blog');
    const locale = useLocale();
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [contactPhone, setContactPhone] = useState<string>('+39 320 094 1490');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [slug, locale]);

    const loadData = async () => {
        try {
            const [articleData, allArticles, phone] = await Promise.all([
                getLocalizedArticleBySlug(slug, locale),
                getLocalizedArticles(locale),
                getSiteSetting('contact_phone'),
            ]);

            setArticle(articleData);
            if (phone) setContactPhone(phone);

            // Get related articles (same category, excluding current)
            if (articleData) {
                const related = allArticles
                    .filter(a => a.id !== articleData.id)
                    .slice(0, 3);
                setRelatedArticles(related);
            }
        } catch (error) {
            console.error('Error loading article:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="font-serif text-3xl text-[var(--cream)] mb-4">{tBlog('noArticles')}</h1>
                <Link href="/blog" className="text-[var(--gold-500)] hover:underline">
                    {tBlog('backToBlog')}
                </Link>
            </div>
        );
    }

    const isEscursione = article.category === 'escursioni';

    return (
        <>
            {/* Hero - Compact & Impactful */}
            <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{
                        backgroundImage: article.cover_image
                            ? `url(${article.cover_image})`
                            : 'linear-gradient(135deg, var(--navy-800), var(--navy-900))',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/60 via-[var(--navy-900)]/75 to-[var(--navy-900)]" />

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--gold-500)]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-[var(--gold-500)]/5 rounded-full blur-3xl" />

                <div className="container-luxury relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        {/* Back Link */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {tBlog('backToBlog')}
                        </Link>

                        {/* Category Badge */}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase bg-[var(--gold-500)] text-[var(--navy-900)] rounded-full mb-4"
                        >
                            {tBlog(`categories.${article.category}`)}
                        </motion.span>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[var(--cream)] mb-4 leading-tight"
                        >
                            {article.title}
                        </motion.h1>

                        {/* Excerpt - Premium Style */}
                        {article.excerpt && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-[var(--cream)]/90 font-light leading-relaxed max-w-2xl"
                            >
                                {article.excerpt}
                            </motion.p>
                        )}

                        {/* Meta Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex flex-wrap items-center gap-4 mt-6 text-sm text-[var(--muted-foreground)]"
                        >
                            {article.published_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[var(--gold-500)]" />
                                    <span>{formatDate(article.published_at)}</span>
                                </div>
                            )}
                            {article.author && (
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[var(--gold-500)]" />
                                    <span>{article.author}</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Info Cards - For Escursioni */}
            {isEscursione && (
                <section className="py-8 bg-[var(--navy-800)]/50 border-y border-[var(--border)]">
                    <div className="container-luxury">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            <div className="glass-card p-4 text-center">
                                <Clock className="w-6 h-6 text-[var(--gold-500)] mx-auto mb-2" />
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{t('info.duration')}</p>
                                <p className="text-[var(--cream)] font-medium">{t('info.fullDay')}</p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <MapPin className="w-6 h-6 text-[var(--gold-500)] mx-auto mb-2" />
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{t('info.departure')}</p>
                                <p className="text-[var(--cream)] font-medium">{t('info.portRimini')}</p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <Users className="w-6 h-6 text-[var(--gold-500)] mx-auto mb-2" />
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{t('info.group')}</p>
                                <p className="text-[var(--cream)] font-medium">{t('info.maxPeople')}</p>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <Star className="w-6 h-6 text-[var(--gold-500)] mx-auto mb-2" />
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{t('info.experience')}</p>
                                <p className="text-[var(--cream)] font-medium">{t('info.premium')}</p>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <section className="py-12 md:py-16">
                <div className="container-luxury">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Article Content */}
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="lg:col-span-2"
                        >
                            <div className="prose prose-lg prose-invert max-w-none
                                prose-headings:font-serif prose-headings:text-[var(--cream)] prose-headings:font-normal
                                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[var(--border)]
                                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[var(--gold-500)]
                                prose-p:text-[var(--muted-foreground)] prose-p:leading-relaxed prose-p:mb-4
                                prose-strong:text-[var(--cream)] prose-strong:font-medium
                                prose-a:text-[var(--gold-500)] prose-a:no-underline hover:prose-a:underline
                                prose-blockquote:border-l-4 prose-blockquote:border-[var(--gold-500)] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-[var(--cream)] prose-blockquote:bg-[var(--navy-800)]/50 prose-blockquote:rounded-r-lg
                                prose-hr:border-[var(--border)] prose-hr:my-8"
                            >
                                <ReactMarkdown>{article.content}</ReactMarkdown>
                            </div>
                        </motion.article>

                        {/* Sidebar - Dynamic */}
                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-1"
                        >
                            <div className="sticky top-24 space-y-6">
                                {/* CTA Card */}
                                <div className="bg-gradient-to-br from-[var(--navy-800)] to-[var(--navy-900)] border border-[var(--gold-500)]/30 rounded-2xl p-6 shadow-lg">
                                    <div className="text-center mb-6">
                                        <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('sidebar.requestQuote')}</p>
                                        <p className="font-serif text-2xl text-[var(--gold-500)]">{t('sidebar.personalized')}</p>
                                        <p className="text-sm text-[var(--muted-foreground)]">{t('sidebar.forYourExperience')}</p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span className="text-[var(--cream)]">{t('sidebar.professionalSkipper')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span className="text-[var(--cream)]">{t('sidebar.drinksIncluded')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span className="text-[var(--cream)]">{t('sidebar.snorkelingGear')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span className="text-[var(--cream)]">{t('sidebar.freeCancellation')}</span>
                                        </div>
                                    </div>

                                    <Link href="/contact" className="btn-gold w-full justify-center text-center">
                                        {t('sidebar.bookNow')}
                                    </Link>

                                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[var(--muted-foreground)]">
                                        <Phone className="w-4 h-4" />
                                        <span>{contactPhone}</span>
                                    </div>
                                </div>

                                {/* Related Articles - Dynamic */}
                                {relatedArticles.length > 0 && (
                                    <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-xl p-5">
                                        <h4 className="font-serif text-lg text-[var(--cream)] mb-4">{t('sidebar.otherExperiences')}</h4>
                                        <div className="space-y-3">
                                            {relatedArticles.map((related) => (
                                                <Link
                                                    key={related.id}
                                                    href={`/blog/${related.slug}`}
                                                    className="block p-3 bg-[var(--navy-700)]/50 rounded-lg hover:bg-[var(--navy-700)] transition-colors"
                                                >
                                                    <p className="text-sm text-[var(--cream)] font-medium line-clamp-1">{related.title}</p>
                                                    <p className="text-xs text-[var(--muted-foreground)]">
                                                        {tBlog(`categories.${related.category}`)}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 bg-gradient-to-r from-[var(--navy-800)] via-[var(--navy-900)] to-[var(--navy-800)] border-t border-[var(--border)]">
                <div className="container-luxury text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-3xl md:text-4xl text-[var(--cream)] mb-3">
                            {t('cta.title')}
                        </h2>
                        <p className="text-[var(--muted-foreground)] mb-8 max-w-xl mx-auto">
                            {t('cta.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/blog" className="btn-gold-outline">
                                {t('cta.discoverMore')}
                            </Link>
                            <Link href="/contact" className="btn-gold">
                                {t('cta.contactNow')}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
