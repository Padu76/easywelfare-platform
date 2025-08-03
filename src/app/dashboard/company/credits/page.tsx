'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

export default function CompanyCreditsPage() {
  const [creditData] = useState({
    totalCredits: 10000,
    usedCredits: 3500,
    availableCredits: 6500,
    pendingTransactions: 850,
    lastRecharge: '2024-01-15',
    nextBilling: '2024-02-15'
  })

  const [rechargeAmount, setRechargeAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [rechargeHistory] = useState([
    { id: 1, amount: 5000, date: '2024-01-15', method: 'Bonifico', status: 'completed' },
    { id: 2, amount: 3000, date: '2024-01-01', method: 'Carta di Credito', status: 'completed' },
    { id: 3, amount: 2000, date: '2023-12-15', method: 'Bonifico', status: 'completed' }
  ])

  const suggestedAmounts = [1000, 2500, 5000, 10000]
  const utilizationPercentage = (creditData.usedCredits / creditData.totalCredits) * 100

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) return
    
    setIsProcessing(true)
    
    try {
      // Simulate Stripe payment integration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here would be Stripe integration
      console.log('Processing payment for:', rechargeAmount)
      
      setRechargeAmount('')
      // Show success notification
      
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getFiscalAdvice = () => {
    const employeeCount = 45 // This would come from actual data
    const maxWelfarePerEmployee = 258.23 // 2024 tax-free limit per employee per year
    const maxTotalWelfare = employeeCount * maxWelfarePerEmployee
    const currentYearUsed = creditData.usedCredits // This should be year-to-date
    
    return {
      maxAllowed: maxTotalWelfare,
      used: currentYearUsed,
      remaining: maxTotalWelfare - currentYearUsed,
      recommendedMonthly: Math.floor((maxTotalWelfare - currentYearUsed) / 12)
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

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crediti Totali</p>
                <p className="text-2xl font-bold text-gray-900">€{creditData.totalCredits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-red-600">€{creditData.usedCredits.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-green-600">€{creditData.availableCredits.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-600">Transazioni Pending</p>
                <p className="text-2xl font-bold text-yellow-600">€{creditData.pendingTransactions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
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
              <span>Utilizzati: €{creditData.usedCredits.toLocaleString()}</span>
              <span>Totali: €{creditData.totalCredits.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${utilizationPercentage}%` }}
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
        {/* Recharge Credits */}
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
                  Riceverai una ricevuta via email una volta completato.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Fiscal Advice */}
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
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 font-medium">Utilizzato</p>
                  <p className="text-lg font-bold text-yellow-700">€{fiscalAdvice.used.toLocaleString()}</p>
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

      {/* Recharge History */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Storico Ricariche</h3>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Importo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Metodo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                </tr>
              </thead>
              <tbody>
                {rechargeHistory.map((recharge) => (
                  <tr key={recharge.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{recharge.date}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">€{recharge.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{recharge.method}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success" icon="✅">
                        Completato
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}