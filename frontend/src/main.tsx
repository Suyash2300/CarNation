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

// Safety check for root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure <div id="root"></div> exists in index.html');
}

try {
  ReactDOM.createRoot(rootElement).render(
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
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback error display
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, sans-serif;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="color: #ef4444; margin-bottom: 16px;">Failed to Load Application</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">${errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
  throw error;
}
