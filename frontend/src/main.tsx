import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import App from './App.tsx'
import { ToastProvider } from './components/common/ToastContainer'
import { ConfirmProvider } from './components/common/ConfirmProvider'
import ErrorBoundary from './components/common/ErrorBoundary'
import './index.css'

// Global error handlers for production monitoring
if (import.meta.env.PROD) {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', {
      reason: event.reason,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
    // Prevent default browser error handling
    event.preventDefault();
  });

  // Catch JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
          }}
        >
          <ToastProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
