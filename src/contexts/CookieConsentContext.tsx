'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookieConsent {
    necessary: boolean; // Always true, cannot be disabled
    analytics: boolean;
    marketing: boolean;
    maps: boolean;
}

interface CookieConsentContextType {
    consent: CookieConsent | null;
    hasConsented: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    savePreferences: (preferences: Partial<CookieConsent>) => void;
    showBanner: boolean;
    setShowBanner: (show: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_KEY = 'yacht-me-cookie-consent';
const CONSENT_VERSION = '1.0';

function getStoredConsent(): CookieConsent | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (parsed.version !== CONSENT_VERSION) return null;

        return parsed.consent;
    } catch {
        return null;
    }
}

function storeConsent(consent: CookieConsent): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        consent,
        timestamp: new Date().toISOString(),
    }));
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [consent, setConsent] = useState<CookieConsent | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const stored = getStoredConsent();
        if (stored) {
            setConsent(stored);
        } else {
            setShowBanner(true);
        }
    }, []);

    const acceptAll = () => {
        const fullConsent: CookieConsent = {
            necessary: true,
            analytics: true,
            marketing: true,
            maps: true,
        };
        setConsent(fullConsent);
        storeConsent(fullConsent);
        setShowBanner(false);
    };

    const rejectAll = () => {
        const minimalConsent: CookieConsent = {
            necessary: true,
            analytics: false,
            marketing: false,
            maps: false,
        };
        setConsent(minimalConsent);
        storeConsent(minimalConsent);
        setShowBanner(false);
    };

    const savePreferences = (preferences: Partial<CookieConsent>) => {
        const newConsent: CookieConsent = {
            necessary: true, // Always true
            analytics: preferences.analytics ?? false,
            marketing: preferences.marketing ?? false,
            maps: preferences.maps ?? false,
        };
        setConsent(newConsent);
        storeConsent(newConsent);
        setShowBanner(false);
    };

    return (
        <CookieConsentContext.Provider
            value={{
                consent,
                hasConsented: consent !== null,
                acceptAll,
                rejectAll,
                savePreferences,
                showBanner,
                setShowBanner,
            }}
        >
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}

