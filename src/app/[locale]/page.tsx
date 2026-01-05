import { setRequestLocale } from 'next-intl/server';
import { getSiteSetting, getLocalizedFeaturedBoats } from '@/lib/supabase';
import HomePageClient from './HomePageClient';

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80';
const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Fetch images and boats server-side - no flash!
    const [heroImage, aboutImage, featuredBoats] = await Promise.all([
        getSiteSetting('hero_image'),
        getSiteSetting('about_section_image'),
        getLocalizedFeaturedBoats(locale),
    ]);

    return (
        <HomePageClient
            heroImage={heroImage || DEFAULT_HERO_IMAGE}
            aboutImage={aboutImage || DEFAULT_ABOUT_IMAGE}
            boats={featuredBoats}
        />
    );
}
