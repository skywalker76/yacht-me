'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    X,
    Check,
    Loader2,
} from 'lucide-react';
import type { Boat } from '@/lib/types';
import { BOAT_TYPE_LABELS } from '@/lib/types';
import { getBoatBySlug } from '@/lib/supabase';
import { BoatGallery } from '@/components/luxury/BoatGallery';
import { BoatHighlights } from '@/components/luxury/BoatHighlights';
import { BoatSpecs } from '@/components/luxury/BoatSpecs';
import { BoatFeaturesList } from '@/components/luxury/BoatFeaturesList';
import { BoatPricing } from '@/components/luxury/BoatPricing';

export default function BoatDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [boat, setBoat] = useState<Boat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        async function loadBoat() {
            try {
                setLoading(true);
                const data = await getBoatBySlug(slug);
                if (data) {
                    setBoat(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error loading boat:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            loadBoat();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-500)]" />
            </div>
        );
    }

    if (error || !boat) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h1 className="font-serif text-3xl text-[var(--cream)] mb-4">
                        Barca non trovata
                    </h1>
                    <Link href="/fleet" className="btn-gold-outline">
                        Torna alla Flotta
                    </Link>
                </div>
            </div>
        );
    }

    const images = boat.gallery_urls && boat.gallery_urls.length > 0
        ? boat.gallery_urls
        : boat.image_url
            ? [boat.image_url]
            : [];

    return (
        <>
            <div className="pt-20">
                {/* Back Button */}
                <div className="container-luxury py-6">
                    <Link
                        href="/fleet"
                        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alla Flotta
                    </Link>
                </div>

                {/* Image Gallery */}
                {images.length > 0 && (
                    <BoatGallery images={images} boatName={boat.name} />
                )}

                {/* Highlights Bar */}
                {(boat.highlights?.length || boat.included_services?.length || boat.excluded_services?.length) && (
                    <div className="container-luxury py-6">
                        <BoatHighlights
                            highlights={boat.highlights}
                            included={boat.included_services?.slice(0, 2)}
                            excluded={boat.excluded_services?.slice(0, 1)}
                        />
                    </div>
                )}

                {/* Content */}
                <section className="section-padding pt-0">
                    <div className="container-luxury">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-12">
                                {/* Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span className="text-[var(--gold-500)] text-sm tracking-wider uppercase">
                                        {BOAT_TYPE_LABELS[boat.type]}
                                    </span>
                                    <h1 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mt-2 mb-4">
                                        {boat.name}
                                    </h1>

                                    {boat.location && (
                                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                                            <MapPin className="w-4 h-4 text-[var(--gold-500)]" />
                                            <span>{boat.location}</span>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Description */}
                                {boat.description && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5 }}
                                        className="prose prose-invert"
                                    >
                                        <h2 className="font-serif text-2xl text-[var(--cream)] mb-4">
                                            Descrizione
                                        </h2>
                                        <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                                            {boat.description}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Technical Specs */}
                                <BoatSpecs boat={boat} />

                                {/* Features */}
                                {boat.features && Object.keys(boat.features).length > 0 && (
                                    <BoatFeaturesList features={boat.features} />
                                )}
                            </div>

                            {/* Sidebar - Pricing */}
                            <div className="lg:col-span-1">
                                <BoatPricing
                                    boat={boat}
                                    onBookingClick={() => setIsBookingModalOpen(true)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setIsBookingModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[var(--navy-800)] rounded-xl border border-[var(--border)] w-full max-w-lg p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--cream)]"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="font-serif text-2xl text-[var(--cream)] mb-6">
                                Richiedi Disponibilità
                            </h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Nome *</label>
                                    <input type="text" placeholder="Il tuo nome" className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Email *</label>
                                    <input type="email" placeholder="email@esempio.com" className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Telefono</label>
                                    <input type="tel" placeholder="+39 333 123 4567" className="w-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Data Inizio *</label>
                                        <input type="date" className="w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">Data Fine *</label>
                                        <input type="date" className="w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--cream)] mb-2">Note</label>
                                    <textarea rows={3} placeholder="Richieste speciali..." className="w-full resize-none" />
                                </div>
                                <button type="submit" className="btn-gold w-full">
                                    <Check className="w-4 h-4 mr-2" />
                                    Invia Richiesta
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
