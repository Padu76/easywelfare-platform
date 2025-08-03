'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PartnerDashboard() {
  const [partnerData] = useState({
    businessName: 'FitCenter Verona',
    category: 'Fitness & Benessere',
    monthlyRevenue: 2850,
    totalTransactions: 47,
    activeServices: 8,
    pendingPayment: 2565
  })

  const [recentSales] = useState([
    { id: 1, service: 'Personal Training', points: 200, customer: 'Mario R.', date: '2024-01-15' },
    { id: 2, service: 'Massaggio Rilassante', points: 150, customer: 'Giulia B.', date: '2024-01-15' },
    { id: 3, service: 'Corso Yoga', points: 120, customer: 'Luca M.', date: '2024-01-14' },
    { id: 4, service: 'Personal Training', points: 200, customer: 'Anna P.', date: '2024-01-14' }
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ciao {partnerData.businessName}! 🏪</h1>
        <p className="text-gray-600">Gestisci i tuoi servizi e monitora le vendite</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Ricavi Mese</p>
              <p className="text-2xl font-bold">€{partnerData.monthlyRevenue}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Transazioni</p>
              <p className="text-2xl font-bold text-gray-900">{partnerData.totalTransactions}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Servizi Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{partnerData.activeServices}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Da Ricevere</p>
              <p className="text-2xl font-bold text-gray-900">€{partnerData.pendingPayment}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Business</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <span className="text-blue-600">🏷️</span>
            <div>
              <p className="font-medium">Categoria</p>
              <p className="text-sm text-gray-600">{partnerData.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <span className="text-green-600">💼</span>
            <div>
              <p className="font-medium">Commissione</p>
              <p className="text-sm text-gray-600">15% sui servizi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link href="/dashboard/partner/services" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <span>⚡</span>
              <span>Gestisci Servizi</span>
            </Link>
            <Link href="/dashboard/partner/vouchers" className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>📱</span>
              <span>Scanner QR</span>
            </Link>
            <Link href="/dashboard/partner/transactions" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <span>💰</span>
              <span>Vedi Transazioni</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servizi Top</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-2xl">🏋️</span>
              <div className="flex-1">
                <p className="font-medium">Personal Training</p>
                <p className="text-sm text-gray-600">15 vendite questo mese</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">€1,200</p>
                <p className="text-xs text-gray-500">200 punti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-2xl">💆</span>
              <div className="flex-1">
                <p className="font-medium">Massaggio</p>
                <p className="text-sm text-gray-600">12 vendite questo mese</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">€900</p>
                <p className="text-xs text-gray-500">150 punti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <span className="text-2xl">🧘</span>
              <div className="flex-1">
                <p className="font-medium">Corso Yoga</p>
                <p className="text-sm text-gray-600">8 vendite questo mese</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">€480</p>
                <p className="text-xs text-gray-500">120 punti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendite Recenti</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Azione</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{sale.service}</td>
                  <td className="py-3 px-4 text-gray-600">{sale.customer}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">{sale.points}</td>
                  <td className="py-3 px-4 text-gray-600">{sale.date}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scanner QR Code</h3>
        <div className="text-center py-8">
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <p className="text-gray-600 mb-4">Scansiona il QR del cliente per validare la transazione</p>
          <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
            Avvia Scanner
          </button>
        </div>
      </div>
    </div>
  )
}