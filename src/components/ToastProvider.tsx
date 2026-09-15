'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Matches Table Container theme
        className: '!bg-[#FBF9F5] dark:!bg-[#0C0F14] !text-stone-900 dark:!text-stone-100 !border !border-stone-200/70 dark:!border-stone-800 !shadow-md !rounded-2xl',
        duration: 4000,
        style: {
          background: 'transparent',
          color: 'inherit',
          boxShadow: 'none',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
