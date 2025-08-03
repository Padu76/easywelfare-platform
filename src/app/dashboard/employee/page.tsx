'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEasyWelfareStore } from '@/lib/store'

export default function EmployeeDashboard() {
  const { 
    employees, 
    transactions, 
    setCurrentUser, 
    currentUserId,
    getTransactionsByEmployee 
  } = useEasyWelfareStore()

  // For demo purposes, we'll use the first employee
  // In real app, this would come from authentication
  const [currentEmployeeId] = useState('emp_1')
  
  useEffect(() => {
    setCurrentUser('employee', currentEmployeeId)
  }, [setCurrentUser, currentEmployeeId])

  // Get current employee data
  const currentEmployee = employees.find(emp => emp.id === currentEmployeeId)
  const employeeTransactions = getTransactionsByEmployee(currentEmployeeId)

  if (!currentEmployee) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Dipendente non trovato</h1>
          <p className="text-gray-600">Verifica i tuoi dati di accesso</p>
        </div>
      </div>
    )
  }

  const progressPercentage = currentEmployee.totalPoints > 0 
    ? (currentEmployee.usedPoints / currentEmployee.totalPoints) * 100 
    : 0

  // Get recent transactions (last 3)
  const recentTransactions = employeeTransactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ciao {currentEmployee.firstName}! 👋
        </h1>
        <p className="text-gray-600">Ecco i tuoi punti welfare disponibili</p>
      </div>

      {/* Points Overview - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Punti Disponibili</p>
              <p className="text-3xl font-bold">{currentEmployee.availablePoints.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Punti Utilizzati</p>
              <p className="text-2xl font-bold text-gray-900">{currentEmployee.usedPoints.toLocaleString()}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Punti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{currentEmployee.totalPoints.toLocaleString()}</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Progress Bar - REAL DATA */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Utilizzo</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div  
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Hai utilizzato {currentEmployee.usedPoints.toLocaleString()} di {currentEmployee.totalPoints.toLocaleString()} punti ({progressPercentage.toFixed(0)}%)
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Personali</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-md">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <p className="font-medium">Transazioni Totali</p>
                <p className="text-sm text-gray-600">{employeeTransactions.length} servizi utilizzati</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-md">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <p className="font-medium">Risparmi Totali</p>
                <p className="text-sm text-gray-600">
                  Calcolato sui servizi utilizzati
                </p>
              </div>
              <span className="text-green-600 font-semibold">
                €{employeeTransactions.length * 15} {/* Estimated savings */}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-md">
              <span className="text-2xl">⚡</span>
              <div className="flex-1">
                <p className="font-medium">Account Attivo</p>
                <p className="text-sm text-gray-600">
                  {currentEmployee.isActive ? 'Tutte le funzioni disponibili' : 'Account sospeso'}
                </p>
              </div>
              <span className={`font-semibold ${currentEmployee.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {currentEmployee.isActive ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions - REAL DATA */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transazioni Recenti</h3>
        {recentTransactions.length > 0 ? (
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
                    <td className="py-3 px-4">Servizio #{transaction.serviceId.slice(-3)}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">-{transaction.pointsUsed}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? '✅ Completato' : '⏳ In attesa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🎯</span>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nessuna transazione ancora</h4>
            <p className="text-gray-600 mb-4">Inizia a utilizzare i tuoi punti welfare!</p>
            <Link href="/dashboard/employee/catalog" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Esplora Servizi
            </Link>
          </div>
        )}
        
        {recentTransactions.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard/employee/history" className="text-blue-600 hover:text-blue-800">
              Vedi tutte le transazioni →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Suggerimenti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Massimizza i tuoi benefici</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Usa i punti prima della scadenza</li>
              <li>• Combina più servizi dello stesso partner</li>
              <li>• Controlla le offerte speciali</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Come funziona</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Scegli un servizio dal catalogo</li>
              <li>• Genera il QR code</li>
              <li>• Vai dal partner e mostra il QR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}