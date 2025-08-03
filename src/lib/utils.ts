import { clsx, type ClassValue } from 'clsx'

/**
 * Combines class names using clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Formats a number as currency (Euro)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Formats a date to Italian locale
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Formats a date and time to Italian locale
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formats points with proper Italian number formatting
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat('it-IT').format(points)
}

/**
 * Generates a random ID string
 */
export function generateId(prefix?: string): string {
  const randomString = Math.random().toString(36).substring(2, 15)
  return prefix ? `${prefix}_${randomString}` : randomString
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates Italian VAT number format
 */
export function isValidVatNumber(vatNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleaned = vatNumber.replace(/\s/g, '').toUpperCase()
  
  // Italian VAT number format: IT followed by 11 digits
  const vatRegex = /^IT\d{11}$/
  return vatRegex.test(cleaned)
}

/**
 * Validates Italian phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Italian phone number: starts with +39 or 0, followed by 9-10 digits
  const phoneRegex = /^(\+39|0)\d{9,10}$/
  return phoneRegex.test(cleaned)
}

/**
 * Calculates percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Truncates text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Converts points to euros (1 point = 1 euro)
 */
export function pointsToEuros(points: number): number {
  return points
}

/**
 * Converts euros to points (1 euro = 1 point)
 */
export function eurosToPoints(euros: number): number {
  return euros
}

/**
 * Calculates commission amount
 */
export function calculateCommission(amount: number, rate: number): number {
  return Math.round(amount * (rate / 100))
}

/**
 * Gets time remaining until expiration
 */
export function getTimeRemaining(expiryDate: Date): {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  const total = expiryDate.getTime() - new Date().getTime()
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { total, days, hours, minutes, seconds }
}

/**
 * Formats time remaining as human readable string
 */
export function formatTimeRemaining(expiryDate: Date): string {
  const { total, days, hours, minutes } = getTimeRemaining(expiryDate)
  
  if (total <= 0) return 'Scaduto'
  
  if (days > 0) return `${days}g ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}