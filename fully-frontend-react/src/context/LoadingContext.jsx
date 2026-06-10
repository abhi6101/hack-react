import React, { createContext, useContext, useState } from 'react';

// Create a context for global loading state
const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {}
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
