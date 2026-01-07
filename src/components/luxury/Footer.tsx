'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail, Instagram, Facebook, Clock } from 'lucide-react';

const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
];

export function Footer() {
    const t = useTranslations('footer');
    const tNav = useTranslations('nav');
    const locale = useLocale();
    const currentYear = new Date().getFullYear();

    const navItems = [
        { label: tNav('home'), href: '/' },
        { label: tNav('fleet'), href: '/fleet' },
        { label: tNav('excursions'), href: '/escursioni' },
        { label: tNav('services'), href: '/services' },
        { label: tNav('blog'), href: '/blog' },
        { label: tNav('contact'), href: '/contact' },
    ];

    const contactInfo = [
        { icon: MapPin, text: 'Marina di Rimini, Porto Turistico' },
        { icon: Phone, text: '+39 320 094 1490' },
        { icon: Mail, text: 'enrico@yachtme.it' },
        { icon: Clock, text: 'Lun - Dom: 8:00 - 20:00' },
    ];

    return (
        <footer className="mt-16 bg-[var(--navy-800)] border-t border-[var(--border)]">
            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-[var(--gold-600)] via-[var(--gold-500)] to-[var(--gold-600)]">
                <div className="container-luxury py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div>
                            <h3 className="font-serif text-2xl md:text-3xl text-[var(--navy-900)] mb-2">
                                {t('ctaTitle')}
                            </h3>
                            <p className="text-[var(--navy-900)]/80">
                                {t('ctaSubtitle')}
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="bg-[var(--navy-900)] text-[var(--cream)] px-8 py-4 text-sm uppercase tracking-wider font-medium hover:bg-[var(--navy-800)] transition-colors"
                        >
                            {t('ctaButton')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-luxury py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <div className="flex flex-col">
                                <span className="font-serif text-2xl text-[var(--gold-500)] tracking-tight font-semibold">
                                    YACHT<span className="text-[var(--cream)]">~</span>ME
                                </span>
                                <span className="text-[9px] tracking-[0.25em] text-[var(--muted-foreground)] uppercase">
                                    Riviera Sea Life
                                </span>
                            </div>
                        </Link>
                        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6">
                            {t('brandDescription')}
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold-500)] hover:text-[var(--gold-500)] transition-colors"
                                    aria-label={label}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 className="font-serif text-lg text-[var(--cream)] mb-6">{t('navigation')}</h4>
                        <ul className="space-y-3">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Fleet Column */}
                    <div>
                        <h4 className="font-serif text-lg text-[var(--cream)] mb-6">{t('theFleet')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/fleet?type=motor_yacht_20m" className="text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm">
                                    {t('motorYacht')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet?type=sailboat_14m" className="text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm">
                                    {t('sailboats')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet?type=dinghy" className="text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm">
                                    {t('dinghies')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet?type=jetski" className="text-[var(--muted-foreground)] hover:text-[var(--gold-500)] transition-colors text-sm">
                                    {t('jetskis')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-serif text-lg text-[var(--cream)] mb-6">{t('contacts')}</h4>
                        <ul className="space-y-4">
                            {contactInfo.map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-start gap-3">
                                    <Icon className="w-4 h-4 text-[var(--gold-500)] mt-0.5 flex-shrink-0" />
                                    <span className="text-[var(--muted-foreground)] text-sm">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[var(--border)]">
                <div className="container-luxury py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <p className="text-[var(--muted-foreground)] text-xs">
                            © {currentYear} YACHT~ME - Riviera Sea Life. {t('allRightsReserved')}.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--gold-500)]">
                                {t('privacyPolicy')}
                            </Link>
                            <Link href="/cookie" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--gold-500)]">
                                Cookie Policy
                            </Link>
                            <Link href="/terms" className="text-[var(--muted-foreground)] text-xs hover:text-[var(--gold-500)]">
                                {t('termsConditions')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
