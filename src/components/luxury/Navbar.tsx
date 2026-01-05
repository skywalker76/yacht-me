'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { locales, localeFlags, localeNames, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('nav');

    // Navigation items with translations
    const navItems = [
        { label: t('home'), href: '/' },
        { label: t('fleet'), href: '/fleet' },
        { label: t('excursions'), href: '/escursioni' },
        { label: t('services'), href: '/services' },
        { label: t('blog'), href: '/blog' },
        { label: t('contact'), href: '/contact' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setLangOpen(false);
    }, [pathname]);

    // Function to switch locale - using next-intl's router
    const switchLocale = (newLocale: Locale) => {
        router.replace(pathname, { locale: newLocale });
        setLangOpen(false);
    };

    // Check if current path matches nav item
    const isActive = (href: string) => {
        return pathname === href || (href !== '/' && pathname.startsWith(href));
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                isScrolled
                    ? 'bg-[var(--navy-900)]/95 backdrop-blur-md border-b border-[var(--border)]'
                    : 'bg-transparent'
            )}
        >
            <nav className="container-luxury">
                <div className="flex items-center justify-between h-20 md:h-24">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <div className="flex flex-col">
                            <span className="font-serif text-2xl md:text-4xl text-[var(--gold-500)] tracking-tight font-semibold">
                                YACHT<span className="text-[var(--cream)]">~</span>ME
                            </span>
                            <span className="text-[9px] md:text-xs tracking-[0.25em] text-[var(--muted-foreground)] uppercase">
                                Riviera Sea Life
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'relative text-sm tracking-wide transition-colors',
                                    isActive(item.href)
                                        ? 'text-[var(--gold-500)]'
                                        : 'text-[var(--cream)] hover:text-[var(--gold-500)]'
                                )}
                            >
                                {item.label}
                                {isActive(item.href) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[var(--gold-500)]"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* CTA + Language Switcher */}
                    <div className="hidden lg:flex items-center gap-4">
                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--cream)] hover:text-[var(--gold-500)] transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{localeFlags[locale as Locale]}</span>
                            </button>
                            <AnimatePresence>
                                {langOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-full mt-2 bg-[var(--navy-800)] border border-[var(--border)] rounded-lg overflow-hidden shadow-lg"
                                    >
                                        {locales.map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => switchLocale(loc)}
                                                className={cn(
                                                    'flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors',
                                                    locale === loc
                                                        ? 'bg-[var(--gold-500)]/10 text-[var(--gold-500)]'
                                                        : 'text-[var(--cream)] hover:bg-[var(--navy-700)]'
                                                )}
                                            >
                                                <span className="text-lg">{localeFlags[loc]}</span>
                                                <span>{localeNames[loc]}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link href="/contact" className="btn-gold-outline text-xs py-3 px-5">
                            {locale === 'en' ? 'Book Now' : 'Prenota Ora'}
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-[var(--cream)]"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-[var(--navy-900)]/98 backdrop-blur-md border-t border-[var(--border)]"
                    >
                        <div className="container-luxury py-6 space-y-4">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'block py-3 text-lg font-serif',
                                            isActive(item.href)
                                                ? 'text-[var(--gold-500)]'
                                                : 'text-[var(--cream)]'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Mobile Language Switcher */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: navItems.length * 0.1 }}
                                className="flex gap-3 py-3 border-t border-[var(--border)]"
                            >
                                {locales.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => switchLocale(loc)}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                                            locale === loc
                                                ? 'bg-[var(--gold-500)] text-[var(--navy-900)]'
                                                : 'bg-[var(--navy-800)] text-[var(--cream)]'
                                        )}
                                    >
                                        <span>{localeFlags[loc]}</span>
                                        <span>{localeNames[loc]}</span>
                                    </button>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navItems.length + 1) * 0.1 }}
                                className="pt-4"
                            >
                                <Link href="/contact" className="btn-gold w-full text-center">
                                    {locale === 'en' ? 'Book Now' : 'Prenota Ora'}
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
