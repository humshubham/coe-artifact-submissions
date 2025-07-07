import React from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
         role="alert">
      {message}
    </div>
  );
};

export default Toast; 