import React, { createContext, useContext } from 'react';

const ScreenContext = createContext();

export const useScreens = () => {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error('useScreens must be used within a ScreenProvider');
  }
  return context;
};

export const ScreenProvider = ({ children, screens, loading }) => {
  const getScreenById = (id) => {
    return screens.find(screen => screen.id === id);
  };

  const getScreensByPermission = (permission) => {
    return screens.filter(screen => 
      screen.permissions && screen.permissions.includes(permission)
    );
  };

  const hasPermission = (screenId, permission) => {
    const screen = getScreenById(screenId);
    return screen && screen.permissions && screen.permissions.includes(permission);
  };

  const value = {
    screens,
    loading,
    getScreenById,
    getScreensByPermission,
    hasPermission
  };

  return (
    <ScreenContext.Provider value={value}>
      {children}
    </ScreenContext.Provider>
  );
};