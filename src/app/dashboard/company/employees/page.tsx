'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import CreditsDistributionSystem from '@/components/dashboard/CreditsDistributionSystem'

interface Employee {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  hire_date?: string
  available_points: number
  used_points: number
  total_points: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CompanyData {
  id: string
  name: string
  total_credits: number
  used_credits: number
  employees_count: number
}

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalPointsDistributed: number
  totalPointsUsed: number
  availablePointsSum: number
}

export default function CompanyEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPointsDistributed: 0,
    totalPointsUsed: 0,
    availablePointsSum: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [showDistribution, setShowDistribution] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showEditEmployee, setShowEditEmployee] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'usage' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Form state
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    initialPoints: 0
  })

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
            total_credits: 3000,
            used_credits: 850,
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
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (employeesError) throw employeesError

      const employeesList = employeesData || []
      setEmployees(employeesList)

      // Calculate stats
      const totalEmployees = employeesList.length
      const activeEmployees = employeesList.filter(emp => emp.is_active).length
      const totalPointsDistributed = employeesList.reduce((sum, emp) => sum + emp.total_points, 0)
      const totalPointsUsed = employeesList.reduce((sum, emp) => sum + emp.used_points, 0)
      const availablePointsSum = employeesList.reduce((sum, emp) => sum + emp.available_points, 0)

      setStats({
        totalEmployees,
        activeEmployees,
        totalPointsDistributed,
        totalPointsUsed,
        availablePointsSum
      })

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    if (!companyData) {
      alert('Errore: dati azienda non trovati')
      return
    }

    try {
      setIsProcessing(true)

      // Check if email already exists
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', newEmployee.email)
        .single()

      if (existingEmployee) {
        alert('❌ Email già esistente. Usa un&apos;email diversa.')
        return
      }

      const { data: createdEmployee, error: employeeError } = await supabase
        .from('employees')
        .insert([{
          company_id: companyData.id,
          first_name: newEmployee.firstName,
          last_name: newEmployee.lastName,
          email: newEmployee.email,
          phone: newEmployee.phone,
          hire_date: newEmployee.hireDate,
          available_points: newEmployee.initialPoints,
          used_points: 0,
          total_points: newEmployee.initialPoints,
          is_active: true
        }])
        .select()
        .single()

      if (employeeError) throw employeeError

      // Update local state
      setEmployees(prev => [createdEmployee, ...prev])
      
      // Update company employee count
      await supabase
        .from('companies')
        .update({ 
          employees_count: employees.length + 1,
          used_credits: (companyData.used_credits || 0) + newEmployee.initialPoints
        })
        .eq('id', companyData.id)

      // Reset form and close modal
      setNewEmployee({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        initialPoints: 0
      })
      setShowAddEmployee(false)

      // Reload data to update stats
      await loadData()

      alert(`✅ Dipendente ${newEmployee.firstName} ${newEmployee.lastName} aggiunto con successo!`)

    } catch (error) {
      console.error('Add employee error:', error)
      alert('❌ Errore nell&apos;aggiunta del dipendente')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditEmployee = async () => {
    if (!editingEmployee || !editingEmployee.first_name || !editingEmployee.last_name || !editingEmployee.email) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    try {
      setIsProcessing(true)

      const { data: updatedEmployee, error: updateError } = await supabase
        .from('employees')
        .update({
          first_name: editingEmployee.first_name,
          last_name: editingEmployee.last_name,
          email: editingEmployee.email,
          phone: editingEmployee.phone,
          hire_date: editingEmployee.hire_date,
          is_active: editingEmployee.is_active
        })
        .eq('id', editingEmployee.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? updatedEmployee : emp
      ))

      setShowEditEmployee(false)
      setEditingEmployee(null)

      // Reload data to update stats
      await loadData()

      alert('✅ Dipendente aggiornato con successo!')

    } catch (error) {
      console.error('Update employee error:', error)
      alert('❌ Errore nell&apos;aggiornamento del dipendente')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`⚠️ Sei sicuro di voler eliminare ${employeeName}?\n\nQuesta azione non può essere annullata.`)) {
      return
    }

    try {
      setIsProcessing(true)

      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)

      if (deleteError) throw deleteError

      // Update local state
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))

      // Update company employee count
      if (companyData) {
        await supabase
          .from('companies')
          .update({ employees_count: Math.max(0, employees.length - 1) })
          .eq('id', companyData.id)
      }

      // Reload data to update stats
      await loadData()

      alert(`✅ Dipendente ${employeeName} eliminato con successo!`)

    } catch (error) {
      console.error('Delete employee error:', error)
      alert('❌ Errore nell&apos;eliminazione del dipendente')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleActive = async (employee: Employee) => {
    try {
      const newStatus = !employee.is_active
      
      const { error: updateError } = await supabase
        .from('employees')
        .update({ is_active: newStatus })
        .eq('id', employee.id)

      if (updateError) throw updateError

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? { ...emp, is_active: newStatus } : emp
      ))

      // Reload data to update stats
      await loadData()

      alert(`✅ Dipendente ${newStatus ? 'attivato' : 'disattivato'} con successo!`)

    } catch (error) {
      console.error('Toggle active error:', error)
      alert('❌ Errore nel cambio stato dipendente')
    }
  }

  const handleDistributePoints = async (distributions: Array<{ employeeId: string; points: number }>) => {
    if (!companyData) return

    try {
      setIsProcessing(true)

      const totalPointsToDistribute = distributions.reduce((sum, dist) => sum + dist.points, 0)

      // Check if company has enough credits
      const availableCredits = companyData.total_credits - companyData.used_credits
      if (totalPointsToDistribute > availableCredits) {
        alert(`❌ Crediti insufficienti!\n\nDisponibili: €${availableCredits}\nRichiesti: €${totalPointsToDistribute}`)
        return
      }

      // Update each employee
      for (const distribution of distributions) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({
            available_points: supabase.raw(`available_points + ${distribution.points}`),
            total_points: supabase.raw(`total_points + ${distribution.points}`)
          })
          .eq('id', distribution.employeeId)

        if (updateError) throw updateError
      }

      // Update company used credits
      await supabase
        .from('companies')
        .update({
          used_credits: companyData.used_credits + totalPointsToDistribute
        })
        .eq('id', companyData.id)

      setShowDistribution(false)
      await loadData()

      alert(`✅ Distribuiti ${totalPointsToDistribute} punti a ${distributions.length} dipendenti!`)

    } catch (error) {
      console.error('Distribution error:', error)
      alert('❌ Errore nella distribuzione punti')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedEmployees.length === 0) {
      alert('Seleziona almeno un dipendente')
      return
    }

    const actionName = action === 'activate' ? 'attivare' : action === 'deactivate' ? 'disattivare' : 'eliminare'
    if (!confirm(`⚠️ Sei sicuro di voler ${actionName} ${selectedEmployees.length} dipendenti?`)) {
      return
    }

    try {
      setIsProcessing(true)

      if (action === 'delete') {
        const { error: deleteError } = await supabase
          .from('employees')
          .delete()
          .in('id', selectedEmployees)

        if (deleteError) throw deleteError
      } else {
        const { error: updateError } = await supabase
          .from('employees')
          .update({ is_active: action === 'activate' })
          .in('id', selectedEmployees)

        if (updateError) throw updateError
      }

      setSelectedEmployees([])
      await loadData()

      alert(`✅ Operazione completata su ${selectedEmployees.length} dipendenti!`)

    } catch (error) {
      console.error('Bulk action error:', error)
      alert('❌ Errore nell&apos;operazione bulk')
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter and sort employees
  const filteredAndSortedEmployees = employees
    .filter(emp => {
      const matchesSearch = 
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && emp.is_active) ||
        (filterStatus === 'inactive' && !emp.is_active)
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase()
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase()
          break
        case 'points':
          aVal = a.available_points
          bVal = b.available_points
          break
        case 'usage':
          aVal = a.total_points > 0 ? (a.used_points / a.total_points) : 0
          bVal = b.total_points > 0 ? (b.used_points / b.total_points) : 0
          break
        case 'date':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        default:
          aVal = a.first_name
          bVal = b.first_name
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  const getUsagePercentage = (emp: Employee) => {
    if (emp.total_points === 0) return 0
    return Math.round((emp.used_points / emp.total_points) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Dipendenti</h1>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-2xl font-bold text-gray-900">Gestione Dipendenti</h1>
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Dipendenti</h1>
          <p className="text-gray-600">Gestisci i dipendenti e distribuzione punti per {companyData?.name}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowDistribution(true)}
            variant="primary"
            disabled={stats.activeEmployees === 0}
          >
            💎 Distribuisci Punti
          </Button>
          <Button
            onClick={() => setShowAddEmployee(true)}
            variant="success"
          >
            👤 Aggiungi Dipendente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dipendenti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
                <p className="text-xs text-green-500">
                  {stats.totalEmployees > 0 ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}% del totale
                </p>
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
                <p className="text-sm font-medium text-gray-600">Punti Distribuiti</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPointsDistributed.toLocaleString()}</p>
                <p className="text-xs text-purple-500">Totale assegnato</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">💎</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punti Disponibili</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.availablePointsSum.toLocaleString()}</p>
                <p className="text-xs text-yellow-500">Pronti per l&apos;uso</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🎯</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cerca dipendenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<span>🔍</span>}
            />
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Solo attivi</option>
              <option value="inactive">Solo inattivi</option>
            </select>

            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy as any)
                setSortOrder(newSortOrder as 'asc' | 'desc')
              }}
            >
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="points-desc">Più punti</option>
              <option value="points-asc">Meno punti</option>
              <option value="usage-desc">Più utilizzo</option>
              <option value="usage-asc">Meno utilizzo</option>
              <option value="date-desc">Più recenti</option>
              <option value="date-asc">Più vecchi</option>
            </select>

            <Button 
              variant="secondary"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setSortBy('name')
                setSortOrder('asc')
                setSelectedEmployees([])
              }}
            >
              🗑️ Cancella Filtri
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedEmployees.length} dipendenti selezionati
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    loading={isProcessing}
                  >
                    ✅ Attiva
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                    loading={isProcessing}
                  >
                    🚫 Disattiva
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    loading={isProcessing}
                  >
                    🗑️ Elimina
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Employees Table */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">
            Lista Dipendenti ({filteredAndSortedEmployees.length})
          </h3>
        </Card.Header>
        <Card.Content>
          {filteredAndSortedEmployees.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-4">👥</span>
              <p className="text-gray-500 text-lg">Nessun dipendente trovato</p>
              <p className="text-gray-400 text-sm mt-2">
                {employees.length === 0 
                  ? 'Aggiungi il primo dipendente per iniziare' 
                  : 'Prova a modificare i filtri di ricerca'
                }
              </p>
              {employees.length === 0 && (
                <Button
                  onClick={() => setShowAddEmployee(true)}
                  variant="primary"
                  className="mt-4"
                >
                  👤 Aggiungi Primo Dipendente
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(filteredAndSortedEmployees.map(emp => emp.id))
                          } else {
                            setSelectedEmployees([])
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Disponibili</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Utilizzati</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilizzo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedEmployees.map((employee) => {
                    const usagePercentage = getUsagePercentage(employee)
                    const isSelected = selectedEmployees.includes(employee.id)
                    
                    return (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees(prev => [...prev, employee.id])
                              } else {
                                setSelectedEmployees(prev => prev.filter(id => id !== employee.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{employee.phone || 'N/A'}</p>
                            {employee.hire_date && (
                              <p className="text-xs text-gray-500">
                                Assunto: {new Date(employee.hire_date).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{employee.email}</td>
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          {employee.available_points.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-600">
                          {employee.used_points.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
                              {usagePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={employee.is_active ? 'success' : 'danger'}
                          >
                            {employee.is_active ? '✅ Attivo' : '❌ Inattivo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                setEditingEmployee(employee)
                                setShowEditEmployee(true)
                              }}
                            >
                              ✏️ Modifica
                            </Button>
                            <Button 
                              variant={employee.is_active ? 'secondary' : 'success'}
                              size="sm"
                              onClick={() => handleToggleActive(employee)}
                            >
                              {employee.is_active ? '🚫 Disattiva' : '✅ Attiva'}
                            </Button>
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`)}
                            >
                              🗑️ Elimina
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Distribution Modal */}
      {showDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">💎 Distribuisci Punti</h2>
              <Button
                variant="secondary"
                onClick={() => setShowDistribution(false)}
              >
                ❌ Chiudi
              </Button>
            </div>
            <CreditsDistributionSystem
              employees={employees.filter(emp => emp.is_active).map(emp => ({
                id: emp.id,
                companyId: emp.company_id,
                firstName: emp.first_name,
                lastName: emp.last_name,
                email: emp.email,
                phone: emp.phone,
                availablePoints: emp.available_points,
                usedPoints: emp.used_points,
                totalPoints: emp.total_points,
                isActive: emp.is_active,
                createdAt: new Date(emp.created_at),
                updatedAt: new Date(emp.updated_at)
              }))}
              totalAvailableCredits={companyData ? companyData.total_credits - companyData.used_credits : 0}
              onDistribute={handleDistributePoints}
            />
          </div>
        </div>
      )}

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
                label="Data Assunzione"
                type="date"
                value={newEmployee.hireDate}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
              />
              
              <Input
                label="Punti Iniziali"
                type="number"
                value={newEmployee.initialPoints}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, initialPoints: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
              
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
                >
                  👤 Aggiungi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">✏️ Modifica Dipendente</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditEmployee(false)
                  setEditingEmployee(null)
                }}
              >
                ❌ Chiudi
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nome *"
                value={editingEmployee.first_name}
                onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                placeholder="Mario"
              />
              
              <Input
                label="Cognome *"
                value={editingEmployee.last_name}
                onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                placeholder="Rossi"
              />
              
              <Input
                label="Email *"
                type="email"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, email: e.target.value } : null)}
                placeholder="mario.rossi@techcorp.com"
              />
              
              <Input
                label="Telefono"
                value={editingEmployee.phone || ''}
                onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="+39 333 123 4567"
              />
              
              <Input
                label="Data Assunzione"
                type="date"
                value={editingEmployee.hire_date || ''}
                onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, hire_date: e.target.value } : null)}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingEmployee.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditingEmployee(prev => prev ? { ...prev, is_active: e.target.value === 'active' } : null)}
                >
                  <option value="active">✅ Attivo</option>
                  <option value="inactive">❌ Inattivo</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditEmployee(false)
                    setEditingEmployee(null)
                  }}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleEditEmployee}
                  loading={isProcessing}
                  className="flex-1"
                >
                  ✏️ Salva Modifiche
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}