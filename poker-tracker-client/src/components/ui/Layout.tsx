import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600">
                  PokerLog Pro
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/') ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/new"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/new') ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                      New Hand
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Logout
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isActive('/login') ? 'text-white bg-primary-600 hover:bg-primary-700' : 'text-primary-600 bg-white hover:bg-gray-50'}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isActive('/register') ? 'text-white bg-primary-600 hover:bg-primary-700' : 'text-primary-600 bg-white hover:bg-gray-50'}`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} PokerLog Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
