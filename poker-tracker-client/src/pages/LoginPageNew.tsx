import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPageNew: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
    // Check if login was successful by checking if error is null after login attempt
    if (!useAuthStore.getState().error) {
      navigate('/');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        登入您的帳戶
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', color: '#b91c1c' }}>
            {error}
          </div>
        )}

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
            autoComplete="current-password"
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
          {isLoading ? 'Loading...' : '登入'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
        還沒有帳戶？{' '}
        <Link to="/register" style={{ color: '#0284c7', fontWeight: '600' }}>
          立即註冊
        </Link>
      </p>
    </div>
  );
};

export default LoginPageNew;
