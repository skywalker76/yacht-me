'use client';

import { motion } from 'framer-motion';
import {
    Calendar,
    Ruler,
    Users,
    BedDouble,
    Bath,
    Gauge,
    Fuel,
    Wrench
} from 'lucide-react';
import type { Boat } from '@/lib/types';

interface BoatSpecsProps {
    boat: Boat;
}

interface SpecItem {
    icon: React.ReactNode;
    label: string;
    value: string | number | null | undefined;
}

export function BoatSpecs({ boat }: BoatSpecsProps) {
    const specs: SpecItem[] = [
        {
            icon: <Calendar className="w-5 h-5" />,
            label: 'Anno',
            value: boat.year
                ? boat.refurbished_year
                    ? `${boat.year} (ristrutturato ${boat.refurbished_year})`
                    : boat.year
                : null
        },
        {
            icon: <Ruler className="w-5 h-5" />,
            label: 'Lunghezza',
            value: boat.length
        },
        {
            icon: <Users className="w-5 h-5" />,
            label: 'Capacità',
            value: boat.capacity ? `${boat.capacity} persone` : null
        },
        {
            icon: <BedDouble className="w-5 h-5" />,
            label: 'Cabine',
            value: boat.features.cabins
        },
        {
            icon: <Bath className="w-5 h-5" />,
            label: 'Bagni',
            value: boat.features.bathrooms
        },
        {
            icon: <Gauge className="w-5 h-5" />,
            label: 'Motore',
            value: boat.engine_power
        },
        {
            icon: <Fuel className="w-5 h-5" />,
            label: 'Consumo',
            value: boat.fuel_consumption
        },
        {
            icon: <Wrench className="w-5 h-5" />,
            label: 'Patente',
            value: boat.features.license_required === false ? 'Non richiesta' : boat.features.license_required === true ? 'Richiesta' : null
        }
    ].filter(spec => spec.value != null);

    if (specs.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="font-serif text-2xl text-[var(--cream)] mb-6">
                Specifiche Tecniche
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {specs.map((spec, index) => (
                    <motion.div
                        key={spec.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex flex-col items-center p-4 bg-[var(--navy-800)] border border-[var(--border)] rounded-lg text-center hover:border-[var(--gold-500)]/50 transition-colors"
                    >
                        <div className="text-[var(--gold-500)] mb-2">
                            {spec.icon}
                        </div>
                        <p className="text-[var(--cream)] font-medium text-sm">
                            {spec.value}
                        </p>
                        <p className="text-[var(--muted-foreground)] text-xs mt-1">
                            {spec.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
