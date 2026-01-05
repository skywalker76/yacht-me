'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface BoatGalleryProps {
    images: string[];
    boatName: string;
}

export function BoatGallery({ images, boatName }: BoatGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    if (!images.length) return null;

    return (
        <>
            {/* Main Gallery */}
            <section className="relative">
                {/* Main Image */}
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentIndex]}
                                alt={`${boatName} - Immagine ${currentIndex + 1}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-900)] via-transparent to-transparent" />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[var(--navy-900)]/80 text-[var(--cream)] hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors rounded-full"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-[var(--navy-900)]/80 text-[var(--cream)] hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors rounded-full"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Zoom Button */}
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-[var(--navy-900)]/80 text-[var(--cream)] hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors rounded-lg text-sm"
                    >
                        <ZoomIn className="w-4 h-4" />
                        <span className="hidden sm:inline">{currentIndex + 1}/{images.length}</span>
                    </button>

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                                            ? 'bg-[var(--gold-500)]'
                                            : 'bg-[var(--cream)]/50 hover:bg-[var(--cream)]/80'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnail Grid */}
                {images.length > 1 && (
                    <div className="container-luxury py-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentIndex
                                            ? 'border-[var(--gold-500)]'
                                            : 'border-transparent hover:border-[var(--gold-500)]/50'
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${boatName} - Miniatura ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white hover:text-[var(--gold-500)] transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="relative w-full h-full max-w-6xl max-h-[80vh] mx-4">
                            <Image
                                src={images[currentIndex]}
                                alt={`${boatName} - Immagine ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 text-white hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors rounded-full"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 text-white hover:bg-[var(--gold-500)] hover:text-[var(--navy-900)] transition-colors rounded-full"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
