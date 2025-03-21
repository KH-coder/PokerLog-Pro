import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/ui/Layout';
import DashboardPageNew from './pages/DashboardPageNew';
import LoginPageNew from './pages/LoginPageNew';
import RegisterPageNew from './pages/RegisterPageNew';
import HandRecordsPage from './pages/HandRecordsPage';
import NewDashboardPage from './pages/NewDashboardPage';
import './App.css';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPageNew />} />
          <Route path="/register" element={<RegisterPageNew />} />
          <Route path="/" element={<PrivateRoute element={<DashboardPageNew />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<DashboardPageNew />} />} />
          <Route path="/new-dashboard" element={<PrivateRoute element={<NewDashboardPage />} />} />
          <Route path="/hand-records" element={<PrivateRoute element={<HandRecordsPage />} />} />
          {/* Add more routes as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
