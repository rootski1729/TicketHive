import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    criticalTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickets for statistics
        const response = await api.get('/tickets');
        const tickets = response.data.tickets || [];
        
        // Calculate statistics
        const openTickets = tickets.filter(t => t.status === 'Open').length;
        const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
        const criticalTickets = tickets.filter(t => t.priority === 'Critical').length;
        
        setStats({
          totalTickets: tickets.length,
          openTickets,
          resolvedTickets,
          criticalTickets
        });
        
        // Get recent tickets (last 3)
        setRecentTickets(tickets.slice(0, 3));
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ title, value, color, onClick }) => (
    <div 
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: `3px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s'
      }}
      onClick={onClick}
      onMouseEnter={(e) => onClick && (e.target.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => onClick && (e.target.style.transform = 'translateY(0)')}
    >
      <h3 style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{title}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color, margin: '0.5rem 0' }}>
        {value}
      </div>
    </div>
  );

  const getTenantColor = (customerId) => {
    return customerId === 'LogisticsCo' ? '#4285f4' : '#34a853';
  };

  const getTenantWelcome = (customerId) => {
    return customerId === 'LogisticsCo' 
      ? 'Welcome to your Logistics Management Portal' 
      : 'Welcome to your Retail Management Portal';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          color: getTenantColor(user?.customerId), 
          marginBottom: '0.5rem',
          fontSize: '2rem'
        }}>
          Welcome to {user?.customerId} Portal
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          {getTenantWelcome(user?.customerId)}
        </p>
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          border: `1px solid ${getTenantColor(user?.customerId)}20`
        }}>
          <strong>Logged in as:</strong> {user?.email} ({user?.role})
          <br />
          <strong>Tenant:</strong> {user?.customerId}
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          title="Total Tickets" 
          value={stats.totalTickets} 
          color={getTenantColor(user?.customerId)}
          onClick={() => navigate('/app/support-tickets')}
        />
        <StatCard 
          title="Open Tickets" 
          value={stats.openTickets} 
          color="#ff9800"
          onClick={() => navigate('/app/support-tickets')}
        />
        <StatCard 
          title="Resolved Tickets" 
          value={stats.resolvedTickets} 
          color="#4caf50"
        />
        <StatCard 
          title="Critical Priority" 
          value={stats.criticalTickets} 
          color="#f44336"
        />
      </div>

      {/* Recent Tickets */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          color: '#333',
          borderBottom: `2px solid ${getTenantColor(user?.customerId)}`,
          paddingBottom: '0.5rem'
        }}>
          Recent Tickets
        </h2>
        
        {recentTickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentTickets.map((ticket) => (
              <div 
                key={ticket._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{ margin: 0, color: '#333' }}>{ticket.title}</h4>
                  <span 
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: ticket.status === 'Open' ? '#fff3cd' : 
                                     ticket.status === 'Resolved' ? '#d4edda' : '#f8d7da',
                      color: ticket.status === 'Open' ? '#856404' : 
                             ticket.status === 'Resolved' ? '#155724' : '#721c24'
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {ticket.description}
                </p>
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.8rem', 
                  color: '#888',
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <span>Priority: {ticket.priority}</span>
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No tickets found. Create your first ticket in the Support Tickets section.
          </p>
        )}
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/app/support-tickets')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: getTenantColor(user?.customerId),
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            View All Tickets
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          color: '#333',
          borderBottom: `2px solid ${getTenantColor(user?.customerId)}`,
          paddingBottom: '0.5rem'
        }}>
          Quick Actions
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/app/support-tickets')}
            style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              border: `2px solid ${getTenantColor(user?.customerId)}`,
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h4 style={{ margin: 0, color: getTenantColor(user?.customerId) }}>
              Support Tickets
            </h4>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Create and manage support tickets
            </p>
          </button>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            border: '2px solid #ddd',
            borderRadius: '6px',
            opacity: 0.7
          }}>
            <h4 style={{ margin: 0, color: '#666' }}>Coming Soon</h4>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              More modules will be available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;