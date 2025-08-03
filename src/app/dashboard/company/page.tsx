'use client'

import Link from 'next/link'

export default function CompanyDashboard() {
  // Dati mock temporanei per testare
  const mockCompany = {
    name: 'TechCorp Verona',
    totalCredits: 3000,
    usedCredits: 850,
    availableCredits: 2150
  }

  const mockEmployees = [
    { id: 'emp_1', firstName: 'Mario', lastName: 'Rossi', isActive: true },
    { id: 'emp_2', firstName: 'Giulia', lastName: 'Bianchi', isActive: true },
    { id: 'emp_3', firstName: 'Luca', lastName: 'Verdi', isActive: true }
  ]

  const mockTransactions = [
    { id: 'txn_1', pointsUsed: 200, createdAt: '2024-01-15' },
    { id: 'txn_2', pointsUsed: 150, createdAt: '2024-01-12' }
  ]

  const activeEmployees = mockEmployees.filter(emp => emp.isActive)
  const totalTransactions = mockTransactions.length
  const utilizationPercentage = mockCompany.totalCredits > 0 
    ? (mockCompany.usedCredits / mockCompany.totalCredits) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
        <p className="text-gray-600">Panoramica del welfare aziendale per {mockCompany.name}</p>
      </div>

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
              <p className="text-2xl font-bold text-gray-900">€{mockCompany.totalCredits.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">€{mockCompany.usedCredits.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - WORKING LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link href="/dashboard/company/credits" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <span>💳</span>
              <span>Ricarica Crediti</span>
            </Link>
            <Link href="/dashboard/company/employees" className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>👥</span>
              <span>Distribuisci Punti</span>
            </Link>
            <Link href="/dashboard/company/reports" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <span>📈</span>
              <span>Visualizza Report</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-4">
            {mockTransactions.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="text-green-600">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Transazione completata</p>
                  <p className="text-xs text-gray-600">{transaction.pointsUsed} punti utilizzati</p>
                </div>
                <span className="text-xs text-gray-500">{transaction.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilizzo Crediti</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Utilizzati: €{mockCompany.usedCredits.toLocaleString()}</span>
            <span>Disponibili: €{mockCompany.availableCredits.toLocaleString()}</span>
            <span>Totali: €{mockCompany.totalCredits.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
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
            <p className="text-xl font-bold text-green-600">
              €{(activeEmployees.length * 258.23).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{activeEmployees.length} dipendenti × €258.23</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Utilizzato Anno Corrente</p>
            <p className="text-xl font-bold text-yellow-600">€{mockCompany.usedCredits.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Tax-free utilizzato</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Risparmio Fiscale Stimato</p>
            <p className="text-xl font-bold text-purple-600">
              €{Math.round(mockCompany.usedCredits * 0.22).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">22% sui benefit erogati</p>
          </div>
        </div>
        
        {mockCompany.totalCredits > (activeEmployees.length * 258.23) && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Attenzione:</strong> Hai caricato più del limite fiscale consigliato. 
              L&apos;eccedenza potrebbe essere tassata come retribuzione.
            </p>
          </div>
        )}

        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            🚧 <strong>Modalità Test:</strong> Stai usando dati demo. 
            <Link href="/dashboard/company/credits" className="underline hover:text-blue-900">
              Clicca qui per gestire i crediti reali
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}