'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, Ruler, ArrowRight } from 'lucide-react';
import type { Boat, FleetCardProps } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

export function FleetCard({ boat, index = 0 }: FleetCardProps) {
    const t = useTranslations('fleet');

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/fleet/${boat.slug}`} className="group block">
                <article className="luxury-card">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                            src={boat.image_url || '/placeholder-boat.jpg'}
                            alt={boat.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-900)] via-transparent to-transparent opacity-60" />

                        {/* Type Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 text-xs tracking-wider uppercase bg-[var(--gold-500)] text-[var(--navy-900)] font-medium">
                                {t(`types.${boat.type}`)}
                            </span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 text-sm bg-[var(--navy-900)]/80 backdrop-blur-sm text-[var(--cream)] border border-[var(--border)]">
                                {formatCurrency(boat.price_full_day)}{t('perDay')}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="font-serif text-2xl text-[var(--cream)] mb-2 group-hover:text-[var(--gold-500)] transition-colors">
                            {boat.name}
                        </h3>

                        {boat.description && (
                            <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-2">
                                {boat.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4">
                            {boat.capacity && (
                                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                    <Users className="w-4 h-4 text-[var(--gold-500)]" />
                                    <span>{boat.capacity} {t('guests')}</span>
                                </div>
                            )}
                            {boat.length && (
                                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                    <Ruler className="w-4 h-4 text-[var(--gold-500)]" />
                                    <span>{boat.length}</span>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-[var(--gold-500)] text-sm font-medium group-hover:gap-3 transition-all">
                            <span>{t('learnMore')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}

interface FleetGridProps {
    boats: Boat[];
    title?: string;
    subtitle?: string;
    className?: string;
}

export function FleetGrid({ boats, title, subtitle, className }: FleetGridProps) {
    return (
        <section className={cn('section-padding', className)}>
            <div className="container-luxury">
                {(title || subtitle) && (
                    <div className="text-center mb-16">
                        {subtitle && (
                            <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                                {subtitle}
                            </span>
                        )}
                        {title && (
                            <h2 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-4">
                                {title}
                            </h2>
                        )}
                        <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-500)] to-transparent mx-auto" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {boats.map((boat, index) => (
                        <FleetCard key={boat.id} boat={boat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
