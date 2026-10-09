import { createClient } from '@supabase/supabase-js';

// Auto-corrects URLs if user accidentally copies the Supabase Dashboard page URL
export function normalizeSupabaseUrl(url) {
  if (!url) return '';
  let cleaned = url.trim();

  // If user copied browser URL from dashboard: https://supabase.com/dashboard/project/tehzetyysrrytrmsmrgp/settings/api
  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  cleaned = cleaned.replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export const DEFAULT_SUPABASE_URL = 'https://tehzetyysrrytrmsmrgp.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaHpldHl5c3JyeXRybXNtcmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODE4NDgsImV4cCI6MjEwNzA1Nzg0OH0.PZZb5kXdyGjJiYXGi7c2k0VRPVo3_a5NsOWIWsnUe2Y';

// Retrieve credentials either from localStorage or build environment variables
export function getStoredSupabaseConfig() {
  try {
    const localUrl = localStorage.getItem('supabase_url');
    const localKey = localStorage.getItem('supabase_anon_key');
    if (localUrl && localKey) {
      return { url: normalizeSupabaseUrl(localUrl), key: localKey.trim(), source: 'local' };
    }
  } catch (e) {
    // ignore local storage errors
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey) {
    return { url: normalizeSupabaseUrl(envUrl), key: envKey, source: 'env' };
  }

  return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_KEY, source: 'default' };
}

const initialConfig = getStoredSupabaseConfig();
export const supabaseUrl = initialConfig.url;
export const supabaseAnonKey = initialConfig.key;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : null;

export function saveSupabaseConfig(url, anonKey) {
  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    localStorage.setItem('supabase_url', cleanUrl);
    localStorage.setItem('supabase_anon_key', anonKey.trim());
    window.location.reload();
  } catch (err) {
    console.error('Failed to save Supabase config in localStorage', err);
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    window.location.reload();
  } catch (err) {
    console.error('Failed to clear Supabase config from localStorage', err);
  }
}
