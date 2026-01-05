'use client';

import { motion } from 'framer-motion';
import { Check, X, Plus, CreditCard, Calendar } from 'lucide-react';
import type { Boat, ExtraService } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface BoatPricingProps {
    boat: Boat;
    onBookingClick?: () => void;
}

export function BoatPricing({ boat, onBookingClick }: BoatPricingProps) {
    return (
        <div className="sticky top-28 space-y-6">
            {/* Price Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6"
            >
                <div className="mb-6">
                    <p className="text-[var(--muted-foreground)] text-sm mb-1">A partire da</p>
                    <p className="text-3xl font-serif text-[var(--gold-500)]">
                        {formatCurrency(boat.price_half_day)}
                        <span className="text-lg text-[var(--muted-foreground)]">/mezza giornata</span>
                    </p>
                </div>

                {/* Price Options */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Mezza giornata (4h)</span>
                        <span className="text-[var(--cream)] font-medium">{formatCurrency(boat.price_half_day)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)]">Giornata intera (8h)</span>
                        <span className="text-[var(--cream)] font-medium">{formatCurrency(boat.price_full_day)}</span>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onBookingClick}
                    className="btn-gold w-full"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Richiedi Disponibilità
                </button>

                <p className="text-[var(--muted-foreground)] text-xs text-center mt-4">
                    Risposta garantita entro 24 ore
                </p>
            </motion.div>

            {/* Included/Excluded Services */}
            {(boat.included_services?.length || boat.excluded_services?.length) && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6"
                >
                    <h3 className="font-serif text-lg text-[var(--cream)] mb-4">
                        Nel Prezzo
                    </h3>

                    {boat.included_services && boat.included_services.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider mb-2">Incluso</p>
                            <ul className="space-y-2">
                                {boat.included_services.map((service, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-emerald-400 text-sm">
                                        <Check className="w-4 h-4" />
                                        {service}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {boat.excluded_services && boat.excluded_services.length > 0 && (
                        <div>
                            <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider mb-2">Escluso</p>
                            <ul className="space-y-2">
                                {boat.excluded_services.map((service, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-red-400 text-sm">
                                        <X className="w-4 h-4" />
                                        {service}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Extra Services */}
            {boat.extra_services && boat.extra_services.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6"
                >
                    <h3 className="font-serif text-lg text-[var(--cream)] mb-4">
                        Servizi Extra
                    </h3>
                    <ul className="space-y-3">
                        {boat.extra_services.map((service, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-[var(--cream)]">
                                    <Plus className="w-4 h-4 text-[var(--gold-500)]" />
                                    {service.name}
                                </span>
                                <span className="text-[var(--gold-500)] font-medium">
                                    {formatCurrency(service.price)}/{service.unit === 'day' ? 'giorno' : service.unit === 'trip' ? 'viaggio' : 'persona'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Cancellation Policy */}
            {boat.cancellation_policy && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg p-6"
                >
                    <h3 className="font-serif text-lg text-[var(--cream)] mb-2">
                        Cancellazione
                    </h3>
                    <p className="text-[var(--muted-foreground)] text-sm">
                        {boat.cancellation_policy}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
