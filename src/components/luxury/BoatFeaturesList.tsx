'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Navigation,
    Shield,
    Snowflake,
    Wifi,
    Tv,
    Music,
    Waves,
    Anchor,
    Radio,
    Compass,
    LifeBuoy,
    Zap,
    Droplets,
    Thermometer,
    Ship,
    Glasses
} from 'lucide-react';
import type { BoatFeatures } from '@/lib/types';

interface BoatFeaturesListProps {
    features: BoatFeatures;
}

interface FeatureCategory {
    title: string;
    icon: React.ReactNode;
    items: { key: keyof BoatFeatures; label: string; icon: React.ReactNode }[];
}

const featureCategories: FeatureCategory[] = [
    {
        title: 'Navigazione e Sicurezza',
        icon: <Navigation className="w-5 h-5" />,
        items: [
            { key: 'gps', label: 'GPS', icon: <Compass className="w-4 h-4" /> },
            { key: 'autopilot', label: 'Autopilota', icon: <Navigation className="w-4 h-4" /> },
            { key: 'radar', label: 'Radar', icon: <Radio className="w-4 h-4" /> },
            { key: 'vhf_radio', label: 'Radio VHF', icon: <Radio className="w-4 h-4" /> },
            { key: 'life_jackets', label: 'Giubbotti Salvagente', icon: <LifeBuoy className="w-4 h-4" /> },
        ]
    },
    {
        title: 'Comfort',
        icon: <Snowflake className="w-5 h-5" />,
        items: [
            { key: 'air_conditioning', label: 'Aria Condizionata', icon: <Snowflake className="w-4 h-4" /> },
            { key: 'heating', label: 'Riscaldamento', icon: <Thermometer className="w-4 h-4" /> },
            { key: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
            { key: 'generator', label: 'Generatore', icon: <Zap className="w-4 h-4" /> },
            { key: 'watermaker', label: 'Dissalatore', icon: <Droplets className="w-4 h-4" /> },
        ]
    },
    {
        title: 'Intrattenimento',
        icon: <Tv className="w-5 h-5" />,
        items: [
            { key: 'tv', label: 'TV', icon: <Tv className="w-4 h-4" /> },
            { key: 'stereo', label: 'Stereo/Musica', icon: <Music className="w-4 h-4" /> },
            { key: 'swimming_platform', label: 'Piattaforma Bagno', icon: <Waves className="w-4 h-4" /> },
            { key: 'tender', label: 'Tender', icon: <Ship className="w-4 h-4" /> },
            { key: 'snorkeling_equipment', label: 'Attrezzatura Snorkeling', icon: <Glasses className="w-4 h-4" /> },
        ]
    }
];

export function BoatFeaturesList({ features }: BoatFeaturesListProps) {
    const [openCategory, setOpenCategory] = useState<string | null>('Navigazione e Sicurezza');

    // Filter categories that have at least one feature enabled
    const availableCategories = featureCategories.filter(category =>
        category.items.some(item => features[item.key] === true)
    );

    if (availableCategories.length === 0) {
        // Show basic features if no advanced features
        const basicFeatures = [];
        if (features.crew) basicFeatures.push({ label: 'Equipaggio Incluso', icon: <Anchor className="w-4 h-4" /> });
        if (features.cabins) basicFeatures.push({ label: `${features.cabins} Cabine`, icon: <Shield className="w-4 h-4" /> });
        if (features.bathrooms) basicFeatures.push({ label: `${features.bathrooms} Bagni`, icon: <Droplets className="w-4 h-4" /> });

        if (basicFeatures.length === 0) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="font-serif text-2xl text-[var(--cream)] mb-6">
                    Dotazioni
                </h2>
                <div className="flex flex-wrap gap-3">
                    {basicFeatures.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--navy-800)] border border-[var(--border)] rounded-lg text-[var(--cream)] text-sm">
                            <span className="text-[var(--gold-500)]">{feature.icon}</span>
                            {feature.label}
                        </span>
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="font-serif text-2xl text-[var(--cream)] mb-6">
                Dotazioni
            </h2>
            <div className="space-y-2">
                {availableCategories.map((category) => {
                    const isOpen = openCategory === category.title;
                    const enabledItems = category.items.filter(item => features[item.key] === true);

                    return (
                        <div
                            key={category.title}
                            className="bg-[var(--navy-800)] border border-[var(--border)] rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenCategory(isOpen ? null : category.title)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--navy-700)] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[var(--gold-500)]">{category.icon}</span>
                                    <span className="text-[var(--cream)] font-medium">{category.title}</span>
                                    <span className="text-[var(--muted-foreground)] text-sm">({enabledItems.length})</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {enabledItems.map((item) => (
                                                <div
                                                    key={item.key}
                                                    className="flex items-center gap-2 text-[var(--cream)] text-sm"
                                                >
                                                    <span className="text-[var(--gold-500)]">{item.icon}</span>
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
