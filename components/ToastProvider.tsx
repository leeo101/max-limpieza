'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        // Default options for all toasts
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#1f2937', // gray-800
          border: '1px solid #f3f4f6', // gray-100
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '1rem', // rounded-2xl
          fontWeight: 'bold',
          padding: '12px 24px',
        },
        success: {
          iconTheme: {
            primary: '#0ea5e9', // sky-500
            secondary: '#ffffff',
          },
        },
        error: {
           iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#ffffff',
          },
        }
      }}
    />
  );
}
