// Accessibility utilities for FlexPass

export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  userMenu: 'User account menu',
  themeToggle: 'Toggle dark/light theme',
  
  // Wallet
  connectWallet: 'Connect your crypto wallet',
  disconnectWallet: 'Disconnect wallet',
  walletAddress: 'Connected wallet address',
  
  // Passes
  passCard: 'Subscription pass card',
  passActions: 'Pass actions menu',
  accessService: 'Access service with this pass',
  extendPass: 'Extend pass duration',
  revokePass: 'Revoke this pass',
  
  // Forms
  providerSelect: 'Select service provider',
  durationInput: 'Enter pass duration',
  priceDisplay: 'Total price for pass',
  
  // Modals
  closeModal: 'Close modal dialog',
  modalOverlay: 'Modal dialog overlay'
}

export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight'
}

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (event.key !== KEYBOARD_SHORTCUTS.TAB) return

    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        event.preventDefault()
      }
    }
  }

  static restoreFocus(previousElement: HTMLElement | null) {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus()
    }
  }
}

// Screen reader announcements
export class ScreenReader {
  private static announcer: HTMLElement | null = null

  static init() {
    if (this.announcer) return

    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.className = 'sr-only'
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(this.announcer)
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcer) this.init()
    
    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority)
      this.announcer.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = ''
        }
      }, 1000)
    }
  }
}

// Color contrast utilities
export const COLOR_CONTRAST = {
  // WCAG AA compliant color combinations
  text: {
    onLight: '#1f2937', // gray-800
    onDark: '#f9fafb',  // gray-50
    muted: '#6b7280'    // gray-500
  },
  
  interactive: {
    primary: '#2563eb',     // blue-600
    primaryHover: '#1d4ed8', // blue-700
    secondary: '#059669',    // emerald-600
    danger: '#dc2626'       // red-600
  },
  
  status: {
    success: '#059669',  // emerald-600
    warning: '#d97706',  // amber-600
    error: '#dc2626',    // red-600
    info: '#2563eb'      // blue-600
  }
}

// Reduced motion utilities
export const MOTION_PREFERENCES = {
  respectsReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  getAnimationDuration: (defaultDuration: number) => {
    return MOTION_PREFERENCES.respectsReducedMotion() ? 0 : defaultDuration
  },
  
  getTransition: (defaultTransition: string) => {
    return MOTION_PREFERENCES.respectsReducedMotion() ? 'none' : defaultTransition
  }
}

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidAmount: 'Please enter a valid amount',
  insufficientBalance: 'Insufficient balance for this transaction',
  walletNotConnected: 'Please connect your wallet to continue',
  networkError: 'Network error. Please try again.',
  transactionFailed: 'Transaction failed. Please try again.'
}

// Initialize accessibility features
export const initializeAccessibility = () => {
  ScreenReader.init()
  
  // Add focus-visible polyfill behavior
  document.addEventListener('keydown', (e) => {
    if (e.key === KEYBOARD_SHORTCUTS.TAB) {
      document.body.classList.add('keyboard-navigation')
    }
  })
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation')
  })
}
