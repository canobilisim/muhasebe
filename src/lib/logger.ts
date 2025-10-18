/**
 * Logger utility for development and production
 * Set to false to disable all logging
 */

const ENABLE_LOGGING = false // Set to true to enable development logs

export const logger = {
  log: (...args: any[]) => {
    if (ENABLE_LOGGING) console.log(...args)
  },
  
  error: (...args: any[]) => {
    // Keep errors visible even in production for debugging
    if (ENABLE_LOGGING) console.error(...args)
  },
  
  warn: (...args: any[]) => {
    if (ENABLE_LOGGING) console.warn(...args)
  },
  
  group: (label: string) => {
    if (ENABLE_LOGGING) console.group(label)
  },
  
  groupEnd: () => {
    if (ENABLE_LOGGING) console.groupEnd()
  },
  
  info: (...args: any[]) => {
    if (ENABLE_LOGGING) console.info(...args)
  },
}
