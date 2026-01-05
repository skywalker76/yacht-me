'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Anchor } from 'lucide-react';
import { getSiteSetting } from '@/lib/supabase';

const DEFAULT_CONTACT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';

interface ContactInfo {
    icon: typeof MapPin;
    titleKey: string;
    content: string[];
}

export default function ContactPage() {
    const t = useTranslations('contact');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [heroImage, setHeroImage] = useState(DEFAULT_CONTACT_IMAGE);
    const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: '',
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [image, address, phone1, phone2, email, hours] = await Promise.all([
                    getSiteSetting('contact_hero_image'),
                    getSiteSetting('contact_address'),
                    getSiteSetting('contact_phone'),
                    getSiteSetting('contact_phone_2'),
                    getSiteSetting('contact_email'),
                    getSiteSetting('contact_hours'),
                ]);

                if (image) setHeroImage(image);

                const info: ContactInfo[] = [];
                if (address) {
                    info.push({ icon: MapPin, titleKey: 'visitUs', content: address.split(',').map(s => s.trim()) });
                }
                if (phone1 || phone2) {
                    const phones = [phone1, phone2].filter(Boolean) as string[];
                    info.push({ icon: Phone, titleKey: 'callUs', content: phones });
                }
                if (email) {
                    info.push({ icon: Mail, titleKey: 'writeUs', content: [email] });
                }
                if (hours) {
                    info.push({ icon: Clock, titleKey: 'hours', content: [hours] });
                }
                setContactInfo(info);
            } catch (error) {
                console.error('Error loading contact data:', error);
            }
        }
        loadData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/80 via-[var(--navy-900)]/60 to-[var(--navy-900)]" />

                <div className="container-luxury relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <span className="text-[var(--gold-500)] text-sm tracking-[0.3em] uppercase mb-4 block">
                            {t('sectionTitle')}
                        </span>
                        <h1 className="font-serif text-5xl md:text-6xl text-[var(--cream)] mb-6">{t('title')}</h1>
                        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section-padding">
                <div className="container-luxury">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Form */}
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <h2 className="font-serif text-3xl text-[var(--cream)] mb-6">{t('form.send')}</h2>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[var(--navy-800)] border border-[var(--gold-500)]/30 rounded-lg p-8 text-center"
                                >
                                    <CheckCircle className="w-16 h-16 text-[var(--gold-500)] mx-auto mb-4" />
                                    <h3 className="font-serif text-2xl text-[var(--cream)] mb-2">{t('success')}</h3>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">{t('form.name')} *</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">{t('form.email')} *</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">{t('form.phone')}</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[var(--cream)] mb-2">{t('form.service')} *</label>
                                            <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full">
                                                <option value="">{t('form.selectService')}</option>
                                                <option value="booking">{t('form.boatRental')}</option>
                                                <option value="excursion">{t('form.excursion')}</option>
                                                <option value="events">{t('form.privateEvent')}</option>
                                                <option value="other">{t('form.other')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--cream)] mb-2">{t('form.message')} *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full resize-none"
                                            placeholder={t('form.messagePlaceholder')}
                                        />
                                    </div>
                                    <button type="submit" className="btn-gold">
                                        <Send className="w-4 h-4 mr-2" />
                                        {t('form.send')}
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Info */}
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <h2 className="font-serif text-3xl text-[var(--cream)] mb-6">{t('info.title')}</h2>
                            <div className="space-y-6 mb-10">
                                {contactInfo.map((item) => (
                                    <div key={item.titleKey} className="flex items-start gap-4 p-4 bg-[var(--navy-800)] rounded-lg border border-[var(--border)]">
                                        <div className="w-12 h-12 rounded-full bg-[var(--navy-700)] flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-[var(--gold-500)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-[var(--cream)] font-medium mb-1">{t(`info.${item.titleKey}`)}</h3>
                                            {item.content.map((line, i) => (
                                                <p key={i} className="text-[var(--muted-foreground)]">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[var(--navy-800)] border border-[var(--gold-500)]/30 rounded-lg p-6 text-center">
                                <Anchor className="w-10 h-10 text-[var(--gold-500)] mx-auto mb-4" />
                                <h3 className="font-serif text-xl text-[var(--cream)] mb-2">{t('info.visitUs')}</h3>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="h-[400px] relative">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2867.8!2d12.5725!3d44.0775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132cc3d5e3c5c5c5%3A0x1234567890abcdef!2sPorto%20Turistico%20Marina%20di%20Rimini!5e0!3m2!1sit!2sit!4v1704067200000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </section>
        </>
    );
}
