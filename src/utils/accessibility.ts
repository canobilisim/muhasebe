/**
 * Accessibility utilities for improved user experience
 */

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  // Focus first element
  firstFocusable?.focus()

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate unique ID for accessibility labels
 */
let idCounter = 0
export function generateA11yId(prefix: string = 'a11y'): string {
  idCounter++
  return `${prefix}-${idCounter}-${Date.now()}`
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('hidden')
  )
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    if (labelElement) return labelElement.textContent || ''
  }

  // Check associated label
  if (element instanceof HTMLInputElement) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent || ''
  }

  // Check title
  const title = element.getAttribute('title')
  if (title) return title

  // Fallback to text content
  return element.textContent || ''
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigationHelper {
  private elements: HTMLElement[]
  private currentIndex: number = 0

  constructor(container: HTMLElement, selector: string = '[role="button"], button, a[href]') {
    this.elements = Array.from(container.querySelectorAll<HTMLElement>(selector))
  }

  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        this.focusNext()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        this.focusPrevious()
        break
      case 'Home':
        event.preventDefault()
        this.focusFirst()
        break
      case 'End':
        event.preventDefault()
        this.focusLast()
        break
    }
  }

  private focusNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.elements.length
    this.elements[this.currentIndex]?.focus()
  }

  private focusPrevious(): void {
    this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length
    this.elements[this.currentIndex]?.focus()
  }

  private focusFirst(): void {
    this.currentIndex = 0
    this.elements[0]?.focus()
  }

  private focusLast(): void {
    this.currentIndex = this.elements.length - 1
    this.elements[this.currentIndex]?.focus()
  }
}

/**
 * Skip to main content helper
 */
export function addSkipToMainLink(): void {
  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.textContent = 'Ana içeriğe atla'
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded'
  
  document.body.insertBefore(skipLink, document.body.firstChild)
}

/**
 * Color contrast checker (WCAG AA compliance)
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
} {
  const getLuminance = (color: string): number => {
    // Simple RGB extraction (works for hex colors)
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  }
}

/**
 * Focus visible polyfill for older browsers
 */
export function initFocusVisible(): void {
  let hadKeyboardEvent = false

  const handleKeyDown = () => {
    hadKeyboardEvent = true
  }

  const handlePointerDown = () => {
    hadKeyboardEvent = false
  }

  const handleFocus = (e: FocusEvent) => {
    if (hadKeyboardEvent && e.target instanceof HTMLElement) {
      e.target.classList.add('focus-visible')
    }
  }

  const handleBlur = (e: FocusEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('focus-visible')
    }
  }

  document.addEventListener('keydown', handleKeyDown, true)
  document.addEventListener('mousedown', handlePointerDown, true)
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('focus', handleFocus, true)
  document.addEventListener('blur', handleBlur, true)
}

/**
 * ARIA live region helper
 */
export class LiveRegion {
  private element: HTMLDivElement

  constructor(priority: 'polite' | 'assertive' = 'polite') {
    this.element = document.createElement('div')
    this.element.setAttribute('role', 'status')
    this.element.setAttribute('aria-live', priority)
    this.element.setAttribute('aria-atomic', 'true')
    this.element.className = 'sr-only'
    document.body.appendChild(this.element)
  }

  announce(message: string): void {
    this.element.textContent = message
  }

  destroy(): void {
    document.body.removeChild(this.element)
  }
}
