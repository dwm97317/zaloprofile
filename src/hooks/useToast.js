import React, { useState, useCallback } from 'react';
import { ToastContainer } from '../components/Common/Toast';

/**
 * useToast Hook
 * 
 * Manages toast notification queue and provides methods to show toasts.
 * Returns ToastContainer component and toast methods.
 */
let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const ToastContainerComponent = useCallback(() => {
    return <ToastContainer toasts={toasts} onClose={removeToast} />;
  }, [toasts, removeToast]);

  return {
    success,
    error,
    warning,
    info,
    ToastContainer: ToastContainerComponent,
  };
};

export default useToast;
