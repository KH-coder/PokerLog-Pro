import { User, ApiResponse } from '../types';

// Mock users database
let users: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
  },
];

// Helper to generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper to simulate API delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthApi = {
  login: async (email: string, _password: string): Promise<ApiResponse<User>> => {
    // Simulate network delay
    await delay(800);
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: '無效的電子郵件或密碼',
        data: null as unknown as User,
      };
    }
    
    // In a real app, you would verify the password hash here
    // For this mock, we'll accept any password
    
    // Generate a fake token
    const token = `mock-jwt-token-${generateId()}`;
    
    return {
      success: true,
      message: '登入成功',
      data: { ...user, token },
    };
  },
  
  register: async (username: string, email: string, _password: string): Promise<ApiResponse<User>> => {
    // Simulate network delay
    await delay(1000);
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return {
        success: false,
        message: '此電子郵件已被註冊',
        data: null as unknown as User,
      };
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return {
        success: false,
        message: '此用戶名已被使用',
        data: null as unknown as User,
      };
    }
    
    try {
      // Create new user
      const newUser: User = {
        id: generateId(),
        username,
        email,
      };
      
      // Add to mock database
      users.push(newUser);
      
      // Generate a fake token
      const token = `mock-jwt-token-${generateId()}`;
      
      // Log the registered users (for debugging)
      console.log('Registered users:', users);
      
      return {
        success: true,
        message: '註冊成功',
        data: { ...newUser, token },
      };
    } catch (error) {
      console.error('Error in mock registration:', error);
      return {
        success: false,
        message: '註冊失敗，請稍後再試',
        data: null as unknown as User,
      };
    }
  },
  
  logout: () => {
    // Nothing to do in the mock API
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    // Simulate network delay
    await delay(500);
    
    // In a real app, you would verify the token and return the user
    // For this mock, we'll just return the first user
    const user = users[0];
    
    if (!user) {
      return {
        success: false,
        message: '未授權',
        data: null as unknown as User,
      };
    }
    
    return {
      success: true,
      message: '獲取用戶信息成功',
      data: user,
    };
  },
};
