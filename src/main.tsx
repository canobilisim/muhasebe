import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeApp, logPerformanceMetrics, setupGlobalErrorHandling } from './utils/appInit'

// Initialize app with polyfills and accessibility features
initializeApp()

// Setup global error handling
setupGlobalErrorHandling()

// Log performance metrics in development
if (import.meta.env.DEV) {
  logPerformanceMetrics()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
