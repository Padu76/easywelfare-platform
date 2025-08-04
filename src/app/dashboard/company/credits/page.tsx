'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

interface FiscalLimits {
  totalLimit: number
  usedAmount: number
  availableAmount: number
  isOverLimit: boolean
  employeeBreakdown: Array<{
    id: string
    name: string
    hireDate: string
    monthsRemaining: number
    personalLimit: number
  }>
}

export default function CompanyCreditsPage() {
  const [companyData, setCompanyData] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [fiscalLimits, setFiscalLimits] = useState<FiscalLimits>({
    totalLimit: 0,
    usedAmount: 0,
    availableAmount: 0,
    isOverLimit: false,
    employeeBreakdown: []
  })
  
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add new employee states
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0] // Today's date
  })

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const calculateFiscalLimits = (employeesList: any[], currentDate = new Date()): FiscalLimits => {
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // 1-12
    
    let totalLimit = 0
    const employeeBreakdown: FiscalLimits['employeeBreakdown'] = []

    employeesList.forEach(emp => {
      if (!emp.is_active) return

      // Parse hire date
      const hireDate = new Date(emp.created_at || emp.hire_date || '2024-01-01')
      const hireYear = hireDate.getFullYear()
      const hireMonth = hireDate.getMonth() + 1

      let monthsInCurrentYear = 12
      
      // If hired this year, calculate remaining months
      if (hireYear === currentYear) {
        monthsInCurrentYear = 12 - hireMonth + 1
      }

      // Proportional limit calculation
      const personalLimit = (258.23 * monthsInCurrentYear) / 12
      totalLimit += personalLimit

      employeeBreakdown.push({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        hireDate: hireDate.toISOString().split('T')[0],
        monthsRemaining: monthsInCurrentYear,
        personalLimit: Math.round(personalLimit * 100) / 100
      })
    })

    const usedAmount = companyData?.used_credits || 0
    const availableAmount = Math.max(0, totalLimit - usedAmount)
    const isOverLimit = usedAmount > totalLimit

    return {
      totalLimit: Math.round(totalLimit * 100) / 100,
      usedAmount,
      availableAmount: Math.round(availableAmount * 100) / 100,
      isOverLimit,
      employeeBreakdown
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load company data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1)

      if (companiesError) throw companiesError

      let company = null
      if (!companies || companies.length === 0) {
        // Create demo company if none exists
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            name: 'TechCorp Verona',
            email: 'admin@techcorp.com',
            phone: '+39 045 123 4567',
            address: 'Via Roma 123, Verona',
            vat_number: 'IT12345678901',
            total_credits: 0, // Start with 0 to enforce fiscal limits
            used_credits: 0,
            employees_count: 0
          }])
          .select()
          .single()

        if (createError) throw createError
        company = newCompany
      } else {
        company = companies[0]
      }

      setCompanyData(company)

      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true })

      if (employeesError) {
        console.warn('Employees query failed:', employeesError)
        setEmployees([])
      } else {
        setEmployees(employeesData || [])
      }

      // Calculate fiscal limits
      const limits = calculateFiscalLimits(employeesData || [])
      setFiscalLimits(limits)

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount <= 0) return

    // FISCAL CONTROL: Check if recharge would exceed limit
    const newTotalCredits = (companyData?.total_credits || 0) + amount
    
    if (newTotalCredits > fiscalLimits.totalLimit) {
      const exceeding = newTotalCredits - fiscalLimits.totalLimit
      const confirmMessage = `🚨 BLOCCO FISCALE!\n\nStai per superare il limite tax-free di €${fiscalLimits.totalLimit.toFixed(2)}.\n\nEccedenza: €${exceeding.toFixed(2)} (sarà tassata al 22%)\nImposta stimata: €${(exceeding * 0.22).toFixed(2)}\n\nVuoi procedere comunque?`
      
      if (!confirm(confirmMessage)) {
        return
      }
    }
    
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update company credits in database
      const { data: updatedCompany, error: updateError } = await supabase
        .from('companies')
        .update({
          total_credits: (companyData?.total_credits || 0) + amount
        })
        .eq('id', companyData.id)
        .select()
        .single()

      if (updateError) throw updateError

      setCompanyData(updatedCompany)
      setRechargeAmount('')
      
      // Recalculate fiscal limits
      const newLimits = calculateFiscalLimits(employees)
      setFiscalLimits(newLimits)
      
      alert(`✅ Ricarica di €${amount.toLocaleString()} completata con successo!`)
      
    } catch (error) {
      console.error('Recharge error:', error)
      alert('❌ Errore nella ricarica. Riprova.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    try {
      setIsProcessing(true)

      const { data: createdEmployee, error: employeeError } = await supabase
        .from('employees')
        .insert([{
          company_id: companyData.id,
          first_name: newEmployee.firstName,
          last_name: newEmployee.lastName,
          email: newEmployee.email,
          phone: newEmployee.phone,
          hire_date: newEmployee.hireDate,
          available_points: 0,
          used_points: 0,
          total_points: 0,
          is_active: true
        }])
        .select()
        .single()

      if (employeeError) throw employeeError

      // Update employees list
      const updatedEmployees = [...employees, createdEmployee]
      setEmployees(updatedEmployees)

      // Recalculate fiscal limits with new employee
      const newLimits = calculateFiscalLimits(updatedEmployees)
      setFiscalLimits(newLimits)

      // Update company employee count
      await supabase
        .from('companies')
        .update({ employees_count: updatedEmployees.filter(emp => emp.is_active).length })
        .eq('id', companyData.id)

      setShowAddEmployee(false)
      setNewEmployee({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0]
      })

      alert(`✅ Dipendente ${newEmployee.firstName} ${newEmployee.lastName} aggiunto con successo!\n\nNuovo limite fiscale: €${newLimits.totalLimit.toFixed(2)}`)

    } catch (error) {
      console.error('Add employee error:', error)
      alert('❌ Errore nell\'aggiunta del dipendente')
    } finally {
      setIsProcessing(false)
    }
  }

  const getSuggestedAmounts = () => {
    const maxSafe = Math.floor(fiscalLimits.availableAmount)
    const quarter = Math.floor(maxSafe / 4)
    const half = Math.floor(maxSafe / 2)
    
    return [quarter, half, maxSafe].filter(amount => amount > 0)
  }

  const getRechargePreview = () => {
    const amount = parseFloat(rechargeAmount) || 0
    const newTotal = (companyData?.total_credits || 0) + amount
    const wouldExceed = newTotal > fiscalLimits.totalLimit
    const excess = wouldExceed ? newTotal - fiscalLimits.totalLimit : 0
    
    return { newTotal, wouldExceed, excess }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Crediti</h1>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Crediti</h1>
          <p className="text-gray-600">Errore nel caricamento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  const activeEmployees = employees.filter(emp => emp.is_active)
  const utilizationPercentage = companyData?.total_credits > 0 
    ? ((companyData?.used_credits || 0) / companyData.total_credits) * 100 
    : 0

  const preview = getRechargePreview()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestione Crediti</h1>
        <p className="text-gray-600">Monitora e ricarica i crediti welfare con controlli fiscali automatici</p>
      </div>

      {/* FISCAL ALERT */}
      {fiscalLimits.isOverLimit && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">ATTENZIONE: Limite Fiscale Superato!</h3>
              <p className="text-red-700 text-sm mt-1">
                Hai €{(fiscalLimits.usedAmount - fiscalLimits.totalLimit).toFixed(2)} oltre il limite tax-free. 
                Eccedenza tassabile al 22%.
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
                <p className={`text-2xl font-bold ${fiscalLimits.isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
                  €{(companyData?.total_credits || 0).toLocaleString()}
                </p>
                {fiscalLimits.isOverLimit && (
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
                <p className="text-sm font-medium text-gray-600">Limite Fiscale</p>
                <p className="text-2xl font-bold text-green-600">€{fiscalLimits.totalLimit.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{activeEmployees.length} dipendenti attivi</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🛡️</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibile Tax-Free</p>
                <p className="text-2xl font-bold text-blue-600">€{fiscalLimits.availableAmount.toLocaleString()}</p>
                <p className="text-xs text-blue-500">Senza tasse aggiuntive</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilizzato</p>
                <p className="text-2xl font-bold text-yellow-600">€{(companyData?.used_credits || 0).toLocaleString()}</p>
                <p className="text-xs text-yellow-500">Anno corrente</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">💰</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recharge and Employee Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharge Section */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">💳 Ricarica Crediti</h3>
            <p className="text-sm text-gray-600">Ricarica con controlli fiscali automatici</p>
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
                max={fiscalLimits.availableAmount}
              />
              
              {/* FISCAL PREVIEW */}
              {rechargeAmount && parseFloat(rechargeAmount) > 0 && (
                <div className={`border rounded-lg p-3 ${preview.wouldExceed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${preview.wouldExceed ? 'text-red-800' : 'text-green-800'}`}>
                    {preview.wouldExceed ? '🚨 ATTENZIONE FISCALE' : '✅ RICARICA SICURA'}
                  </p>
                  <p className={`text-sm ${preview.wouldExceed ? 'text-red-700' : 'text-green-700'}`}>
                    Nuovo totale: €{preview.newTotal.toLocaleString()}
                  </p>
                  {preview.wouldExceed && (
                    <div className="mt-2 text-red-700 text-sm">
                      <p>Eccedenza tassabile: €{preview.excess.toFixed(2)}</p>
                      <p>Imposta stimata (22%): €{(preview.excess * 0.22).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Suggested Amounts */}
              {fiscalLimits.availableAmount > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">💡 Importi Consigliati (Tax-Free):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {getSuggestedAmounts().map((amount) => (
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
              )}
              
              <Button
                onClick={handleRecharge}
                loading={isProcessing}
                disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
                className="w-full"
                size="lg"
                variant={preview.wouldExceed ? 'danger' : 'primary'}
              >
                {isProcessing ? 'Elaborando...' : preview.wouldExceed ? 
                  `⚠️ Ricarica €${rechargeAmount || '0'} (CON TASSE)` : 
                  `✅ Ricarica €${rechargeAmount || '0'} (TAX-FREE)`
                }
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Add Employee Section */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">👥 Aggiungi Dipendente</h3>
            <p className="text-sm text-gray-600">Aumenta il limite fiscale aggiungendo dipendenti</p>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">💡 Calcolo Fiscale Automatico</p>
                <p className="text-blue-700 text-sm mt-1">
                  Ogni nuovo dipendente aumenta il limite tax-free proporzionalmente ai mesi rimanenti nell'anno.
                </p>
              </div>

              <Button
                onClick={() => setShowAddEmployee(true)}
                variant="success"
                className="w-full"
              >
                👤 Aggiungi Nuovo Dipendente
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Employee Breakdown */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">📊 Dettaglio Limiti per Dipendente</h3>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data Assunzione</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Mesi Rimanenti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Limite Personale</th>
                </tr>
              </thead>
              <tbody>
                {fiscalLimits.employeeBreakdown.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(employee.hireDate).toLocaleDateString('it-IT')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={employee.monthsRemaining === 12 ? 'success' : 'warning'}>
                        {employee.monthsRemaining} mesi
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      €{employee.personalLimit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">👤 Aggiungi Dipendente</h2>
              <Button
                variant="secondary"
                onClick={() => setShowAddEmployee(false)}
              >
                ❌ Chiudi
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nome *"
                value={newEmployee.firstName}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Mario"
              />
              
              <Input
                label="Cognome *"
                value={newEmployee.lastName}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Rossi"
              />
              
              <Input
                label="Email *"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                placeholder="mario.rossi@techcorp.com"
              />
              
              <Input
                label="Telefono"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+39 333 123 4567"
              />
              
              <Input
                label="Data Assunzione *"
                type="date"
                value={newEmployee.hireDate}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
              />

              {/* Preview fiscal impact */}
              {newEmployee.hireDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">📈 Impatto Fiscale</p>
                  <p className="text-green-700 text-sm mt-1">
                    Nuovo limite totale: €{(fiscalLimits.totalLimit + calculateFiscalLimits([{
                      id: 'temp',
                      first_name: newEmployee.firstName || 'Nuovo',
                      last_name: newEmployee.lastName || 'Dipendente',
                      is_active: true,
                      hire_date: newEmployee.hireDate,
                      created_at: newEmployee.hireDate
                    }]).totalLimit).toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleAddEmployee}
                  loading={isProcessing}
                  className="flex-1"
                  variant="success"
                >
                  👤 Aggiungi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className={`border rounded-lg p-3 ${fiscalLimits.isOverLimit ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center">
          <span className={`text-lg mr-2 ${fiscalLimits.isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
            {fiscalLimits.isOverLimit ? '🚨' : '✅'}
          </span>
          <p className={`text-sm ${fiscalLimits.isOverLimit ? 'text-red-800' : 'text-green-800'}`}>
            <strong>Status Fiscale:</strong> {fiscalLimits.isOverLimit 
              ? `Eccedenza di €${(fiscalLimits.usedAmount - fiscalLimits.totalLimit).toFixed(2)} oltre il limite tax-free` 
              : `Sei nella zona sicura - €${fiscalLimits.availableAmount.toFixed(2)} disponibili senza tasse`
            }
          </p>
        </div>
      </div>
    </div>
  )
}