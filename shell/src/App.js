import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScreenProvider } from './contexts/ScreenContext';
import api from './services/api';
import './App.css';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [screens, setScreens] = useState([]);
  const [screensLoading, setScreensLoading] = useState(false);

  useEffect(() => {
    const fetchScreens = async () => {
      if (isAuthenticated && user) {
        setScreensLoading(true);
        try {
          const response = await api.get('/me/screens');
          setScreens(response.data.screens || []);
        } catch (error) {
          console.error('Failed to fetch screens:', error);
          setScreens([]);
        } finally {
          setScreensLoading(false);
        }
      }
    };

    fetchScreens();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ScreenProvider screens={screens} loading={screensLoading}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/app/:appId" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ScreenProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;