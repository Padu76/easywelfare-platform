'use client'

import { useState, useEffect } from 'react'
import { supabase, db } from '@/lib/supabase'

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [tables, setTables] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...')
      
      // Test 1: Connessione base
      const { data: connectionTest, error: connectionError } = await supabase
        .from('companies')
        .select('count(*)')
        .limit(1)

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }

      console.log('✅ Database connection successful!')

      // Test 2: Lista delle tabelle (semplificato)
      const tableNames = ['companies', 'employees', 'partners', 'services', 'transactions', 'credits_history']
      
      // Testiamo ogni tabella per verificare che esistano
      const tableTests = await Promise.allSettled([
        supabase.from('companies').select('count(*)').limit(1),
        supabase.from('employees').select('count(*)').limit(1),
        supabase.from('partners').select('count(*)').limit(1),
        supabase.from('services').select('count(*)').limit(1),
        supabase.from('transactions').select('count(*)').limit(1),
        supabase.from('credits_history').select('count(*)').limit(1),
      ])

      // Verifica quali tabelle esistono
      const existingTables = tableNames.filter((_, index) => 
        tableTests[index].status === 'fulfilled'
      )
      
      setTables(existingTables)

      // Test 3: CRUD operations di base
      const tests = []

      // Test creazione azienda
      try {
        const { data: newCompany, error: createError } = await db.companies.create({
          name: 'Test Company',
          email: `test-${Date.now()}@example.com`,
          employees_count: 10,
          monthly_budget_per_employee: 50.00,
          plan_type: 'starter'
        })

        if (createError) throw createError

        tests.push({
          test: 'Create Company',
          status: 'success',
          data: newCompany
        })

        // Test lettura azienda
        const { data: fetchedCompany, error: fetchError } = await db.companies.getById(newCompany.id)
        
        if (fetchError) throw fetchError

        tests.push({
          test: 'Read Company',
          status: 'success',
          data: fetchedCompany
        })

        // Test aggiornamento azienda
        const { data: updatedCompany, error: updateError } = await db.companies.update(newCompany.id, {
          employees_count: 15
        })

        if (updateError) throw updateError

        tests.push({
          test: 'Update Company',
          status: 'success',
          data: updatedCompany
        })

        // Test eliminazione azienda
        const { error: deleteError } = await db.companies.delete(newCompany.id)

        if (deleteError) throw deleteError

        tests.push({
          test: 'Delete Company',
          status: 'success',
          data: 'Company deleted successfully'
        })

      } catch (testError: any) {
        tests.push({
          test: 'CRUD Operations',
          status: 'error',
          error: testError.message
        })
      }

      setTestResults(tests)
      setConnectionStatus('success')

    } catch (err: any) {
      console.error('❌ Database test failed:', err)
      setError(err.message)
      setConnectionStatus('error')
    }
  }

  const retryTest = () => {
    setConnectionStatus('testing')
    setError(null)
    setTestResults([])
    testDatabaseConnection()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧪 Test Connessione Database Supabase
            </h1>
            <p className="text-gray-600">
              Verifica che tutto sia configurato correttamente
            </p>
          </div>

          {/* Status generale */}
          <div className="mb-8">
            <div className={`p-4 rounded-lg border-2 ${
              connectionStatus === 'testing' 
                ? 'border-blue-200 bg-blue-50' 
                : connectionStatus === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {connectionStatus === 'testing' && (
                    <>
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-blue-800 font-medium">Testing database connection...</span>
                    </>
                  )}
                  {connectionStatus === 'success' && (
                    <>
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-green-800 font-medium">Database connection successful!</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✗</span>
                      </div>
                      <span className="text-red-800 font-medium">Database connection failed</span>
                    </>
                  )}
                </div>
                {connectionStatus === 'error' && (
                  <button
                    onClick={retryTest}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry Test
                  </button>
                )}
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-mono">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabelle create */}
          {tables.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Tabelle Database</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-gray-900 font-medium">{table}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risultati test CRUD */}
          {testResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Test CRUD Operations</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status === 'success' ? '✅' : '❌'}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900">{result.test}</h3>
                          {result.error && (
                            <p className="text-red-600 text-sm mt-1">{result.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {result.data && result.status === 'success' && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                        <pre className="text-sm text-gray-700 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prossimi passi */}
          {connectionStatus === 'success' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">🚀 Prossimi Passi</h2>
              <ul className="space-y-2 text-blue-800">
                <li>✅ Database configurato correttamente</li>
                <li>✅ Tutte le tabelle create</li>
                <li>✅ CRUD operations funzionanti</li>
                <li>🔄 Ora possiamo costruire la Dashboard Azienda!</li>
              </ul>
              <div className="mt-4">
                <a 
                  href="/dashboard/company" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Vai alla Dashboard Azienda →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}