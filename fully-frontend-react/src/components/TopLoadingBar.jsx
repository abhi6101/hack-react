import React from 'react';
import { useLoading } from '../context/LoadingContext';
import '../styles/loading-bar.css';

const TopLoadingBar = () => {
  const { isLoading } = useLoading();
  return (
    <div
      className="top-loading-bar"
      style={{ opacity: isLoading ? 1 : 0, transform: isLoading ? 'scaleX(1)' : 'scaleX(0)' }}
    />
  );
};

export default TopLoadingBar;
