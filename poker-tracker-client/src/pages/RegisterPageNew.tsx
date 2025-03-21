import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const RegisterPageNew: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('密碼不匹配');
      return;
    }
    setPasswordError('');
    
    try {
      await register(username, email, password);
      // After registration, check if the user is authenticated
      if (useAuthStore.getState().isAuthenticated) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Error is already handled in the store
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        註冊新帳戶
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            用戶名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            電子郵件
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            密碼
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            確認密碼
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
          {passwordError && (
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#b91c1c' }}>{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: '#0284c7',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginTop: '10px'
          }}
        >
          {isLoading ? 'Loading...' : '註冊'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
        已有帳戶？{' '}
        <Link to="/login" style={{ color: '#0284c7', fontWeight: '600' }}>
          登入
        </Link>
      </p>
    </div>
  );
};

export default RegisterPageNew;
