import { ServiceCategory } from '@/types'

// App Configuration
export const APP_CONFIG = {
  name: 'EasyWelfare',
  description: 'Piattaforma Welfare Aziendale',
  version: '1.0.0',
  supportEmail: 'support@easywelfare.it',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

// Point System Configuration
export const POINTS_CONFIG = {
  euroToPointsRatio: 1, // 1 euro = 1 point
  pointsToEuroRatio: 1, // 1 point = 1 euro
  minimumPointsForRedemption: 10,
  maximumPointsPerTransaction: 1000,
  qrCodeExpiryMinutes: 15
}

// Commission Rates (in percentage)
export const COMMISSION_RATES = {
  default: 15,
  fitness: 12,
  wellness: 18,
  health: 10,
  nutrition: 15,
  education: 8,
  lifestyle: 20
}

// Service Categories with Labels and Icons
export const SERVICE_CATEGORIES = {
  [ServiceCategory.FITNESS]: {
    label: 'Fitness',
    icon: '🏋️',
    color: 'blue',
    description: 'Palestre, personal training, corsi fitness'
  },
  [ServiceCategory.WELLNESS]: {
    label: 'Benessere',
    icon: '💆',
    color: 'purple',
    description: 'Massaggi, spa, trattamenti rilassanti'
  },
  [ServiceCategory.HEALTH]: {
    label: 'Salute',
    icon: '🏥',
    color: 'red',
    description: 'Visite mediche, check-up, fisioterapia'
  },
  [ServiceCategory.NUTRITION]: {
    label: 'Nutrizione',
    icon: '🥗',
    color: 'green',
    description: 'Consulenze nutrizionali, piani alimentari'
  },
  [ServiceCategory.EDUCATION]: {
    label: 'Formazione',
    icon: '📚',
    color: 'yellow',
    description: 'Corsi, workshops, certificazioni'
  },
  [ServiceCategory.LIFESTYLE]: {
    label: 'Lifestyle',
    icon: '🎨',
    color: 'pink',
    description: 'Hobby, arte, intrattenimento'
  }
}

// Transaction Status Labels
export const TRANSACTION_STATUS_LABELS = {
  pending: {
    label: 'In Attesa',
    color: 'yellow',
    icon: '⏳'
  },
  completed: {
    label: 'Completata',
    color: 'green',
    icon: '✅'
  },
  cancelled: {
    label: 'Annullata',
    color: 'red',
    icon: '❌'
  },
  expired: {
    label: 'Scaduta',
    color: 'gray',
    icon: '⏰'
  }
}

// User Role Labels
export const USER_ROLE_LABELS = {
  company_admin: 'Amministratore Azienda',
  employee: 'Dipendente',
  partner: 'Partner',
  platform_admin: 'Amministratore Piattaforma'
}

// Validation Rules
export const VALIDATION_RULES = {
  minPasswordLength: 8,
  maxNameLength: 50,
  maxDescriptionLength: 500,
  maxCompanyNameLength: 100,
  phoneRegex: /^(\+39|0)\d{9,10}$/,
  vatNumberRegex: /^IT\d{11}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// API Endpoints
export const API_ENDPOINTS = {
  auth: '/api/auth',
  companies: '/api/companies',
  employees: '/api/employees',
  partners: '/api/partners',
  services: '/api/services',
  transactions: '/api/transactions',
  points: '/api/points',
  reports: '/api/reports',
  payments: '/api/payments'
}

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  maxPageSize: 100,
  pageSizeOptions: [10, 25, 50, 100]
}

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  chartColors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  dateRangeOptions: [
    { label: 'Ultimi 7 giorni', value: 7 },
    { label: 'Ultimi 30 giorni', value: 30 },
    { label: 'Ultimi 90 giorni', value: 90 },
    { label: 'Ultimo anno', value: 365 }
  ]
}

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Si è verificato un errore. Riprova più tardi.',
  network: 'Problema di connessione. Controlla la tua connessione internet.',
  unauthorized: 'Non sei autorizzato ad accedere a questa risorsa.',
  validation: 'I dati inseriti non sono validi.',
  notFound: 'Risorsa non trovata.',
  serverError: 'Errore del server. Riprova più tardi.',
  insufficientPoints: 'Punti insufficienti per completare l\'operazione.',
  expiredQR: 'Il QR code è scaduto. Genera un nuovo codice.',
  serviceUnavailable: 'Servizio temporaneamente non disponibile.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  pointsDistributed: 'Punti distribuiti con successo!',
  serviceBooked: 'Servizio prenotato con successo!',
  transactionCompleted: 'Transazione completata con successo!',
  profileUpdated: 'Profilo aggiornato con successo!',
  serviceCreated: 'Servizio creato con successo!',
  creditsRecharged: 'Crediti ricaricati con successo!'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  userPreferences: 'easywelfare_user_preferences',
  dashboardFilters: 'easywelfare_dashboard_filters',
  serviceFilters: 'easywelfare_service_filters'
}

// Environment Variables
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}