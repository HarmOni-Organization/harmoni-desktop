import 'react-toastify/dist/ReactToastify.css';
import './style.css';

import type { ToastOptions } from 'react-toastify';
import { toast, ToastContainer } from 'react-toastify';

// Toast Utility Function
type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showToast = (
  message: string,
  type: ToastType = 'info',
  option: ToastOptions = {},
) => {
  switch (type) {
    case 'success':
      toast.success(message, option);
      break;
    case 'error':
      toast.error(message, option);
      break;
    case 'info':
      toast.info(message, option);
      break;
    case 'warning':
      toast.warn(message, option);
      break;
    default:
      toast(message, option);
  }
};

// ToastContainer Component to be used in the App
export function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      toastStyle={{
        backgroundColor: 'var(--color--foreground--10)',
        color: 'var(--color--foreground--100)',
        backdropFilter: 'blur(8px)',
      }}
    />
  );
}
