// Main entity types
export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  vatNumber?: string
  totalCredits: number
  usedCredits: number
  activeEmployees: number
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  availablePoints: number
  usedPoints: number
  totalPoints: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Partner {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone?: string
  address?: string
  category: ServiceCategory
  vatNumber?: string
  commissionRate: number
  monthlyRevenue: number
  totalTransactions: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  partnerId: string
  name: string
  description: string
  category: ServiceCategory
  pointsRequired: number
  originalPrice?: number
  discountPercentage?: number
  maxRedemptions?: number
  isActive: boolean
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  employeeId: string
  serviceId: string
  partnerId: string
  companyId: string
  pointsUsed: number
  status: TransactionStatus
  qrCode: string
  redeemedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Enums
export enum ServiceCategory {
  FITNESS = 'fitness',
  WELLNESS = 'wellness',
  HEALTH = 'health',
  NUTRITION = 'nutrition',
  EDUCATION = 'education',
  LIFESTYLE = 'lifestyle'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum UserRole {
  COMPANY_ADMIN = 'company_admin',
  EMPLOYEE = 'employee',
  PARTNER = 'partner',
  PLATFORM_ADMIN = 'platform_admin'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Form types
export interface CreateCompanyForm {
  name: string
  email: string
  phone?: string
  address?: string
  vatNumber?: string
}

export interface CreateEmployeeForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  initialPoints: number
}

export interface CreatePartnerForm {
  businessName: string
  ownerName: string
  email: string
  phone?: string
  address?: string
  category: ServiceCategory
  vatNumber?: string
}

export interface CreateServiceForm {
  name: string
  description: string
  category: ServiceCategory
  pointsRequired: number
  originalPrice?: number
  discountPercentage?: number
  maxRedemptions?: number
  imageUrl?: string
}

// Dashboard stats types
export interface CompanyStats {
  totalCredits: number
  usedCredits: number
  activeEmployees: number
  totalTransactions: number
  monthlySpend: number
  topServices: Array<{
    serviceName: string
    usage: number
    points: number
  }>
}

export interface EmployeeStats {
  availablePoints: number
  usedPoints: number
  totalPoints: number
  recentTransactions: Transaction[]
  favoriteServices: Service[]
}

export interface PartnerStats {
  monthlyRevenue: number
  totalTransactions: number
  activeServices: number
  pendingPayment: number
  topServices: Array<{
    serviceName: string
    sales: number
    revenue: number
  }>
}

// QR Code types
export interface QRCodeData {
  transactionId: string
  employeeId: string
  serviceId: string
  pointsToRedeem: number
  expiresAt: Date
}

// Notification types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
}

// Filter and search types
export interface ServiceFilters {
  category?: ServiceCategory
  minPoints?: number
  maxPoints?: number
  searchTerm?: string
}

export interface TransactionFilters {
  status?: TransactionStatus
  dateFrom?: Date
  dateTo?: Date
  employeeId?: string
  partnerId?: string
}