import { supabase } from '../lib/supabase';
import type { User } from '../types';

// Simple password hashing (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const authService = {
  // Login with username and password
  async login(username: string, password: string): Promise<User | null> {
    try {
      const passwordHash = await hashPassword(password);
      
      // Check if user exists with correct password
      const { data: existingUser, error: selectError } = await supabase
        .from('tm_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (existingUser && !selectError) {
        // Store user in local storage (without password hash)
        const userWithoutPassword = { ...existingUser };
        delete userWithoutPassword.password_hash;
        localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
      }

      return null; // Invalid credentials
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Register new user
  async register(username: string, password: string): Promise<User | null> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('tm_users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already exists');
      }

      const passwordHash = await hashPassword(password);

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('tm_users')
        .insert({ username, password_hash: passwordHash })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }

      // Initialize user preferences
      await supabase.from('tm_user_preferences').insert({
        user_id: newUser.id,
        theme: 'light',
        default_view: 'list',
        calendar_visible: false,
      });

      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password_hash;
      localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },

  // Get current user from local storage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('current_user');
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },
};

