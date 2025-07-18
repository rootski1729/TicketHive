import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ScreenContext = createContext();

export const useScreens = () => {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error('useScreens must be used within a ScreenProvider');
  }
  return context;
};

export const ScreenProvider = ({ children }) => {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchScreens = async () => {
      if (!isAuthenticated || !user) {
        setScreens([]);
        return;
      }

      setLoading(true);
      try {
        // For demo, we'll define screens based on user's tenant
        const defaultScreens = [
          {
            id: 'support-tickets',
            name: 'Support Tickets',
            url: 'http://localhost:3002/remoteEntry.js',
            scope: 'supportTicketsApp',
            module: './SupportTicketsApp',
            icon: 'ticket',
            path: '/app/support-tickets'
          }
        ];

        // Try to fetch from API, fallback to default
        try {
          const response = await api.get('/me/screens', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setScreens(response.data.screens || defaultScreens);
        } catch (apiError) {
          console.log('Using default screens, API call failed:', apiError.message);
          setScreens(defaultScreens);
        }
        
      } catch (error) {
        console.error('Error fetching screens:', error);
        setScreens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScreens();
  }, [user, isAuthenticated]);

  const getScreenById = (screenId) => {
    return screens.find(screen => screen.id === screenId);
  };

  const value = {
    screens,
    loading,
    getScreenById,
    refreshScreens: () => {
      // Re-fetch screens if needed
      if (isAuthenticated && user) {
        setLoading(true);
        // Trigger useEffect to re-run
        setScreens([]);
      }
    }
  };

  return (
    <ScreenContext.Provider value={value}>
      {children}
    </ScreenContext.Provider>
  );
};