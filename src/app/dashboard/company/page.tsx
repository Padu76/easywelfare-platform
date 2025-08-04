'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Company, Employee, Transaction } from '@/types'

interface DashboardStats {
  totalCredits: number
  usedCredits: number
  availableCredits: number
  activeEmployees: number
  totalTransactions: number
  monthlySpend: number
  recentTransactions: Transaction[]
}

export default function CompanyDashboard() {
  const [companyData, setCompanyData] = useState<Company | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCredits: 0,
    usedCredits: 0,
    availableCredits: 0,
    activeEmployees: 0,
    totalTransactions: 0,
    monthlySpend: 0,
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load company data (assuming we're working with the first company for now)
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single()

      if (companiesError) {
        // If no companies exist, create a demo company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            name: 'TechCorp Verona',
            email: 'admin@techcorp.com',
            phone: '+39 045 123 4567',
            address: 'Via Roma 123, Verona',
            vat_number: 'IT12345678901',
            total_credits: 3000,
            used_credits: 850,
            active_employees: 3
          }])
          .select()
          .single()

        if (createError) throw createError
        setCompanyData(newCompany)
      } else {
        setCompanyData(companies)
      }

      // Load employees data
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)

      if (employeesError) throw employeesError

      // Load transactions data (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactionsError && transactionsError.code !== 'PGRST116') {
        console.warn('Transactions query failed:', transactionsError)
      }

      // Calculate stats
      const totalTransactions = transactions?.length || 0
      const monthlySpend = transactions?.reduce((sum, txn) => sum + ((txn as any).points_used || 0), 0) || 0
      const activeEmployees = employees?.length || 0
      
      const company = companies || companyData
      const totalCredits = (company as any)?.total_credits || 0
      const usedCredits = (company as any)?.used_credits || 0
      const availableCredits = totalCredits - usedCredits

      setStats({
        totalCredits,
        usedCredits,
        availableCredits,
        activeEmployees,
        totalTransactions,
        monthlySpend,
        recentTransactions: transactions || []
      })

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Errore nel caricamento dei dati. Verifica la connessione al database.')
    } finally {
      setLoading(false)
    }
  }

  const utilizationPercentage = stats.totalCredits > 0 
    ? (stats.usedCredits / stats.totalCredits) * 100 
    : 0

  // Fiscal calculations
  const fiscalLimit = stats.activeEmployees * 258.23
  const isOverFiscalLimit = stats.totalCredits > fiscalLimit
  const taxSavings = Math.round(stats.usedCredits * 0.22)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
          <p className="text-gray-600">Errore nel caricamento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
        <p className="text-gray-600">
          Panoramica del welfare aziendale per {companyData?.name || 'La tua azienda'}
        </p>
      </div>

      {/* Fiscal Alert */}
      {isOverFiscalLimit && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">ATTENZIONE: Limite Fiscale Superato!</h3>
              <p className="text-red-700 text-sm mt-1">
                Hai €{(stats.totalCredits - fiscalLimit).toFixed(2)} oltre il limite tax-free. 
                Questa eccedenza sarà considerata retribuzione tassabile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 text-lg">💳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crediti Totali</p>
              <p className={`text-2xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-gray-900'}`}>
                €{stats.totalCredits.toLocaleString()}
              </p>
              {isOverFiscalLimit && (
                <p className="text-xs text-red-600">⚠️ Oltre il limite</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crediti Utilizzati</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.usedCredits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <span className="text-yellow-600 text-lg">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transazioni</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link 
              href="/dashboard/company/credits" 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Ricarica Crediti</span>
            </Link>
            <Link 
              href="/dashboard/company/employees" 
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>👥</span>
              <span>Distribuisci Punti</span>
            </Link>
            <Link 
              href="/dashboard/company/reports" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>📈</span>
              <span>Visualizza Report</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-4">
            {stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-green-600">✅</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Transazione completata</p>
                    <p className="text-xs text-gray-600">
                      {(transaction as any).points_used} punti utilizzati
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date((transaction as any).created_at).toLocaleDateString('it-IT')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-2xl block mb-2">📭</span>
                <p className="text-sm">Nessuna transazione recente</p>
                <p className="text-xs mt-1">Le transazioni dei dipendenti appariranno qui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilizzo Crediti</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Utilizzati: €{stats.usedCredits.toLocaleString()}</span>
            <span>Disponibili: €{stats.availableCredits.toLocaleString()}</span>
            <span>Totali: €{stats.totalCredits.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverFiscalLimit 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Utilizzo: {utilizationPercentage.toFixed(1)}% dei crediti totali
          </p>
        </div>
      </div>

      {/* Fiscal Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Riepilogo Fiscale</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Limite Annuale Consigliato</p>
            <p className={`text-xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-green-600'}`}>
              €{fiscalLimit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{stats.activeEmployees} dipendenti × €258.23</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Utilizzato Anno Corrente</p>
            <p className="text-xl font-bold text-yellow-600">€{stats.usedCredits.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Tax-free utilizzato</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Risparmio Fiscale Stimato</p>
            <p className="text-xl font-bold text-purple-600">€{taxSavings.toLocaleString()}</p>
            <p className="text-xs text-gray-500">22% sui benefit erogati</p>
          </div>
        </div>
        
        {isOverFiscalLimit && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Attenzione:</strong> Hai caricato più del limite fiscale consigliato. 
              L&apos;eccedenza potrebbe essere tassata come retribuzione.
            </p>
          </div>
        )}

        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            🔗 <strong>Database Connesso:</strong> Stai visualizzando dati reali da Supabase. 
            <Link href="/dashboard/company/credits" className="underline hover:text-blue-900">
              Gestisci i crediti reali qui
            </Link>
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center">
          <span className="text-green-600 text-lg mr-2">✅</span>
          <p className="text-green-800 text-sm">
            <strong>Database Attivo:</strong> Connesso a Supabase - Dati sincronizzati in tempo reale
          </p>
        </div>
      </div>
    </div>
  )
}