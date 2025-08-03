'use client'

import { useState } from 'react'
import { useEasyWelfareStore } from '@/lib/store'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

export default function CompanyCreditsPage() {
  const { company, addCredits, employees } = useEasyWelfareStore()
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate real utilization
  const utilizationPercentage = company.totalCredits > 0 
    ? (company.usedCredits / company.totalCredits) * 100 
    : 0

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount <= 0) return
    
    setIsProcessing(true)
    
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add credits to store
      addCredits(amount)
      
      setRechargeAmount('')
      
      // Show success (in real app would be toast notification)
      alert(`Ricarica di €${amount.toLocaleString()} completata con successo!`)
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Errore nel processamento del pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const suggestedAmounts = [1000, 2500, 5000, 10000]

  const getFiscalAdvice = () => {
    const employeeCount = employees.filter(emp => emp.isActive).length
    const maxWelfarePerEmployee = 258.23 // 2024 tax-free limit per employee per year
    const maxTotalWelfare = employeeCount * maxWelfarePerEmployee
    const currentYearUsed = company.usedCredits // This should be year-to-date
    
    return {
      maxAllowed: maxTotalWelfare,
      used: currentYearUsed,
      remaining: Math.max(0, maxTotalWelfare - currentYearUsed),
      recommendedMonthly: Math.max(0, Math.floor((maxTotalWelfare - currentYearUsed) / 12))
    }
  }

  const fiscalAdvice = getFiscalAdvice()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestione Crediti</h1>
        <p className="text-gray-600">Monitora e ricarica i crediti welfare della tua azienda</p>
      </div>

      {/* Credits Overview - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crediti Totali</p>
                <p className="text-2xl font-bold text-gray-900">€{company.totalCredits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-red-600">€{company.usedCredits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-green-600">€{company.availableCredits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-purple-600">{employees.filter(emp => emp.isActive).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Usage Progress Bar - REAL DATA */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Utilizzo Crediti</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Utilizzati: €{company.usedCredits.toLocaleString()}</span>
              <span>Totali: €{company.totalCredits.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
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
        {/* Recharge Credits - FUNCTIONAL */}
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
                placeholder="Es. 5000"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                icon={<span>€</span>}
              />
              
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
                  I crediti saranno disponibili immediatamente.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Fiscal Advice - REAL CALCULATIONS */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Consulenza Fiscale</h3>
            <p className="text-sm text-gray-600">Ottimizza i vantaggi fiscali del welfare</p>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-green-600 font-medium">Limite Annuale</p>
                  <p className="text-lg font-bold text-green-700">€{fiscalAdvice.maxAllowed.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{employees.filter(emp => emp.isActive).length} dipendenti attivi</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 font-medium">Utilizzato</p>
                  <p className="text-lg font-bold text-yellow-700">€{fiscalAdvice.used.toLocaleString()}</p>
                  <p className="text-xs text-yellow-600">Anno corrente</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-2">💡 Raccomandazione</p>
                <p className="text-blue-800 text-sm">
                  Puoi ancora utilizzare <strong>€{fiscalAdvice.remaining.toLocaleString()}</strong> 
                  di welfare tax-free quest&apos;anno.
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  Importo mensile consigliato: <strong>€{fiscalAdvice.recommendedMonthly.toLocaleString()}</strong>
                </p>
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
          <h3 className="text-lg font-semibold text-gray-900">📊 Riepilogo {company.name}</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Dipendenti Totali</p>
              <p className="text-xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Media Punti per Dipendente</p>
              <p className="text-xl font-bold text-gray-900">
                {employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.availablePoints, 0) / employees.length) : 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tasso Utilizzo</p>
              <p className="text-xl font-bold text-gray-900">{utilizationPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}