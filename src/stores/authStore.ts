import { create } from 'zustand';
import { User } from '../types/user.types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (userData) => {
    console.log('=== AUTH STORE UPDATE ===', { userData });
    set((state) => {
      const newUser = state.user ? { ...state.user, ...userData } : null;
      console.log('=== NEW USER STATE ===', newUser);
      return { user: newUser };
    });
  },

  signOut: async () => {
    set({ isLoading: true });
    const { error } = await authService.signOut();
    if (!error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const { data: user } = await authService.getCurrentUser();
    set({ 
      user, 
      isAuthenticated: !!user, 
      isLoading: false 
    });
  },
}));