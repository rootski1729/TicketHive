import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScreens } from '../contexts/ScreenContext';

const Dashboard = () => {
  const { appId } = useParams();
  const { user } = useAuth();
  const { screens, getScreenById } = useScreens();
  const [RemoteComponent, setRemoteComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appId) {
      loadRemoteApp(appId);
    } else {
      setRemoteComponent(null);
    }
  }, [appId, screens]);

  const loadRemoteApp = async (screenId) => {
    const screen = getScreenById(screenId);
    
    if (!screen) {
      setError('Screen not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dynamically import the remote component
      const module = await import('supportTicketsApp/SupportTicketsApp');
      setRemoteComponent(() => module.default);
    } catch (err) {
      console.error('Failed to load remote app:', err);
      setError('Failed to load application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (appId && loading) {
    return (
      <div className="remote-app-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading application...</span>
      </div>
    );
  }

  if (appId && error) {
    return (
      <div className="remote-app-error">
        <h3 className="text-lg font-semibold mb-2">Application Error</h3>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={() => loadRemoteApp(appId)}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (appId && RemoteComponent) {
    return (
      <div className="remote-app-container">
        <Suspense fallback={
          <div className="remote-app-loading">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading component...</span>
          </div>
        }>
          <RemoteComponent />
        </Suspense>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome to {user?.customerId} Portal
        </h1>
        <p className="dashboard-subtitle">
          Multi-tenant application dashboard
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="card-title">Available Applications</h3>
          <div className="card-content">
            {screens.length > 0 ? (
              <div className="grid gap-2">
                {screens.map((screen) => (
                  <div key={screen.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{screen.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {screen.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {screen.permissions?.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No applications available for your tenant.</p>
            )}
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="card-title">User Information</h3>
          <div className="card-content">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {user?.role}
              </div>
              <div>
                <span className="font-medium">Tenant:</span> {user?.customerId}
              </div>
              <div>
                <span className="font-medium">Last Login:</span>{' '}
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="card-title">System Status</h3>
          <div className="card-content">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>API Connection: Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Database: Connected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Workflow Engine: Ready</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="card-content">
            <div className="space-y-2">
              {screens.map((screen) => (
                <a
                  key={screen.id}
                  href={`/app/${screen.id}`}
                  className="block p-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 text-sm transition-colors"
                >
                  Open {screen.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;