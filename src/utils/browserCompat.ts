/**
 * Browser compatibility utilities and polyfills
 */

/**
 * Detect browser and version
 */
export function detectBrowser(): {
  name: string
  version: string
  isSupported: boolean
} {
  const ua = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'

  // Chrome
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  // Edge
  else if (ua.indexOf('Edg') > -1) {
    name = 'Edge'
    const match = ua.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  // Firefox
  else if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }
  // Safari
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari'
    const match = ua.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
  }

  // Check if browser is supported (last 2 versions of major browsers)
  const isSupported = checkBrowserSupport(name, parseInt(version))

  return { name, version, isSupported }
}

/**
 * Check if browser version is supported
 */
function checkBrowserSupport(name: string, version: number): boolean {
  const minVersions: Record<string, number> = {
    Chrome: 90,
    Edge: 90,
    Firefox: 88,
    Safari: 14,
  }

  return version >= (minVersions[name] || 0)
}

/**
 * Feature detection
 */
export const features = {
  // CSS features
  cssGrid: CSS.supports('display', 'grid'),
  cssFlexbox: CSS.supports('display', 'flex'),
  cssCustomProperties: CSS.supports('--test', '0'),
  
  // JavaScript features
  asyncAwait: (() => {
    try {
      eval('(async () => {})')
      return true
    } catch {
      return false
    }
  })(),
  
  // Web APIs
  fetch: typeof fetch !== 'undefined',
  localStorage: (() => {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  })(),
  sessionStorage: (() => {
    try {
      const test = '__test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  })(),
  indexedDB: typeof indexedDB !== 'undefined',
  webWorkers: typeof Worker !== 'undefined',
  serviceWorker: 'serviceWorker' in navigator,
  
  // Media features
  webp: (() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  })(),
  
  // Input features
  touchEvents: 'ontouchstart' in window,
  pointerEvents: 'PointerEvent' in window,
  
  // Crypto
  webCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
}

/**
 * Polyfill for Array.prototype.at (for older browsers)
 */
export function polyfillArrayAt(): void {
  if (!Array.prototype.at) {
    Array.prototype.at = function (index: number) {
      const len = this.length
      const relativeIndex = index >= 0 ? index : len + index
      
      if (relativeIndex < 0 || relativeIndex >= len) {
        return undefined
      }
      
      return this[relativeIndex]
    }
  }
}

/**
 * Polyfill for Object.hasOwn (for older browsers)
 */
export function polyfillObjectHasOwn(): void {
  if (!Object.hasOwn) {
    Object.hasOwn = function (obj: object, prop: string | symbol) {
      return Object.prototype.hasOwnProperty.call(obj, prop)
    }
  }
}

/**
 * Polyfill for structuredClone (for older browsers)
 */
export function polyfillStructuredClone(): void {
  if (typeof structuredClone === 'undefined') {
    (window as any).structuredClone = function (obj: any) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
}

/**
 * Initialize all polyfills
 */
export function initPolyfills(): void {
  polyfillArrayAt()
  polyfillObjectHasOwn()
  polyfillStructuredClone()
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  }
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const viewport = getViewportDimensions()
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  )
}

/**
 * Smooth scroll polyfill for older browsers
 */
export function smoothScrollTo(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  if ('scrollBehavior' in document.documentElement.style) {
    element.scrollIntoView({ behavior: 'smooth', ...options })
  } else {
    // Fallback for browsers that don't support smooth scrolling
    element.scrollIntoView(options)
  }
}

/**
 * Copy to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}

/**
 * Show browser compatibility warning if needed
 */
export function showCompatibilityWarning(): void {
  const browser = detectBrowser()
  
  if (!browser.isSupported) {
    const warning = document.createElement('div')
    warning.className = 'fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 p-4 text-center z-50'
    warning.innerHTML = `
      <p class="text-yellow-800">
        <strong>Uyarı:</strong> Tarayıcınız (${browser.name} ${browser.version}) güncel değil. 
        En iyi deneyim için lütfen tarayıcınızı güncelleyin.
      </p>
    `
    document.body.insertBefore(warning, document.body.firstChild)
  }
}
