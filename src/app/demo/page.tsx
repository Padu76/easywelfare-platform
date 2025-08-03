'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoPage() {
  const [userType, setUserType] = useState<'company' | 'employee' | 'partner'>('company')
  const [points, setPoints] = useState(1000)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              EasyWelfare
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Torna alla Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Interattiva</h1>
          <p className="mt-2 text-gray-600">Esplora le funzionalità di EasyWelfare</p>
        </div>

        {/* User Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setUserType('company')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                userType === 'company' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Azienda
            </button>
            <button
              onClick={() => setUserType('employee')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                userType === 'employee' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Dipendente
            </button>
            <button
              onClick={() => setUserType('partner')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                userType === 'partner' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Partner
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Demo */}
          {userType === 'company' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Gestione Crediti</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Credito disponibile</span>
                    <span className="font-semibold text-green-600">€5,000</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Ricarica Credito
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Distribuzione Punti</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border-b">
                    <span>Mario Rossi</span>
                    <span className="text-blue-600">500 punti</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <span>Giulia Bianchi</span>
                    <span className="text-blue-600">750 punti</span>
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                    Distribuisci Punti
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Employee Demo */}
          {userType === 'employee' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">I Tuoi Punti</h3>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-blue-600">{points}</div>
                  <div className="text-gray-600">Punti disponibili</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Servizi Disponibili</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div>
                      <div className="font-medium">Personal Training</div>
                      <div className="text-sm text-gray-600">1 sessione - 200 punti</div>
                    </div>
                    <button 
                      onClick={() => setPoints(points - 200)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      disabled={points < 200}
                    >
                      Prenota
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div>
                      <div className="font-medium">Massaggio Rilassante</div>
                      <div className="text-sm text-gray-600">1 sessione - 150 punti</div>
                    </div>
                    <button 
                      onClick={() => setPoints(points - 150)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      disabled={points < 150}
                    >
                      Prenota
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Partner Demo */}
          {userType === 'partner' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">I Tuoi Servizi</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Personal Training</div>
                    <div className="text-sm text-gray-600">Prezzo: 200 punti</div>
                    <div className="text-sm text-green-600">Vendite: 15 questo mese</div>
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                    Aggiungi Servizio
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Scanner QR</h3>
                <div className="text-center py-8">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-500">📱 QR Scanner</span>
                  </div>
                  <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Scansiona QR
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/dashboard/company" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block">
            Inizia Ora
          </Link>
        </div>
      </div>
    </div>
  )
}