import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Employee, Service, Transaction, ServiceCategory, TransactionStatus, QRCodeData } from '@/types'

interface Company {
  id: string
  name: string
  totalCredits: number
  usedCredits: number
  availableCredits: number
}

interface EasyWelfareStore {
  // Company State
  company: Company
  employees: Employee[]
  
  // Services & Partners
  services: Service[]
  
  // Transactions & QR
  transactions: Transaction[]
  activeQRs: QRCodeData[]
  
  // Current User Context (for demo purposes)
  currentUserType: 'company' | 'employee' | 'partner'
  currentUserId: string
  
  // Company Actions
  addCredits: (amount: number) => void
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void
  distributePoints: (distributions: Array<{ employeeId: string; points: number }>) => void
  
  // Employee Actions
  bookService: (employeeId: string, serviceId: string) => string // returns transaction ID
  generateQR: (employeeId: string, serviceId: string) => QRCodeData
  
  // Partner Actions
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateService: (serviceId: string, updates: Partial<Service>) => void
  validateQR: (qrData: QRCodeData, partnerId: string) => boolean
  
  // Utility Actions
  setCurrentUser: (userType: 'company' | 'employee' | 'partner', userId: string) => void
  getEmployeeById: (employeeId: string) => Employee | undefined
  getServiceById: (serviceId: string) => Service | undefined
  getTransactionsByEmployee: (employeeId: string) => Transaction[]
  getTransactionsByPartner: (partnerId: string) => Transaction[]
}

// Mock initial data
const mockEmployees: Employee[] = [
  {
    id: 'emp_1',
    companyId: 'comp_1',
    firstName: 'Mario',
    lastName: 'Rossi',
    email: 'mario.rossi@techcorp.com',
    phone: '+39 333 123 4567',
    availablePoints: 750,
    usedPoints: 250,
    totalPoints: 1000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'emp_2',
    companyId: 'comp_1',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    email: 'giulia.bianchi@techcorp.com',
    phone: '+39 333 987 6543',
    availablePoints: 450,
    usedPoints: 550,
    totalPoints: 1000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'emp_3',
    companyId: 'comp_1',
    firstName: 'Luca',
    lastName: 'Verdi',
    email: 'luca.verdi@techcorp.com',
    phone: '+39 333 456 7890',
    availablePoints: 200,
    usedPoints: 300,
    totalPoints: 500,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12')
  }
]

const mockServices: Service[] = [
  {
    id: 'srv_1',
    partnerId: 'ptr_1',
    name: 'Personal Training',
    description: 'Sessione di allenamento personalizzato con trainer qualificato da 60 minuti',
    category: ServiceCategory.FITNESS,
    pointsRequired: 200,
    originalPrice: 50,
    discountPercentage: 20,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'srv_2',
    partnerId: 'ptr_2',
    name: 'Massaggio Rilassante',
    description: 'Massaggio rilassante di 60 minuti per ridurre stress e tensioni',
    category: ServiceCategory.WELLNESS,
    pointsRequired: 150,
    originalPrice: 80,
    discountPercentage: 25,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'srv_3',
    partnerId: 'ptr_3',
    name: 'Consulenza Nutrizionale',
    description: 'Consulenza personalizzata con nutrizionista certificato',
    category: ServiceCategory.NUTRITION,
    pointsRequired: 100,
    originalPrice: 60,
    discountPercentage: 15,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'srv_4',
    partnerId: 'ptr_1',
    name: 'Corso Yoga',
    description: 'Lezione di yoga di gruppo per principianti e intermedi',
    category: ServiceCategory.FITNESS,
    pointsRequired: 80,
    originalPrice: 25,
    discountPercentage: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  }
]

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    employeeId: 'emp_1',
    serviceId: 'srv_1',
    partnerId: 'ptr_1',
    companyId: 'comp_1',
    pointsUsed: 200,
    status: TransactionStatus.COMPLETED,
    qrCode: 'QR_PT_20240115_001',
    redeemedAt: new Date('2024-01-15T14:30:00'),
    createdAt: new Date('2024-01-15T14:25:00'),
    updatedAt: new Date('2024-01-15T14:30:00')
  },
  {
    id: 'txn_2',
    employeeId: 'emp_2',
    serviceId: 'srv_2',
    partnerId: 'ptr_2',
    companyId: 'comp_1',
    pointsUsed: 150,
    status: TransactionStatus.COMPLETED,
    qrCode: 'QR_MS_20240112_002',
    redeemedAt: new Date('2024-01-12T17:00:00'),
    createdAt: new Date('2024-01-12T16:55:00'),
    updatedAt: new Date('2024-01-12T17:00:00')
  }
]

