'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hero, FleetGrid } from '@/components/luxury';
import { Anchor, Shield, Star, Users, MapPin, Phone, Mail } from 'lucide-react';
import type { Boat } from '@/lib/types';

interface HomePageClientProps {
    heroImage: string;
    aboutImage: string;
    boats: Boat[];
}

export default function HomePageClient({ heroImage, aboutImage, boats }: HomePageClientProps) {
    const t = useTranslations();

    const features = [
        {
            icon: Anchor,
            title: t('features.premiumFleet.title'),
            description: t('features.premiumFleet.description'),
        },
        {
            icon: Shield,
            title: t('features.safety.title'),
            description: t('features.safety.description'),
        },
        {
            icon: Star,
            title: t('features.experience.title'),
            description: t('features.experience.description'),
        },
        {
            icon: Users,
            title: t('features.team.title'),
            description: t('features.team.description'),
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <Hero
                title={t('hero.title')}
                subtitle={t('hero.subtitle')}
                backgroundImage={heroImage}
                ctaText={t('hero.cta')}
                ctaHref="/fleet"
            />

            {/* Features Section */}
            <section className="section-padding bg-[var(--navy-800)]">
                <div className="container-luxury">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                            {t('features.sectionTitle')}
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-4">
                            {t('features.title')}
                        </h2>
                        <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-500)] to-transparent mx-auto" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[var(--gold-500)] rounded-full">
                                    <feature.icon className="w-7 h-7 text-[var(--gold-500)]" />
                                </div>
                                <h3 className="font-serif text-xl text-[var(--cream)] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--muted-foreground)] text-sm">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fleet Section */}
            <FleetGrid
                boats={boats}
                title={t('fleet.title')}
                subtitle={t('fleet.sectionTitle')}
            />

            {/* CTA Section */}
            <section className="relative py-32 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed"
                    style={{
                        backgroundImage: `url(${aboutImage})`,
                    }}
                />
                <div className="absolute inset-0 bg-[var(--navy-900)]/80" />
                <div className="container-luxury relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-4xl md:text-5xl text-[var(--cream)] mb-6">
                            {t('cta.readyToSail')}
                        </h2>
                        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto mb-10">
                            {t('cta.contactUs')}
                        </p>
                        <a href="/contact" className="btn-gold">
                            {t('cta.bookExperience')}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Location Section */}
            <section className="section-padding">
                <div className="container-luxury">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                                {t('location.sectionTitle')}
                            </span>
                            <h2 className="font-serif text-4xl text-[var(--cream)] mb-6">
                                {t('location.title')}
                            </h2>
                            <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
                                {t('location.description')}
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-5 h-5 text-[var(--gold-500)]" />
                                    <span className="text-[var(--cream)]">Porto Turistico, Marina di Rimini</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="w-5 h-5 text-[var(--gold-500)]" />
                                    <span className="text-[var(--cream)]">+39 320 094 1490</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-[var(--gold-500)]" />
                                    <span className="text-[var(--cream)]">enrico@yachtme.it</span>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="aspect-video rounded-lg overflow-hidden"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2867.8!2d12.5725!3d44.0775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132cc3d5e3c5c5c5%3A0x1234567890abcdef!2sPorto%20Turistico%20Marina%20di%20Rimini!5e0!3m2!1sit!2sit!4v1704067200000"
                                width="100%"
                                height="100%"
                                style={{ border: 0, minHeight: '350px' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}
