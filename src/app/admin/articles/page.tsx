'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, FileText, Loader2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { getArticles, deleteArticle } from '@/lib/supabase';
import type { Article, ArticleCategory, ArticleStatus } from '@/lib/types';
import { ARTICLE_CATEGORY_LABELS, ARTICLE_STATUS_LABELS } from '@/lib/types';

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            setLoading(true);
            const data = await getArticles();
            setArticles(data);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteArticle(id);
            setArticles(prev => prev.filter(a => a.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-[var(--cream)]">Articoli</h1>
                    <p className="text-[var(--muted-foreground)]">
                        Gestisci gli articoli del blog, escursioni e contenuti
                    </p>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="btn-gold inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuovo Articolo
                </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--navy-800)] p-4 rounded-lg border border-[var(--border)]">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Cerca articoli..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded text-[var(--cream)]"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as ArticleCategory | 'all')}
                    className="bg-[var(--navy-700)] border border-[var(--border)] rounded px-3 py-2 text-[var(--cream)]"
                >
                    <option value="all">Tutte le categorie</option>
                    {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as ArticleStatus | 'all')}
                    className="bg-[var(--navy-700)] border border-[var(--border)] rounded px-3 py-2 text-[var(--cream)]"
                >
                    <option value="all">Tutti gli stati</option>
                    {Object.entries(ARTICLE_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Articles List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-[var(--navy-800)] rounded-lg border border-[var(--border)]">
                    <FileText className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                    <h3 className="text-lg text-[var(--cream)] mb-2">Nessun articolo trovato</h3>
                    <p className="text-[var(--muted-foreground)] mb-6">
                        {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                            ? 'Prova a modificare i filtri di ricerca'
                            : 'Crea il tuo primo articolo per iniziare'}
                    </p>
                    {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
                        <Link href="/admin/articles/new" className="btn-gold-outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Crea Articolo
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredArticles.map((article, index) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Cover Image */}
                                    <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                                        {article.cover_image ? (
                                            <img
                                                src={article.cover_image}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[var(--navy-700)] flex items-center justify-center">
                                                <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 text-xs rounded ${article.status === 'published'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {ARTICLE_STATUS_LABELS[article.status]}
                                                    </span>
                                                    <span className="px-2 py-0.5 text-xs rounded bg-[var(--navy-600)] text-[var(--muted-foreground)]">
                                                        {ARTICLE_CATEGORY_LABELS[article.category]}
                                                    </span>
                                                </div>
                                                <h3 className="font-serif text-lg text-[var(--cream)] mb-1">
                                                    {article.title}
                                                </h3>
                                                {article.excerpt && (
                                                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                                                        {article.excerpt}
                                                    </p>
                                                )}
                                                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                                                    {article.status === 'published' ? 'Pubblicato' : 'Creato'}: {formatDate(article.published_at || article.created_at)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {article.status === 'published' && (
                                                    <Link
                                                        href={`/blog/${article.slug}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-[var(--navy-600)] rounded transition-colors"
                                                        title="Visualizza"
                                                    >
                                                        <Eye className="w-4 h-4 text-[var(--muted-foreground)]" />
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/admin/articles/${article.id}`}
                                                    className="p-2 hover:bg-[var(--navy-600)] rounded transition-colors"
                                                    title="Modifica"
                                                >
                                                    <Edit2 className="w-4 h-4 text-[var(--gold-500)]" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(article.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                                                    title="Elimina"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Confirm */}
                                <AnimatePresence>
                                    {deleteConfirm === article.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-[var(--border)] bg-red-500/10 overflow-hidden"
                                        >
                                            <div className="p-4 flex items-center justify-between">
                                                <p className="text-sm text-red-400">
                                                    Sei sicuro di voler eliminare questo articolo?
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-3 py-1 text-sm border border-[var(--border)] rounded hover:bg-[var(--navy-600)]"
                                                    >
                                                        Annulla
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Elimina
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--cream)]">{articles.length}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Totale</p>
                </div>
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{articles.filter(a => a.status === 'published').length}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Pubblicati</p>
                </div>
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{articles.filter(a => a.status === 'draft').length}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Bozze</p>
                </div>
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--gold-500)]">{articles.filter(a => a.category === 'escursioni').length}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Escursioni</p>
                </div>
            </div>
        </div>
    );
}
