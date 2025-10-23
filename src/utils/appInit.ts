/**
 * Application initialization utilities
 * Run these on app startup for optimal performance and compatibility
 */

import { initPolyfills, showCompatibilityWarning } from './browserCompat'
import { initFocusVisible, addSkipToMainLink } from './accessibility'

/**
 * Initialize application with all necessary polyfills and enhancements
 */
export function initializeApp(): void {
  // Initialize polyfills for older browsers
  initPolyfills()

  // Show compatibility warning if browser is outdated
  showCompatibilityWarning()

  // Initialize focus-visible for better keyboard navigation
  initFocusVisible()

  // Add skip to main content link for accessibility
  addSkipToMainLink()

  // Log initialization
  if (import.meta.env.DEV) {
    console.log('✅ Application initialized with polyfills and accessibility features')
  }
}

/**
 * Performance monitoring helper
 */
export function logPerformanceMetrics(): void {
  if (import.meta.env.DEV && window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const connectTime = perfData.responseEnd - perfData.requestStart
        const renderTime = perfData.domComplete - perfData.domLoading

        console.log('📊 Performance Metrics:')
        console.log(`  Page Load Time: ${pageLoadTime}ms`)
        console.log(`  Connect Time: ${connectTime}ms`)
        console.log(`  Render Time: ${renderTime}ms`)
      }, 0)
    })
  }
}

/**
 * Error boundary for global error handling
 */
export function setupGlobalErrorHandling(): void {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  })
}

/**
 * Setup service worker for PWA (if needed)
 */
export function setupServiceWorker(): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error)
        })
    })
  }
}
