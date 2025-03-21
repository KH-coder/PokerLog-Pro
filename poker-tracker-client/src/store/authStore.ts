import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '../types';
import { authApi } from '../api/api';
import { getLocalStorage, setItem } from '../utils/storage';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

type AuthStore = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.success && response.data) {
            // Store the token separately, don't include in state
            if (response.data.token) {
              setItem('token', response.data.token);
            }
            // Create a user object without the token
            const user: User = {
              id: response.data.id,
              username: response.data.username,
              email: response.data.email
            };
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: response.message || 'Login failed', isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(username, email, password);
          if (response.success && response.data) {
            // Store the token separately, don't include in state
            if (response.data.token) {
              setItem('token', response.data.token);
            }
            // Create a user object without the token
            const user: User = {
              id: response.data.id,
              username: response.data.username,
              email: response.data.email
            };
            set({ user, isAuthenticated: true, isLoading: false });
            return user;
          } else {
            set({ error: response.message || 'Registration failed', isLoading: false });
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          console.error('Registration error in store:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
      logout: () => {
        authApi.logout();
        set(initialState);
      },
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getLocalStorage() || sessionStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
