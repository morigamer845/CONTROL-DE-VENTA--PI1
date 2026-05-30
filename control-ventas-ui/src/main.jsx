import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1e28',
            color: '#e8eaf2',
            border: '1.5px solid #2a2f3e',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#13161e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#13161e' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
