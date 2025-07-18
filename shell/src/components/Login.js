import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const demoCredentials = [
    { role: 'LogisticsCo Admin', email: 'admin@logisticsco.com', password: 'password123' },
    { role: 'LogisticsCo User', email: 'user@logisticsco.com', password: 'password123' },
    { role: 'RetailGmbH Admin', email: 'admin@retailgmbh.com', password: 'password123' },
    { role: 'RetailGmbH User', email: 'user@retailgmbh.com', password: 'password123' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#333',
          fontSize: '1.5rem'
        }}>
          Welcome to Flowbit
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <h3 style={{ 
            color: '#666', 
            fontSize: '0.9rem', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Demo Credentials:
          </h3>
          
          {demoCredentials.map((cred, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#f8f9fa',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #e9ecef',
                transition: 'background-color 0.2s'
              }}
              onClick={() => handleDemoLogin(cred.email, cred.password)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
              <div style={{ fontWeight: '500', color: '#495057', fontSize: '0.85rem' }}>
                {cred.role}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                {cred.email}
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          color: '#666',
          fontSize: '0.85rem'
        }}>
          <strong>Multi-tenant demo application</strong>
          <br />
          Each tenant has isolated data access
        </div>
      </div>
    </div>
  );
};

export default Login;