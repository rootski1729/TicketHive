import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getTenantColor = (customerId) => {
    return customerId === 'LogisticsCo' ? '#4285f4' : '#34a853';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavButton = ({ path, children, onClick }) => (
    <button
      onClick={onClick || (() => navigate(path))}
      style={{
        padding: '0.75rem 1rem',
        backgroundColor: isActive(path) ? getTenantColor(user?.customerId) : 'transparent',
        color: isActive(path) ? 'white' : '#333',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isActive(path)) {
          e.target.style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(path)) {
          e.target.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        borderBottom: `3px solid ${getTenantColor(user?.customerId)}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo/Brand */}
          <div 
            onClick={() => navigate('/dashboard')}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: getTenantColor(user?.customerId),
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {user?.customerId?.charAt(0) || 'F'}
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                color: getTenantColor(user?.customerId),
                fontWeight: '600'
              }}>
                Flowbit
              </h1>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666',
                marginTop: '-2px'
              }}>
                {user?.customerId}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <NavButton path="/dashboard">
              Dashboard
            </NavButton>
            <NavButton path="/app/support-tickets">
              Support Tickets
            </NavButton>
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                {user?.email}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666'
              }}>
                {user?.role} • {user?.customerId}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        minHeight: 'calc(100vh - 80px)',
        padding: '0'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;