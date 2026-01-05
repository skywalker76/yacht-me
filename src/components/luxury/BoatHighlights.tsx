'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

interface BoatHighlightsProps {
    highlights?: string[];
    included?: string[];
    excluded?: string[];
}

export function BoatHighlights({ highlights, included, excluded }: BoatHighlightsProps) {
    if (!highlights?.length && !included?.length && !excluded?.length) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-3"
        >
            {highlights?.map((highlight, index) => (
                <span
                    key={`highlight-${index}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold-500)]/10 border border-[var(--gold-500)]/30 text-[var(--gold-500)] text-sm font-medium rounded-full"
                >
                    <AlertCircle className="w-4 h-4" />
                    {highlight}
                </span>
            ))}
            {included?.slice(0, 3).map((item, index) => (
                <span
                    key={`included-${index}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full"
                >
                    <Check className="w-4 h-4" />
                    {item}
                </span>
            ))}
            {excluded?.slice(0, 2).map((item, index) => (
                <span
                    key={`excluded-${index}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-full"
                >
                    <X className="w-4 h-4" />
                    {item}
                </span>
            ))}
        </motion.div>
    );
}
