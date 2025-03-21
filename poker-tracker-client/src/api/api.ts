import axios from 'axios';
import { HandRecord, User, ApiResponse } from '../types';
import { getItem, removeItem, setItem } from '../utils/storage';
import { mockAuthApi } from './mockApi';

// Flag to determine whether to use mock API or real API
// This can be controlled by an environment variable or a setting
const USE_MOCK_API = false; // Set to true to use the mock API

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Real API implementation
const realAuthApi = {
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      console.log('Sending login request with:', { username: email, password: '***' });
      // Use email as username since the server expects username
      const response = await api.post('/auth/login', { username: email, password });
      
      console.log('Login response:', response.data);
      
      // Map the server response to our expected format
      if (response.data && response.data.token) {
        setItem('token', response.data.token);
        setItem('user', JSON.stringify({
          id: 'user-id', // We don't have this from the server response
          username: email, // Use email as username
          email: email,
          token: response.data.token
        }));
        return {
          success: true,
          message: 'Login successful',
          data: {
            id: 'user-id', // We don't have this from the server response
            username: email, // Use email as username
            email: email,
            token: response.data.token
          }
        };
      } else {
        return {
          success: false,
          message: response.data?.message || response.data?.Message || 'Login failed',
          data: null as unknown as User
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Extract error message from the server response
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        // Try to extract error message from different possible formats
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        data: null as unknown as User
      };
    }
  },
  register: async (username: string, email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      console.log('Sending registration request with:', { username, email, password: '***' });
      
      // Make sure the password meets the server's requirements
      if (password.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long',
          data: null as unknown as User
        };
      }
      
      // Check if password contains required characters
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
        return {
          success: false,
          message: 'Password must contain uppercase, lowercase, digit, and special character',
          data: null as unknown as User
        };
      }
      
      const response = await api.post('/auth/register', { username, email, password });
      
      console.log('Registration response:', response.data);
      
      // Check if registration was successful based on Status field
      if (response.data && (response.data.Status === 'Success' || response.data.status === 'Success')) {
        console.log('Registration successful, attempting login');
        // For registration, we need to login to get the token
        try {
          const loginResponse = await realAuthApi.login(username, password); // Use username for login, not email
          console.log('Login response after registration:', loginResponse);
          return loginResponse;
        } catch (loginError) {
          console.error('Login after registration failed:', loginError);
          // Even if login fails, registration was successful
          setItem('user', JSON.stringify({
            id: 'temp-id',
            username,
            email,
            token: ''
          }));
          return {
            success: true,
            message: 'Registration successful, but automatic login failed. Please login manually.',
            data: {
              id: 'temp-id',
              username,
              email,
              token: ''
            }
          };
        }
      } else {
        return {
          success: false,
          message: response.data?.Message || response.data?.message || 'Registration failed',
          data: null as unknown as User
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Extract error message from the server response
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        // Try to extract error message from different possible formats
        if (error.response.data.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.Errors) {
          // Handle validation errors
          const errors = error.response.data.Errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessage = errors.map((e: any) => e.description || e.message).join(', ');
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        data: null as unknown as User
      };
    }
  },
  logout: () => {
    removeItem('token');
    removeItem('user');
  },
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/me');
      console.log('Get current user response:', response.data);
      
      if (response.data && (response.data.userName || response.data.username)) {
        return {
          success: true,
          message: 'User retrieved successfully',
          data: {
            id: response.data.id || 'user-id',
            username: response.data.userName || response.data.username,
            email: response.data.email || ''
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to retrieve user',
          data: null as unknown as User
        };
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to retrieve user',
        data: null as unknown as User
      };
    }
  },
};

// Auth API - use either mock or real implementation
export const authApi = USE_MOCK_API ? mockAuthApi : realAuthApi;

// Hand records API
export const handRecordsApi = {
  getAll: async (): Promise<ApiResponse<HandRecord[]>> => {
    const response = await api.get<ApiResponse<HandRecord[]>>('/handrecords');
    return response.data;
  },
  getById: async (id: string): Promise<ApiResponse<HandRecord>> => {
    const response = await api.get<ApiResponse<HandRecord>>(`/handrecords/${id}`);
    return response.data;
  },
  create: async (handRecord: Omit<HandRecord, 'id'>): Promise<ApiResponse<HandRecord>> => {
    const response = await api.post<ApiResponse<HandRecord>>('/handrecords', handRecord);
    return response.data;
  },
  update: async (id: string, handRecord: Partial<HandRecord>): Promise<ApiResponse<HandRecord>> => {
    const response = await api.put<ApiResponse<HandRecord>>(`/handrecords/${id}`, handRecord);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/handrecords/${id}`);
    return response.data;
  },
};

export default api;
