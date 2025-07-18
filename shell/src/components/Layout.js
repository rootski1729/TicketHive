import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Users, 
  Settings, 
  LogOut, 
  User,
  BarChart3,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScreens } from '../contexts/ScreenContext';

const iconMap = {
  home: Home,
  ticket: Ticket,
  users: Users,
  settings: Settings,
  dashboard: BarChart3,
  analytics: BarChart3,
  package: Package
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { screens, loading } = useScreens();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Ticket;
    return <IconComponent className="icon" />;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading screens...</span>
      </div>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Flowbit</h1>
          <p className="sidebar-tenant">{user?.customerId}</p>
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') || isActive('/') ? 'active' : ''}
              >
                <Home className="icon" />
                Dashboard
              </Link>
            </li>
            
            {screens.map((screen) => (
              <li key={screen.id}>
                <Link 
                  to={`/app/${screen.id}`}
                  className={isActive(`/app/${screen.id}`) ? 'active' : ''}
                >
                  {getIcon(screen.icon)}
                  {screen.name}
                </Link>
              </li>
            ))}
            
            {user?.role === 'Admin' && (
              <li>
                <Link 
                  to="/admin/users"
                  className={isActive('/admin/users') ? 'active' : ''}
                >
                  <Users className="icon" />
                  User Management
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {user?.customerId} Portal
            </h2>
          </div>
          
          <div className="header-user">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <User className="w-8 h-8 text-gray-600" />
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;