import { useState, useCallback } from 'react';

export const useToast = () => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), duration);
  }, []);

  return {
    showSuccessToast,
    toastMessage,
    showToast,
  };
};
