'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Upload, Loader2, Sparkles, Trash2, Languages } from 'lucide-react';
import Link from 'next/link';
import { getArticleById, updateArticle, deleteArticle, uploadSiteImage, generateSlug } from '@/lib/supabase';
import type { Article, ArticleCategory, ArticleStatus } from '@/lib/types';
import { ARTICLE_CATEGORY_LABELS, ARTICLE_STATUS_LABELS } from '@/lib/types';

interface ArticleFormDataExtended {
    title: string;
    title_en: string;
    slug: string;
    excerpt: string;
    excerpt_en: string;
    content: string;
    content_en: string;
    cover_image: string;
    category: ArticleCategory;
    status: ArticleStatus;
    author: string;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState<'it' | 'en'>('it');
    const [formData, setFormData] = useState<ArticleFormDataExtended>({
        title: '',
        title_en: '',
        slug: '',
        excerpt: '',
        excerpt_en: '',
        content: '',
        content_en: '',
        cover_image: '',
        category: 'blog',
        status: 'draft',
        author: '',
    });

    useEffect(() => {
        loadArticle();
    }, [id]);

    const loadArticle = async () => {
        try {
            const data = await getArticleById(id);
            if (data) {
                setArticle(data);
                setFormData({
                    title: data.title,
                    title_en: data.title_en || '',
                    slug: data.slug,
                    excerpt: data.excerpt || '',
                    excerpt_en: data.excerpt_en || '',
                    content: data.content,
                    content_en: data.content_en || '',
                    cover_image: data.cover_image || '',
                    category: data.category,
                    status: data.status,
                    author: data.author || '',
                });
            }
        } catch (error) {
            console.error('Error loading article:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadSiteImage(file, 'article');
            setFormData(prev => ({ ...prev, cover_image: url }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Errore durante il caricamento dell\'immagine');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, status?: ArticleStatus) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            alert('Titolo e contenuto sono obbligatori');
            return;
        }

        try {
            setSaving(true);
            const dataToSave = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt || undefined,
                content: formData.content,
                cover_image: formData.cover_image || undefined,
                category: formData.category,
                status: status || formData.status,
                author: formData.author || undefined,
                // English fields - only save if provided
                title_en: formData.title_en || undefined,
                excerpt_en: formData.excerpt_en || undefined,
                content_en: formData.content_en || undefined,
            };
            await updateArticle(id, dataToSave);
            router.push('/admin/articles');
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Errore durante il salvataggio dell\'articolo');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await deleteArticle(id);
            router.push('/admin/articles');
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Errore durante l\'eliminazione dell\'articolo');
        } finally {
            setSaving(false);
        }
    };

    const hasTranslation = !!(formData.title_en || formData.content_en);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl text-[var(--cream)] mb-2">Articolo non trovato</h2>
                <Link href="/admin/articles" className="text-[var(--gold-500)] hover:underline">
                    Torna alla lista
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/articles"
                        className="p-2 hover:bg-[var(--navy-700)] rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-serif text-[var(--cream)]">Modifica Articolo</h1>
                            {hasTranslation && (
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                                    <Languages className="w-3 h-3" />
                                    EN
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--muted-foreground)]">{article.title}</p>
                    </div>
                </div>
                {article.status === 'published' && (
                    <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="btn-gold-outline flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Visualizza
                    </Link>
                )}
            </div>

            <form onSubmit={e => handleSubmit(e)} className="space-y-6">
                {/* Cover Image */}
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6">
                    <label className="block text-sm font-medium text-[var(--cream)] mb-4">
                        Immagine di Copertina
                    </label>
                    <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-[var(--navy-700)] border-2 border-dashed border-[var(--border)]">
                        {formData.cover_image ? (
                            <>
                                <img
                                    src={formData.cover_image}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="btn-gold cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Cambia Immagine
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--navy-600)] transition-colors">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-[var(--muted-foreground)] mb-2" />
                                        <span className="text-[var(--muted-foreground)]">
                                            Carica un'immagine di copertina
                                        </span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Language Tabs */}
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg overflow-hidden">
                    <div className="flex border-b border-[var(--border)]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('it')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'it'
                                    ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)] bg-[var(--navy-700)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                }`}
                        >
                            🇮🇹 Italiano
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'en'
                                    ? 'text-[var(--gold-500)] border-b-2 border-[var(--gold-500)] bg-[var(--navy-700)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--cream)]'
                                }`}
                        >
                            🇬🇧 English
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {activeTab === 'it' ? (
                            <>
                                {/* Italian Content */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Titolo (IT) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Inserisci il titolo dell'articolo"
                                        className="w-full px-4 py-3 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] text-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Estratto (IT)
                                    </label>
                                    <textarea
                                        value={formData.excerpt || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        placeholder="Breve descrizione dell'articolo"
                                        rows={2}
                                        className="w-full px-4 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Contenuto (IT) * <span className="text-[var(--muted-foreground)] font-normal">(Supporta Markdown)</span>
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Scrivi il contenuto dell'articolo..."
                                        rows={15}
                                        className="w-full px-4 py-3 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] font-mono text-sm resize-y"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* English Content */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-blue-400">
                                        Se lasci vuoto, verrà usata la versione italiana.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Title (EN)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title_en}
                                        onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                        placeholder="Enter article title in English"
                                        className="w-full px-4 py-3 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Excerpt (EN)
                                    </label>
                                    <textarea
                                        value={formData.excerpt_en}
                                        onChange={e => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                                        placeholder="Brief article description in English"
                                        rows={2}
                                        className="w-full px-4 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                                        Content (EN) <span className="text-[var(--muted-foreground)] font-normal">(Supports Markdown)</span>
                                    </label>
                                    <textarea
                                        value={formData.content_en}
                                        onChange={e => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                                        placeholder="Write article content in English..."
                                        rows={15}
                                        className="w-full px-4 py-3 bg-[var(--navy-700)] border border-[var(--border)] rounded-lg text-[var(--cream)] font-mono text-sm resize-y"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Slug */}
                <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6">
                    <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                        Slug (URL)
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">/blog/</span>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="url-articolo"
                            className="flex-1 px-4 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded text-[var(--cream)]"
                        />
                    </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4">
                        <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                            Categoria
                        </label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as ArticleCategory }))}
                            className="w-full px-3 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded text-[var(--cream)]"
                        >
                            {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4">
                        <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                            Stato
                        </label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ArticleStatus }))}
                            className="w-full px-3 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded text-[var(--cream)]"
                        >
                            {Object.entries(ARTICLE_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4">
                        <label className="block text-sm font-medium text-[var(--cream)] mb-2">
                            Autore
                        </label>
                        <input
                            type="text"
                            value={formData.author || ''}
                            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Nome autore"
                            className="w-full px-3 py-2 bg-[var(--navy-700)] border border-[var(--border)] rounded text-[var(--cream)]"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-4">
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-gold-outline flex items-center gap-2"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Salva
                        </button>
                        {formData.status === 'draft' && (
                            <button
                                type="button"
                                onClick={e => handleSubmit(e as any, 'published')}
                                disabled={saving}
                                className="btn-gold flex items-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                                Pubblica
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6 max-w-md mx-4"
                    >
                        <h3 className="text-lg font-serif text-[var(--cream)] mb-2">
                            Conferma Eliminazione
                        </h3>
                        <p className="text-[var(--muted-foreground)] mb-6">
                            Sei sicuro di voler eliminare l'articolo "{article.title}"? Questa azione non può essere annullata.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded hover:bg-[var(--navy-600)] transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Elimina
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