export const useEasyWelfareStore = create<EasyWelfareStore>()(
  persist(
    (set, get) => ({
      // Initial State
      company: {
        id: 'comp_1',
        name: 'TechCorp Verona',
        totalCredits: 15000,
        usedCredits: 3500,
        availableCredits: 11500
      },
      employees: mockEmployees,
      services: mockServices,
      transactions: mockTransactions,
      activeQRs: [],
      currentUserType: 'company',
      currentUserId: 'comp_1',

      // Company Actions
      addCredits: (amount: number) => {
        set(state => ({
          company: {
            ...state.company,
            totalCredits: state.company.totalCredits + amount,
            availableCredits: state.company.availableCredits + amount
          }
        }))
      },

      addEmployee: (employeeData) => {
        const newEmployee: Employee = {
          ...employeeData,
          id: `emp_${Date.now()}`,
          companyId: 'comp_1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set(state => ({
          employees: [...state.employees, newEmployee]
        }))
      },

      updateEmployee: (employeeId: string, updates: Partial<Employee>) => {
        set(state => ({
          employees: state.employees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, ...updates, updatedAt: new Date() }
              : emp
          )
        }))
      },

      distributePoints: (distributions) => {
        set(state => {
          const totalPointsToDistribute = distributions.reduce((sum, dist) => sum + dist.points, 0)
          
          // Check if company has enough credits
          if (totalPointsToDistribute > state.company.availableCredits) {
            console.error('Not enough credits available')
            return state
          }

          const updatedEmployees = state.employees.map(emp => {
            const distribution = distributions.find(dist => dist.employeeId === emp.id)
            if (distribution) {
              return {
                ...emp,
                availablePoints: emp.availablePoints + distribution.points,
                totalPoints: emp.totalPoints + distribution.points,
                updatedAt: new Date()
              }
            }
            return emp
          })

          return {
            employees: updatedEmployees,
            company: {
              ...state.company,
              availableCredits: state.company.availableCredits - totalPointsToDistribute,
              usedCredits: state.company.usedCredits + totalPointsToDistribute
            }
          }
        })
      },

      // Employee Actions
      bookService: (employeeId: string, serviceId: string) => {
        const state = get()
        const employee = state.employees.find(emp => emp.id === employeeId)
        const service = state.services.find(srv => srv.id === serviceId)
        
        if (!employee || !service) {
          console.error('Employee or service not found')
          return ''
        }

        if (employee.availablePoints < service.pointsRequired) {
          console.error('Insufficient points')
          return ''
        }

        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newTransaction: Transaction = {
          id: transactionId,
          employeeId,
          serviceId,
          partnerId: service.partnerId,
          companyId: employee.companyId,
          pointsUsed: service.pointsRequired,
          status: TransactionStatus.PENDING,
          qrCode: `QR_${serviceId.toUpperCase()}_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set(state => ({
          transactions: [...state.transactions, newTransaction],
          employees: state.employees.map(emp => 
            emp.id === employeeId
              ? { 
                  ...emp, 
                  availablePoints: emp.availablePoints - service.pointsRequired,
                  usedPoints: emp.usedPoints + service.pointsRequired,
                  updatedAt: new Date() 
                }
              : emp
          )
        }))

        return transactionId
      },

      generateQR: (employeeId: string, serviceId: string) => {
        const state = get()
        const service = state.services.find(srv => srv.id === serviceId)
        
        if (!service) {
          throw new Error('Service not found')
        }

        const qrData: QRCodeData = {
          transactionId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          employeeId,
          serviceId,
          pointsToRedeem: service.pointsRequired,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        }

        set(state => ({
          activeQRs: [...state.activeQRs, qrData]
        }))

        return qrData
      },

      // Partner Actions
      addService: (serviceData) => {
        const newService: Service = {
          ...serviceData,
          id: `srv_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set(state => ({
          services: [...state.services, newService]
        }))
      },

      updateService: (serviceId: string, updates: Partial<Service>) => {
        set(state => ({
          services: state.services.map(srv => 
            srv.id === serviceId 
              ? { ...srv, ...updates, updatedAt: new Date() }
              : srv
          )
        }))
      },

      validateQR: (qrData: QRCodeData, partnerId: string) => {
        const state = get()
        
        // Check if QR is expired
        if (new Date() > qrData.expiresAt) {
          console.error('QR Code expired')
          return false
        }

        // Find the corresponding transaction and complete it
        set(state => ({
          transactions: state.transactions.map(txn => 
            txn.qrCode === JSON.stringify(qrData)
              ? { 
                  ...txn, 
                  status: TransactionStatus.COMPLETED,
                  redeemedAt: new Date(),
                  updatedAt: new Date()
                }
              : txn
          ),
          activeQRs: state.activeQRs.filter(qr => qr.transactionId !== qrData.transactionId)
        }))

        return true
      },

      // Utility Actions
      setCurrentUser: (userType, userId) => {
        set({ currentUserType: userType, currentUserId: userId })
      },

      getEmployeeById: (employeeId: string) => {
        return get().employees.find(emp => emp.id === employeeId)
      },

      getServiceById: (serviceId: string) => {
        return get().services.find(srv => srv.id === serviceId)
      },

      getTransactionsByEmployee: (employeeId: string) => {
        return get().transactions.filter(txn => txn.employeeId === employeeId)
      },

      getTransactionsByPartner: (partnerId: string) => {
        return get().transactions.filter(txn => txn.partnerId === partnerId)
      }
    }),
    {
      name: 'easywelfare-store', // localStorage key
      partialize: (state) => ({
        company: state.company,
        employees: state.employees,
        services: state.services,
        transactions: state.transactions,
        currentUserType: state.currentUserType,
        currentUserId: state.currentUserId
      })
    }
  )
)