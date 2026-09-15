import React from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmToastOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const showConfirmDeleteToast = ({
  title = "Confirm Deletion",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmToastOptions) => {
  toast.custom((t) => (
    <div 
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#FBF9F5] dark:bg-[#0C0F14] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-stone-200/70 dark:ring-stone-800`}
      style={{ marginTop: '35vh' }}
    >
      <div className="flex-1 w-0 p-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-lg font-bold text-stone-900 dark:text-white">
            {title}
          </p>
          <div className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {message}
          </div>
          <div className="mt-6 flex w-full space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                toast.remove(t.id);
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                toast.remove(t.id);
                onConfirm();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ), { duration: Infinity, position: 'top-center' });
};
