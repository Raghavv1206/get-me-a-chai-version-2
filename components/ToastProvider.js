'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
                background: 'rgba(17, 17, 17, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#e5e7eb',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
            progressStyle={{
                background: 'linear-gradient(90deg, #a855f7, #6366f1)',
            }}
        />
    );
}
