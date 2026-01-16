import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'order_search_history';
const MAX_HISTORY = 10;

/**
 * useSearchHistory Hook
 * 
 * Manages search history in localStorage.
 * Maintains max 10 unique entries with most recent first.
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [history]);

  // Add new search term
  const addSearch = useCallback((term) => {
    if (!term || typeof term !== 'string') return;
    
    const trimmed = term.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // Remove duplicates and add to front
      const filtered = prev.filter((item) => item !== trimmed);
      const newHistory = [trimmed, ...filtered];
      
      // Limit to MAX_HISTORY entries
      return newHistory.slice(0, MAX_HISTORY);
    });
  }, []);

  // Remove specific search term
  const removeSearch = useCallback((term) => {
    setHistory((prev) => prev.filter((item) => item !== term));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
};

export default useSearchHistory;
