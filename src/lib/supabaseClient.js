import { createClient } from '@supabase/supabase-js';

// Retrieve credentials either from localStorage or build environment variables
export function getStoredSupabaseConfig() {
  try {
    const localUrl = localStorage.getItem('supabase_url');
    const localKey = localStorage.getItem('supabase_anon_key');
    if (localUrl && localKey) {
      return { url: localUrl.trim(), key: localKey.trim(), source: 'local' };
    }
  } catch (e) {
    // ignore local storage errors
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  return { url: '', key: '', source: 'none' };
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
    localStorage.setItem('supabase_url', url.trim());
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
