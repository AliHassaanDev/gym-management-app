import { Platform } from 'react-native';

const AUTH_KEY = 'gym_owner_authenticated_session';

export interface OwnerProfile {
  username: string;
  name: string;
  role: string;
  gymName: string;
  avatar: string;
}

export const AuthService = {
  isAuthenticated: (): boolean => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(AUTH_KEY) === 'true';
      }
      return true; // Default fallback for mobile dev session
    } catch {
      return false;
    }
  },

  login: (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      return { success: false, error: 'Please enter your username.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Owner credentials check: username: owner, password: 12345678
    if (cleanUser === 'owner' && cleanPass === '12345678') {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(AUTH_KEY, 'true');
        }
      } catch (e) {
        console.warn('Storage error', e);
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter username: owner and password: 12345678',
    };
  },

  logout: (): void => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      console.warn('Storage error', e);
    }
  },

  getOwner: (): OwnerProfile => {
    return {
      username: 'owner',
      name: 'Ali Raza',
      role: 'Gym Owner',
      gymName: 'GYM PAGLU',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  },
};
