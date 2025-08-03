'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EmployeeDashboard() {
  const [employeeData] = useState({
    name: 'Mario Rossi',
    availablePoints: 750,
    usedPoints: 250,
    totalPoints: 1000
  })

  const [recentTransactions] = useState([
    { id: 1, service: 'Personal Training', points: 200, date: '2024-01-15', status: 'completed' },
    { id: 2, service: 'Massaggio', points: 150, date: '2024-01-10', status: 'completed' },
    { id: 3, service: 'Consulenza Nutrizionale', points: 100, date: '2024-01-05', status: 'completed' }
  ])

  const progressPercentage = (employeeData.usedPoints / employeeData.totalPoints) * 100

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ciao {employeeData.name}! 👋</h1>
        <p className="text-gray-600">Ecco i tuoi punti welfare disponibili</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Punti Disponibili</p>
              <p className="text-3xl font-bold">{employeeData.availablePoints}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Punti Utilizzati</p>
              <p className="text-2xl font-bold text-gray-900">{employeeData.usedPoints}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Punti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{employeeData.totalPoints}</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Utilizzo</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Hai utilizzato {employeeData.usedPoints} di {employeeData.totalPoints} punti ({progressPercentage.toFixed(0)}%)
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link href="/dashboard/employee/catalog" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <span>🛍️</span>
              <span>Esplora Catalogo</span>
            </Link>
            <Link href="/dashboard/employee/qr" className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>📱</span>
              <span>Genera QR Code</span>
            </Link>
            <Link href="/dashboard/employee/history" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <span>📋</span>
              <span>Visualizza Storico</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servizi Popolari</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
              <span className="text-2xl">🏋️</span>
              <div className="flex-1">
                <p className="font-medium">Personal Training</p>
                <p className="text-sm text-gray-600">200 punti</p>
              </div>
              <span className="text-green-600 font-semibold">Popolare</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
              <span className="text-2xl">💆</span>
              <div className="flex-1">
                <p className="font-medium">Massaggio</p>
                <p className="text-sm text-gray-600">150 punti</p>
              </div>
              <span className="text-blue-600 font-semibold">Rilassante</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
              <span className="text-2xl">🥗</span>
              <div className="flex-1">
                <p className="font-medium">Consulenza Nutrizionale</p>
                <p className="text-sm text-gray-600">100 punti</p>
              </div>
              <span className="text-orange-600 font-semibold">Salute</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transazioni Recenti</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{transaction.service}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">-{transaction.points}</td>
                  <td className="py-3 px-4 text-gray-600">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      ✅ Completato
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}