'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSiteSetting, updateSiteSetting } from '@/lib/supabase';

export type ThemeType = 'navy' | 'white' | 'silver' | 'gold';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('navy');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await getSiteSetting('site_theme');
                if (savedTheme && ['navy', 'white', 'silver', 'gold'].includes(savedTheme)) {
                    setThemeState(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        try {
            await updateSiteSetting('site_theme', newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export const THEMES: { id: ThemeType; name: string; description: string; colors: { bg: string; accent: string; text: string } }[] = [
    {
        id: 'navy',
        name: 'Navy',
        description: 'Blu navy elegante con accenti oro',
        colors: { bg: '#0a192f', accent: '#d4af37', text: '#f8f5f0' }
    },
    {
        id: 'white',
        name: 'White',
        description: 'Sfondo chiaro raffinato',
        colors: { bg: '#fdfcfa', accent: '#d4af37', text: '#1a1a1a' }
    },
    {
        id: 'silver',
        name: 'Silver',
        description: 'Grigio metallico professionale',
        colors: { bg: '#1c1c1e', accent: '#a1a1a6', text: '#f8f5f0' }
    },
    {
        id: 'gold',
        name: 'Gold',
        description: 'Nero lussuoso con oro brillante',
        colors: { bg: '#0d0d0d', accent: '#ffd700', text: '#f8f5f0' }
    }
];
