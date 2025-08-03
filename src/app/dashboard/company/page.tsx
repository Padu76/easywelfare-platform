'use client'

import { useState } from 'react'

export default function CompanyDashboard() {
  const [companyStats] = useState({
    totalCredits: 5000,
    usedCredits: 2300,
    activeEmployees: 45,
    totalTransactions: 127
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
        <p className="text-gray-600">Panoramica del welfare aziendale</p>
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
              <p className="text-2xl font-bold text-gray-900">€{companyStats.totalCredits.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">€{companyStats.usedCredits.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{companyStats.activeEmployees}</p>
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
              <p className="text-2xl font-bold text-gray-900">{companyStats.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
              💳 Ricarica Crediti
            </button>
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors">
              👥 Distribuisci Punti
            </button>
            <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors">
              📈 Visualizza Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-green-600">✅</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Punti distribuiti</p>
                <p className="text-xs text-gray-600">500 punti a Mario Rossi</p>
              </div>
              <span className="text-xs text-gray-500">2h fa</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-blue-600">💳</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Crediti ricaricati</p>
                <p className="text-xs text-gray-600">€1,000 aggiunti</p>
              </div>
              <span className="text-xs text-gray-500">1g fa</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-purple-600">👤</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuovo dipendente</p>
                <p className="text-xs text-gray-600">Giulia Bianchi registrata</p>
              </div>
              <span className="text-xs text-gray-500">3g fa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilizzo Crediti (Ultimo Mese)</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">📊 Grafico utilizzo crediti</p>
        </div>
      </div>
    </div>
  )
}