import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { 
      label: 'LogisticsCo Admin', 
      email: 'admin@logisticsco.com', 
      password: 'password123' 
    },
    { 
      label: 'LogisticsCo User', 
      email: 'user@logisticsco.com', 
      password: 'password123' 
    },
    { 
      label: 'RetailGmbH Admin', 
      email: 'admin@retailgmbh.com', 
      password: 'password123' 
    },
    { 
      label: 'RetailGmbH User', 
      email: 'user@retailgmbh.com', 
      password: 'password123' 
    }
  ];

  const fillCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Welcome to Flowbit</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full mt-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm text-gray-700 mb-2">
            Demo Credentials:
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillCredentials(cred.email, cred.password)}
                className="text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <div className="font-medium">{cred.label}</div>
                <div className="text-gray-600">{cred.email}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Multi-tenant demo application</p>
          <p className="text-xs mt-1">Each tenant has isolated data access</p>
        </div>
      </div>
    </div>
  );
};

export default Login;