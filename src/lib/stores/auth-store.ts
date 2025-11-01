import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { UserSettings } from '@/types/user';
import { createClient } from '@/lib/supabase/client';

interface AuthStore {
  user: User | null;
  settings: UserSettings | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  settings: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = createClient();
    
    // Get initial session
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false, initialized: true });
    
    if (user) {
      await get().fetchSettings();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null });
      
      if (session?.user) {
        await get().fetchSettings();
      } else {
        set({ settings: null });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { error };
    }
    
    return { error: null };
  },

  signUp: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { error };
    }
    
    return { error: null };
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, settings: null });
  },

  fetchSettings: async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert([{}])
          .select()
          .single();

        if (createError) throw createError;
        set({ settings: newSettings });
      } else {
        set({ settings: data });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', get().user?.id)
        .select()
        .single();

      if (error) throw error;
      set({ settings: data });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
}));
