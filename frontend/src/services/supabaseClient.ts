import { StudentProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const SESSION_KEY = 'campusbuddy_student_session';

/**
 * Lightweight native fetch-based Supabase Auth & REST client
 * Zero external dependencies; works seamlessly both online and offline.
 */
class SupabaseNativeClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url?.replace(/\/+$/, '') || '';
    this.key = key || '';
  }

  auth = {
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: any } }) => {
      if (!isSupabaseConfigured) {
        const mockUser = {
          id: `usr_${Date.now()}`,
          email,
          user_metadata: options?.data || {}
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: mockUser }));
        return { data: { user: mockUser }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({ email, password, data: options?.data })
      });

      const data = await res.json();
      if (!res.ok) {
        return { data: { user: null }, error: new Error(data.msg || data.error_description || 'Signup failed') };
      }

      if (data?.user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.user, access_token: data.access_token }));
      }
      return { data: { user: data.user }, error: null };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(SESSION_KEY);
        let user = stored ? JSON.parse(stored).user : null;
        if (!user) {
          user = {
            id: `usr_${Date.now()}`,
            email,
            user_metadata: { full_name: email.split('@')[0].toUpperCase(), usn: 'PU-2024-DEMO' }
          };
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
        return { data: { user }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { data: { user: null }, error: new Error(data.error_description || data.msg || 'Invalid login credentials') };
      }

      if (data?.user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.user, access_token: data.access_token }));
      }
      return { data: { user: data.user }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem(SESSION_KEY);
      if (isSupabaseConfigured) {
        try {
          await fetch(`${this.url}/auth/v1/logout`, {
            method: 'POST',
            headers: { 'apikey': this.key }
          });
        } catch (_) {}
      }
      return { error: null };
    },

    getSession: async () => {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return { data: { session: null }, error: null };
      try {
        const parsed = JSON.parse(raw);
        return { data: { session: parsed }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
  };
}

export const supabase = isSupabaseConfigured
  ? new SupabaseNativeClient(supabaseUrl!, supabaseAnonKey!)
  : new SupabaseNativeClient('', '');

class LocalAuthManager {
  getUser(): StudentProfile | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.user) {
        return {
          id: parsed.user.id,
          full_name: parsed.user.user_metadata?.full_name || parsed.user.email?.split('@')[0] || 'Student',
          email: parsed.user.email || '',
          usn: parsed.user.user_metadata?.usn
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  setUser(profile: StudentProfile): void {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: {
            full_name: profile.full_name,
            usn: profile.usn
          }
        }
      })
    );
  }

  clearUser(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const localAuth = new LocalAuthManager();
