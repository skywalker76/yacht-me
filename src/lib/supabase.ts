import { createClient } from '@supabase/supabase-js';
import type { Boat, Booking, BookingFormData, Article, ArticleFormData, ArticleCategory, Customer, CustomerFormData, Service, ServiceFormData } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if credentials are available
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ==================== BOATS ====================

export async function getBoats(): Promise<Boat[]> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getFeaturedBoats(): Promise<Boat[]> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getBoatBySlug(slug: string): Promise<Boat | null> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data;
}

export async function createBoat(boat: Omit<Boat, 'id' | 'created_at'>): Promise<Boat> {
    const { data, error } = await supabase
        .from('boats')
        .insert([boat])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBoat(id: string, updates: Partial<Boat>): Promise<Boat> {
    const { data, error } = await supabase
        .from('boats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteBoat(id: string): Promise<void> {
    const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ==================== BOOKINGS ====================

export async function getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*, boat:boats(*)')
        .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getBookingsByBoat(boatId: string): Promise<Booking[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('boat_id', boatId)
        .neq('status', 'cancelled')
        .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createBooking(
    boatId: string,
    formData: BookingFormData,
    totalPrice: number | null
): Promise<Booking> {
    const { data, error } = await supabase
        .from('bookings')
        .insert([{
            boat_id: boatId,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_phone: formData.customer_phone || null,
            start_date: formData.start_date,
            end_date: formData.end_date,
            notes: formData.notes || null,
            total_price: totalPrice,
            status: 'pending',
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBookingStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled'
): Promise<Booking> {
    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBooking(
    id: string,
    updates: Partial<Booking>
): Promise<Booking> {
    const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteBooking(id: string): Promise<void> {
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function getBookingsWithBoat(): Promise<(Booking & { boat: Boat })[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*, boat:boats(*)')
        .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

// ==================== AUTH ====================

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ==================== STORAGE ====================

export async function uploadBoatImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
        .from('boat-images')
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('boat-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function deleteBoatImage(url: string): Promise<void> {
    const fileName = url.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
        .from('boat-images')
        .remove([fileName]);

    if (error) throw error;
}

// ==================== SITE SETTINGS ====================

export interface SiteSetting {
    id: string;
    key: string;
    value: string | null;
    description: string | null;
    updated_at: string;
}

export async function getSiteSettings(): Promise<SiteSetting[]> {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

    if (error) throw error;
    return data || [];
}

export async function getSiteSetting(key: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error) return null;
    return data?.value || null;
}

export async function updateSiteSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw error;
}

export async function uploadSiteImage(file: File, settingKey: string): Promise<string> {
    const fileName = `site/${settingKey}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
        .from('boat-images')
        .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('boat-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

// ==================== ARTICLES ====================

export async function getArticles(options?: {
    category?: ArticleCategory;
    status?: 'draft' | 'published';
    limit?: number;
}): Promise<Article[]> {
    let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

    if (options?.category) {
        query = query.eq('category', options.category);
    }
    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data;
}

export async function getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function createArticle(formData: ArticleFormData): Promise<Article> {
    const { data, error } = await supabase
        .from('articles')
        .insert([{
            ...formData,
            published_at: formData.status === 'published' ? new Date().toISOString() : null,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateArticle(id: string, formData: Partial<ArticleFormData>): Promise<Article> {
    const updates: Record<string, unknown> = {
        ...formData,
        updated_at: new Date().toISOString(),
    };

    // If publishing for the first time, set published_at
    if (formData.status === 'published') {
        const existing = await getArticleById(id);
        if (existing && !existing.published_at) {
            updates.published_at = new Date().toISOString();
        }
    }

    const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Helper to generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ==================== CUSTOMERS (CRM) ====================

export async function getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

    if (error) return null;
    return data;
}

export async function createCustomer(formData: CustomerFormData): Promise<Customer> {
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            notes: formData.notes || null,
            tags: formData.tags || [],
            source: 'manual',
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCustomer(id: string, updates: Partial<CustomerFormData>): Promise<Customer> {
    const { data, error } = await supabase
        .from('customers')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function getCustomerBookings(email: string): Promise<(Booking & { boat: Boat })[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*, boat:boats(*)')
        .eq('customer_email', email)
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateCustomerTags(id: string, tags: string[]): Promise<Customer> {
    const { data, error } = await supabase
        .from('customers')
        .update({ tags, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==================== SERVICES ====================

export async function getServices(): Promise<Service[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data;
}

export async function createService(service: ServiceFormData): Promise<Service> {
    const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateService(id: string, service: Partial<ServiceFormData>): Promise<Service> {
    const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteService(id: string): Promise<void> {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ==================== LOCALIZED CONTENT ====================

// Helper to localize a service based on locale
function localizeService(service: Service, locale: string): Service {
    if (locale === 'en') {
        return {
            ...service,
            name: service.name_en || service.name,
            description: service.description_en || service.description,
            features: service.features_en?.length ? service.features_en : service.features,
            price_text: service.price_text_en || service.price_text,
        };
    }
    return service;
}

// Helper to localize an article based on locale
function localizeArticle(article: Article, locale: string): Article {
    if (locale === 'en') {
        return {
            ...article,
            title: article.title_en || article.title,
            excerpt: article.excerpt_en || article.excerpt,
            content: article.content_en || article.content,
        };
    }
    return article;
}

// Helper to localize a boat based on locale
function localizeBoat(boat: Boat, locale: string): Boat {
    if (locale === 'en') {
        return {
            ...boat,
            name: boat.name_en || boat.name,
            description: boat.description_en || boat.description,
        };
    }
    return boat;
}

// Get localized services
export async function getLocalizedServices(locale: string = 'it'): Promise<Service[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(s => localizeService(s, locale));
}

// Get localized articles
export async function getLocalizedArticles(locale: string = 'it'): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(a => localizeArticle(a, locale));
}

// Get localized article by slug
export async function getLocalizedArticleBySlug(slug: string, locale: string = 'it'): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return localizeArticle(data, locale);
}

// Get localized boats
export async function getLocalizedBoats(locale: string = 'it'): Promise<Boat[]> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => localizeBoat(b, locale));
}

// Get localized featured boats
export async function getLocalizedFeaturedBoats(locale: string = 'it'): Promise<Boat[]> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => localizeBoat(b, locale));
}

// Get localized boat by slug
export async function getLocalizedBoatBySlug(slug: string, locale: string = 'it'): Promise<Boat | null> {
    const { data, error } = await supabase
        .from('boats')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return localizeBoat(data, locale);
}
