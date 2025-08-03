'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import CreditsDistributionSystem from '@/components/dashboard/CreditsDistributionSystem'
import { Employee } from '@/types'

export default function CompanyEmployeesPage() {
  const [employees] = useState<Employee[]>([
    {
      id: 'emp_1',
      companyId: 'comp_1',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@company.com',
      phone: '+39 333 123 4567',
      availablePoints: 750,
      usedPoints: 250,
      totalPoints: 1000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'emp_2',
      companyId: 'comp_1',
      firstName: 'Giulia',
      lastName: 'Bianchi',
      email: 'giulia.bianchi@company.com',
      phone: '+39 333 987 6543',
      availablePoints: 450,
      usedPoints: 550,
      totalPoints: 1000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'emp_3',
      companyId: 'comp_1',
      firstName: 'Luca',
      lastName: 'Verdi',
      email: 'luca.verdi@company.com',
      phone: '+39 333 456 7890',
      availablePoints: 200,
      usedPoints: 300,
      totalPoints: 500,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: 'emp_4',
      companyId: 'comp_1',
      firstName: 'Anna',
      lastName: 'Neri',
      email: 'anna.neri@company.com',
      phone: '+39 333 111 2222',
      availablePoints: 900,
      usedPoints: 100,
      totalPoints: 1000,
      isActive: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-05')
    }
  ])

  const [showDistribution, setShowDistribution] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    initialPoints: 0
  })

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && emp.isActive) ||
      (filterStatus === 'inactive' && !emp.isActive)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.isActive).length,
    totalPointsDistributed: employees.reduce((sum, emp) => sum + emp.totalPoints, 0),
    totalPointsUsed: employees.reduce((sum, emp) => sum + emp.usedPoints, 0)
  }

  const handleAddEmployee = async () => {
    // Simulate API call
    console.log('Adding employee:', newEmployee)
    setShowAddEmployee(false)
    setNewEmployee({ firstName: '', lastName: '', email: '', phone: '', initialPoints: 0 })
  }

  const handleDistributePoints = (distributions: any[]) => {
    console.log('Distributing points:', distributions)
    setShowDistribution(false)
  }

  const getUsagePercentage = (emp: Employee) => {
    if (emp.totalPoints === 0) return 0
    return Math.round((emp.usedPoints / emp.totalPoints) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Dipendenti</h1>
          <p className="text-gray-600">Gestisci i dipendenti e la distribuzione dei punti welfare</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowDistribution(true)}
            variant="primary"
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
                <p className="text-sm font-medium text-gray-600">Punti Utilizzati</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPointsUsed.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🎯</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Button 
              variant="secondary"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
            >
              🗑️ Cancella Filtri
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Employees Table */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">
            Lista Dipendenti ({filteredEmployees.length})
          </h3>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
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
                {filteredEmployees.map((employee) => {
                  const usagePercentage = getUsagePercentage(employee)
                  return (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{employee.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{employee.email}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        {employee.availablePoints.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-600">
                        {employee.usedPoints.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${usagePercentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
                            {usagePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={employee.isActive ? 'success' : 'danger'}
                          icon={employee.isActive ? '✅' : '❌'}
                        >
                          {employee.isActive ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            ✏️ Modifica
                          </Button>
                          <Button 
                            variant={employee.isActive ? 'danger' : 'success'}
                            size="sm"
                          >
                            {employee.isActive ? '🚫 Disattiva' : '✅ Attiva'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Distribution Modal */}
      {showDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Distribuisci Punti</h2>
              <Button
                variant="secondary"
                onClick={() => setShowDistribution(false)}
              >
                ❌ Chiudi
              </Button>
            </div>
            <CreditsDistributionSystem
              employees={employees.filter(emp => emp.isActive)}
              totalAvailableCredits={5000} // This would come from company data
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
              <h2 className="text-xl font-bold text-gray-900">Aggiungi Dipendente</h2>
              <Button
                variant="secondary"
                onClick={() => setShowAddEmployee(false)}
              >
                ❌ Chiudi
              </Button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nome"
                value={newEmployee.firstName}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Mario"
              />
              
              <Input
                label="Cognome"
                value={newEmployee.lastName}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Rossi"
              />
              
              <Input
                label="Email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                placeholder="mario.rossi@company.com"
              />
              
              <Input
                label="Telefono"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+39 333 123 4567"
              />
              
              <Input
                label="Punti Iniziali"
                type="number"
                value={newEmployee.initialPoints}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, initialPoints: parseInt(e.target.value) || 0 }))}
                placeholder="1000"
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
                  className="flex-1"
                >
                  👤 Aggiungi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}