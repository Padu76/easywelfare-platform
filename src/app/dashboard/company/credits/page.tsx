'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

export default function CompanyCreditsPage() {
  // Dati mock realistici - in attesa di integrare Zustand correttamente
  const [companyData, setCompanyData] = useState({
    name: 'TechCorp Verona',
    totalCredits: 3000,     // Realistico per 3 dipendenti
    usedCredits: 850,       // Qualche utilizzo
    availableCredits: 2150  // Rimanente
  })

  const [employees] = useState([
    { id: 'emp_1', firstName: 'Mario', lastName: 'Rossi', isActive: true },
    { id: 'emp_2', firstName: 'Giulia', lastName: 'Bianchi', isActive: true },
    { id: 'emp_3', firstName: 'Luca', lastName: 'Verdi', isActive: true }
  ])

  const [rechargeAmount, setRechargeAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeEmployees = employees.filter(emp => emp.isActive)
  const utilizationPercentage = companyData.totalCredits > 0 
    ? (companyData.usedCredits / companyData.totalCredits) * 100 
    : 0

  // Calcolo limiti fiscali REALI
  const fiscalAdvice = {
    maxAllowed: activeEmployees.length * 258.23,  // €258.23 per dipendente nel 2024
    used: companyData.usedCredits,
    remaining: Math.max(0, (activeEmployees.length * 258.23) - companyData.usedCredits),
    recommendedMonthly: Math.max(0, Math.floor(((activeEmployees.length * 258.23) - companyData.usedCredits) / 12))
  }

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount <= 0) return

    // CONTROLLO FISCALE PRIMA DEL PAGAMENTO
    const newTotal = companyData.totalCredits + amount
    const fiscalLimit = activeEmployees.length * 258.23

    if (newTotal > fiscalLimit) {
      const exceeding = newTotal - fiscalLimit
      const confirmMessage = `⚠️ ATTENZIONE FISCALE!\n\nStai per superare il limite tax-free di €${fiscalLimit.toFixed(2)}.\n\nEccedenza: €${exceeding.toFixed(2)} (sarà tassata come retribuzione)\n\nVuoi procedere comunque?`
      
      if (!confirm(confirmMessage)) {
        return
      }
    }
    
    setIsProcessing(true)
    
    try {
      // Simula pagamento Stripe
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aggiorna i crediti
      setCompanyData(prev => ({
        ...prev,
        totalCredits: prev.totalCredits + amount,
        availableCredits: prev.availableCredits + amount
      }))
      
      setRechargeAmount('')
      
      alert(`✅ Ricarica di €${amount.toLocaleString()} completata con successo!`)
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('❌ Errore nel processamento del pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const suggestedAmounts = [500, 774, 1000, 2000] // Importi più realistici

  const isOverFiscalLimit = companyData.totalCredits > fiscalAdvice.maxAllowed

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestione Crediti</h1>
        <p className="text-gray-600">Monitora e ricarica i crediti welfare della tua azienda</p>
      </div>

      {/* ALERT FISCALE SE SUPERATO IL LIMITE */}
      {isOverFiscalLimit && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">ATTENZIONE: Limite Fiscale Superato!</h3>
              <p className="text-red-700 text-sm mt-1">
                Hai €{(companyData.totalCredits - fiscalAdvice.maxAllowed).toFixed(2)} oltre il limite tax-free. 
                Questa eccedenza sarà considerata retribuzione tassabile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crediti Totali</p>
                <p className={`text-2xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-gray-900'}`}>
                  €{companyData.totalCredits.toLocaleString()}
                </p>
                {isOverFiscalLimit && (
                  <p className="text-xs text-red-600">⚠️ Oltre il limite</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">💳</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crediti Utilizzati</p>
                <p className="text-2xl font-bold text-red-600">€{companyData.usedCredits.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">💰</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crediti Disponibili</p>
                <p className="text-2xl font-bold text-green-600">€{companyData.availableCredits.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
                <p className="text-2xl font-bold text-purple-600">{activeEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Usage Progress Bar */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Utilizzo Crediti</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Utilizzati: €{companyData.usedCredits.toLocaleString()}</span>
              <span>Totali: €{companyData.totalCredits.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isOverFiscalLimit 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
                style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Utilizzo: {utilizationPercentage.toFixed(1)}% dei crediti totali
            </p>
          </div>
        </Card.Content>
      </Card>

      {/* Recharge Section and Fiscal Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharge Credits con CONTROLLI */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Ricarica Crediti</h3>
            <p className="text-sm text-gray-600">Aggiungi crediti al tuo account aziendale</p>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input
                label="Importo (€)"
                type="number"
                placeholder="Es. 500"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                icon={<span>€</span>}
              />
              
              {/* PREVIEW FISCALE */}
              {rechargeAmount && parseFloat(rechargeAmount) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm font-medium mb-1">📊 Anteprima:</p>
                  <p className="text-blue-700 text-sm">
                    Nuovo totale: €{(companyData.totalCredits + parseFloat(rechargeAmount)).toLocaleString()}
                  </p>
                  {(companyData.totalCredits + parseFloat(rechargeAmount)) > fiscalAdvice.maxAllowed && (
                    <p className="text-red-700 text-sm font-medium mt-1">
                      ⚠️ Supereresti il limite fiscale di €{Math.round((companyData.totalCredits + parseFloat(rechargeAmount)) - fiscalAdvice.maxAllowed)}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Importi suggeriti:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="secondary"
                      size="sm"
                      onClick={() => setRechargeAmount(amount.toString())}
                    >
                      €{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleRecharge}
                loading={isProcessing}
                disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Elaborando pagamento...' : `💳 Ricarica €${rechargeAmount || '0'}`}
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Info:</strong> I pagamenti vengono elaborati tramite Stripe. 
                  Ti avviseremo se superi i limiti fiscali.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Fiscal Advice DETTAGLIATA */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Consulenza Fiscale</h3>
            <p className="text-sm text-gray-600">Ottimizza i vantaggi fiscali del welfare</p>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-lg p-3 ${isOverFiscalLimit ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-sm font-medium ${isOverFiscalLimit ? 'text-red-600' : 'text-green-600'}`}>
                    Limite Annuale
                  </p>
                  <p className={`text-lg font-bold ${isOverFiscalLimit ? 'text-red-700' : 'text-green-700'}`}>
                    €{fiscalAdvice.maxAllowed.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">{activeEmployees.length} dipendenti attivi</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 font-medium">Utilizzato</p>
                  <p className="text-lg font-bold text-yellow-700">€{fiscalAdvice.used.toLocaleString()}</p>
                  <p className="text-xs text-yellow-600">Anno corrente</p>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 ${isOverFiscalLimit ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm font-medium mb-2 ${isOverFiscalLimit ? 'text-red-600' : 'text-blue-600'}`}>
                  {isOverFiscalLimit ? '🚨 Situazione Fiscale' : '💡 Raccomandazione'}
                </p>
                {isOverFiscalLimit ? (
                  <div className="text-red-800 text-sm space-y-2">
                    <p><strong>Hai superato il limite tax-free!</strong></p>
                    <p>Eccedenza tassabile: <strong>€{(companyData.totalCredits - fiscalAdvice.maxAllowed).toFixed(2)}</strong></p>
                    <p>Imposta stimata (22%): <strong>€{((companyData.totalCredits - fiscalAdvice.maxAllowed) * 0.22).toFixed(2)}</strong></p>
                  </div>
                ) : (
                  <div className="text-blue-800 text-sm">
                    <p>
                      Puoi ancora utilizzare <strong>€{fiscalAdvice.remaining.toFixed(2)}</strong> 
                      di welfare tax-free quest&apos;anno.
                    </p>
                    <p className="mt-2">
                      Importo mensile consigliato: <strong>€{fiscalAdvice.recommendedMonthly.toFixed(2)}</strong>
                    </p>
                  </div>
                )}
              </div>
              
              <Button variant="secondary" className="w-full">
                📋 Scarica Report Fiscale
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Company Info Summary */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">📊 Riepilogo {companyData.name}</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Dipendenti Totali</p>
              <p className="text-xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Limite per Dipendente</p>
              <p className="text-xl font-bold text-gray-900">€258.23</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tasso Utilizzo</p>
              <p className="text-xl font-bold text-gray-900">{utilizationPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Status Fiscale</p>
              <p className={`text-xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-green-600'}`}>
                {isOverFiscalLimit ? '⚠️ Oltre' : '✅ OK'}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}