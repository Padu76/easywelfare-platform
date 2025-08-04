import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipi TypeScript per le nostre tabelle
export interface Company {
  id: string
  name: string
  email: string
  vat_number?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  employees_count: number
  monthly_budget_per_employee: number
  total_credits: number
  used_credits: number
  plan_type: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  employee_code?: string
  department?: string
  allocated_credits: number
  used_credits: number
  status: 'active' | 'inactive'
  hire_date?: string
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone?: string
  vat_number?: string
  address?: string
  city?: string
  postal_code?: string
  business_type?: string
  commission_rate: number
  tier: 'standard' | 'premium' | 'vip'
  status: 'pending' | 'active' | 'suspended'
  total_earnings: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  partner_id: string
  name: string
  description?: string
  category: string
  price: number
  duration_minutes?: number
  max_participants: number
  location?: string
  is_online: boolean
  requirements?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  employee_id: string
  service_id: string
  partner_id: string
  company_id: string
  amount: number
  credits_used: number
  commission_rate: number
  commission_amount: number
  qr_code: string
  qr_expires_at: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  booked_for?: string
  confirmed_at?: string
  cancelled_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Helper functions per query comuni
export const db = {
  // Companies
  companies: {
    getAll: () => supabase.from('companies').select('*'),
    getById: (id: string) => supabase.from('companies').select('*').eq('id', id).single(),
    create: (data: Partial<Company>) => supabase.from('companies').insert(data).select().single(),
    update: (id: string, data: Partial<Company>) => supabase.from('companies').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('companies').delete().eq('id', id)
  },
  
  // Employees
  employees: {
    getAll: () => supabase.from('employees').select('*'),
    getByCompany: (companyId: string) => supabase.from('employees').select('*').eq('company_id', companyId),
    getById: (id: string) => supabase.from('employees').select('*').eq('id', id).single(),
    create: (data: Partial<Employee>) => supabase.from('employees').insert(data).select().single(),
    update: (id: string, data: Partial<Employee>) => supabase.from('employees').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('employees').delete().eq('id', id)
  },
  
  // Partners
  partners: {
    getAll: () => supabase.from('partners').select('*'),
    getActive: () => supabase.from('partners').select('*').eq('status', 'active'),
    getById: (id: string) => supabase.from('partners').select('*').eq('id', id).single(),
    create: (data: Partial<Partner>) => supabase.from('partners').insert(data).select().single(),
    update: (id: string, data: Partial<Partner>) => supabase.from('partners').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('partners').delete().eq('id', id)
  },
  
  // Services
  services: {
    getAll: () => supabase.from('services').select('*, partners(business_name)'),
    getActive: () => supabase.from('services').select('*, partners(business_name)').eq('is_active', true),
    getByPartner: (partnerId: string) => supabase.from('services').select('*').eq('partner_id', partnerId),
    getByCategory: (category: string) => supabase.from('services').select('*, partners(business_name)').eq('category', category).eq('is_active', true),
    getById: (id: string) => supabase.from('services').select('*, partners(business_name)').eq('id', id).single(),
    create: (data: Partial<Service>) => supabase.from('services').insert(data).select().single(),
    update: (id: string, data: Partial<Service>) => supabase.from('services').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('services').delete().eq('id', id)
  },
  
  // Transactions
  transactions: {
    getAll: () => supabase.from('transactions').select(`
      *, 
      employees(first_name, last_name, email),
      services(name, category),
      partners(business_name),
      companies(name)
    `),
    getByEmployee: (employeeId: string) => supabase.from('transactions').select(`
      *, 
      services(name, category, price),
      partners(business_name)
    `).eq('employee_id', employeeId),
    getByCompany: (companyId: string) => supabase.from('transactions').select(`
      *, 
      employees(first_name, last_name),
      services(name, category),
      partners(business_name)
    `).eq('company_id', companyId),
    getByPartner: (partnerId: string) => supabase.from('transactions').select(`
      *, 
      employees(first_name, last_name),
      services(name, category),
      companies(name)
    `).eq('partner_id', partnerId),
    getById: (id: string) => supabase.from('transactions').select('*').eq('id', id).single(),
    create: (data: Partial<Transaction>) => supabase.from('transactions').insert(data).select().single(),
    update: (id: string, data: Partial<Transaction>) => supabase.from('transactions').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('transactions').delete().eq('id', id)
  }
}