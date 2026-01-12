import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title = "", showBack = true, className = "" }) => {
  const navigate = useNavigate();
  return (
    <div className={`flex items-center px-4 py-3 bg-white shadow-sm sticky top-0 z-50 ${className}`}>
      {showBack && (
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className={`flex-1 text-lg font-bold text-gray-800 ${showBack ? 'text-center mr-8' : ''}`}>{title}</h1>
    </div>
  );
};

export default Header;
