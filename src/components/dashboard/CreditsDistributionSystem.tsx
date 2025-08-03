'use client'

import React, { useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'
import Input from '../ui/input'
import Badge from '../ui/badge'
import { Employee } from '@/types'

interface CreditsDistributionProps {
  employees: Employee[]
  totalAvailableCredits: number
  onDistribute?: (distributions: EmployeeDistribution[]) => void
}

interface EmployeeDistribution {
  employeeId: string
  employeeName: string
  currentPoints: number
  newPoints: number
  totalPoints: number
}

export default function CreditsDistributionSystem({ 
  employees, 
  totalAvailableCredits, 
  onDistribute 
}: CreditsDistributionProps) {
  const [distributions, setDistributions] = useState<EmployeeDistribution[]>(
    employees.map(emp => ({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      currentPoints: emp.availablePoints,
      newPoints: 0,
      totalPoints: emp.availablePoints
    }))
  )
  const [isDistributing, setIsDistributing] = useState(false)
  const [distributionMode, setDistributionMode] = useState<'manual' | 'equal' | 'proportional'>('manual')

  const totalNewPoints = distributions.reduce((sum, dist) => sum + dist.newPoints, 0)
  const remainingCredits = totalAvailableCredits - totalNewPoints

  const updateDistribution = (employeeId: string, newPoints: number) => {
    setDistributions(prev => prev.map(dist => 
      dist.employeeId === employeeId 
        ? { 
            ...dist, 
            newPoints: Math.max(0, newPoints),
            totalPoints: dist.currentPoints + Math.max(0, newPoints)
          }
        : dist
    ))
  }

  const distributeEqually = () => {
    const pointsPerEmployee = Math.floor(totalAvailableCredits / employees.length)
    setDistributions(prev => prev.map(dist => ({
      ...dist,
      newPoints: pointsPerEmployee,
      totalPoints: dist.currentPoints + pointsPerEmployee
    })))
  }

  const distributeProportionally = () => {
    const totalCurrentPoints = distributions.reduce((sum, dist) => sum + dist.currentPoints, 0)
    
    if (totalCurrentPoints === 0) {
      distributeEqually()
      return
    }

    setDistributions(prev => prev.map(dist => {
      const proportion = dist.currentPoints / totalCurrentPoints
      const newPoints = Math.floor(totalAvailableCredits * proportion)
      return {
        ...dist,
        newPoints,
        totalPoints: dist.currentPoints + newPoints
      }
    }))
  }

  const clearDistribution = () => {
    setDistributions(prev => prev.map(dist => ({
      ...dist,
      newPoints: 0,
      totalPoints: dist.currentPoints
    })))
  }

  const handleDistribute = async () => {
    if (totalNewPoints === 0) return
    
    setIsDistributing(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (onDistribute) {
        onDistribute(distributions.filter(dist => dist.newPoints > 0))
      }
      
      // Reset after successful distribution
      clearDistribution()
      
    } catch (error) {
      console.error('Error distributing credits:', error)
    } finally {
      setIsDistributing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Distribuzione Punti</h3>
            <Badge variant={remainingCredits >= 0 ? 'success' : 'danger'}>
              Crediti rimanenti: {remainingCredits}
            </Badge>
          </div>
        </Card.Header>

        <Card.Content>
          {/* Distribution Mode Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Modalità Distribuzione
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={distributionMode === 'manual' ? 'primary' : 'secondary'}
                onClick={() => setDistributionMode('manual')}
                size="sm"
              >
                ✏️ Manuale
              </Button>
              <Button
                variant={distributionMode === 'equal' ? 'primary' : 'secondary'}
                onClick={() => {
                  setDistributionMode('equal')
                  distributeEqually()
                }}
                size="sm"
              >
                ⚖️ Uguale per tutti
              </Button>
              <Button
                variant={distributionMode === 'proportional' ? 'primary' : 'secondary'}
                onClick={() => {
                  setDistributionMode('proportional')
                  distributeProportionally()
                }}
                size="sm"
              >
                📊 Proporzionale
              </Button>
              <Button
                variant="secondary"
                onClick={clearDistribution}
                size="sm"
              >
                🗑️ Azzera
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">Crediti Disponibili</p>
              <p className="text-2xl font-bold text-blue-600">{totalAvailableCredits}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900">Punti da Distribuire</p>
              <p className="text-2xl font-bold text-green-600">{totalNewPoints}</p>
            </div>
            <div className={`rounded-lg p-4 ${remainingCredits >= 0 ? 'bg-gray-50' : 'bg-red-50'}`}>
              <p className={`text-sm font-medium ${remainingCredits >= 0 ? 'text-gray-900' : 'text-red-900'}`}>
                Crediti Rimanenti
              </p>
              <p className={`text-2xl font-bold ${remainingCredits >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                {remainingCredits}
              </p>
            </div>
          </div>

          {/* Employee Distribution Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Attuali</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Nuovi Punti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Totale</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((dist) => (
                  <tr key={dist.employeeId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{dist.employeeName}</td>
                    <td className="py-3 px-4 text-gray-600">{dist.currentPoints}</td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        min="0"
                        max={totalAvailableCredits}
                        value={dist.newPoints}
                        onChange={(e) => updateDistribution(dist.employeeId, parseInt(e.target.value) || 0)}
                        className="w-24"
                        disabled={distributionMode !== 'manual'}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-600">{dist.totalPoints}</span>
                      {dist.newPoints > 0 && (
                        <span className="ml-2 text-green-600 text-sm">
                          (+{dist.newPoints})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Messages */}
          {remainingCredits < 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                ⚠️ Hai assegnato più punti di quelli disponibili. Riduci la distribuzione di {Math.abs(remainingCredits)} punti.
              </p>
            </div>
          )}

          {totalNewPoints === 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                💡 Seleziona almeno un dipendente per la distribuzione dei punti.
              </p>
            </div>
          )}
        </Card.Content>

        <Card.Footer>
          <div className="flex gap-3">
            <Button
              onClick={handleDistribute}
              disabled={totalNewPoints === 0 || remainingCredits < 0}
              loading={isDistributing}
              className="flex-1"
              variant="success"
            >
              {isDistributing ? 'Distribuendo...' : `💎 Distribuisci ${totalNewPoints} Punti`}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}