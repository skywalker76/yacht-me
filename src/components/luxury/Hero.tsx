'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import type { HeroProps } from '@/lib/types';

export function Hero({
    title,
    subtitle,
    backgroundImage,
    ctaText = 'Scopri la Flotta',
    ctaHref = '/fleet',
    showScroll = true,
}: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    const words = title.split(' ');

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    y: backgroundY,
                    scale,
                }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/70 via-[var(--navy-900)]/50 to-[var(--navy-900)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-900)]/40 to-transparent" />

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 container-luxury text-center px-4"
            >
                {/* Animated Title */}
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--cream)] mb-6 leading-tight">
                    {words.map((word, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.3 + index * 0.15,
                                ease: [0.25, 0.4, 0.25, 1],
                            }}
                            className="inline-block mr-4"
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10"
                    >
                        {subtitle}
                    </motion.p>
                )}

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <a href={ctaHref} className="btn-gold group">
                        {ctaText}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/contact" className="btn-gold-outline">
                        Contattaci
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            {showScroll && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs tracking-[0.3em] text-[var(--gold-500)] uppercase">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronDown className="w-5 h-5 text-[var(--gold-500)]" />
                    </motion.div>
                </motion.div>
            )}

            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-[var(--gold-500)]/30 to-transparent hidden lg:block" />
            <div className="absolute top-1/4 right-8 w-px h-32 bg-gradient-to-b from-transparent via-[var(--gold-500)]/30 to-transparent hidden lg:block" />
        </section>
    );
}
