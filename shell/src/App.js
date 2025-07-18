import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScreenProvider } from './contexts/ScreenContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import './App.css';

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '1rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Lazy load remote components
const SupportTicketsApp = React.lazy(() => {
  return new Promise((resolve) => {
    // Fallback component if remote fails to load
    const FallbackComponent = () => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Support Tickets</h2>
        <p>This module would load from the micro-frontend at localhost:3002</p>
        <p>Demo tickets are available via the API for each tenant.</p>
      </div>
    );
    
    try {
      import('supportTicketsApp/SupportTicketsApp')
        .then((module) => {
          resolve({ default: module.default || FallbackComponent });
        })
        .catch(() => {
          console.log('Using fallback component for Support Tickets');
          resolve({ default: FallbackComponent });
        });
    } catch (error) {
      console.log('Using fallback component for Support Tickets');
      resolve({ default: FallbackComponent });
    }
  });
});

// Main App Component - No Router here, just Routes
const App = () => {
  return (
    <AuthProvider>
      <ScreenProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/app/support-tickets" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SupportTicketsApp />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </ScreenProvider>
    </AuthProvider>
  );
};

export default App;