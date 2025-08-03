'use client'

import React, { useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'
import Badge from '../ui/badge'
import { QRCodeData, Transaction, TransactionStatus } from '@/types'

interface QRScannerProps {
  partnerId: string
  onScanSuccess?: (transaction: Transaction) => void
  onScanError?: (error: string) => void
}

interface ScannedData extends QRCodeData {
  employeeName?: string
  serviceName?: string
}

export default function QRScanner({ partnerId, onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  // Simulate QR scanning (in real app, this would use camera)
  const simulateScan = () => {
    setIsScanning(true)
    setScanError(null)
    
    // Simulate scan delay
    setTimeout(() => {
      // Mock scanned QR data
      const mockQRData: ScannedData = {
        transactionId: `txn_${Date.now()}_mock`,
        employeeId: 'emp_123',
        serviceId: 'srv_456',
        pointsToRedeem: 200,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        employeeName: 'Mario Rossi',
        serviceName: 'Personal Training'
      }
      
      setScannedData(mockQRData)
      setIsScanning(false)
    }, 2000)
  }

  const validateTransaction = async () => {
    if (!scannedData) return
    
    setIsProcessing(true)
    
    try {
      // Check if QR is expired
      if (new Date() > scannedData.expiresAt) {
        setScanError('QR Code scaduto. Chiedi al cliente di generarne uno nuovo.')
        setIsProcessing(false)
        return
      }
      
      // Simulate API call to validate and process transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const completedTransaction: Transaction = {
        id: scannedData.transactionId,
        employeeId: scannedData.employeeId,
        serviceId: scannedData.serviceId,
        partnerId: partnerId,
        companyId: 'comp_123', // Would come from employee data
        pointsUsed: scannedData.pointsToRedeem,
        status: TransactionStatus.COMPLETED,
        qrCode: JSON.stringify(scannedData),
        redeemedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      if (onScanSuccess) {
        onScanSuccess(completedTransaction)
      }
      
      // Reset state after successful transaction
      setTimeout(() => {
        setScannedData(null)
        setScanError(null)
      }, 3000)
      
    } catch (error) {
      const errorMessage = 'Errore nel processare la transazione. Riprova.'
      setScanError(errorMessage)
      if (onScanError) {
        onScanError(errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const rejectTransaction = () => {
    setScannedData(null)
    setScanError(null)
  }

  const isExpired = scannedData && new Date() > scannedData.expiresAt

  return (
    <Card className="max-w-md mx-auto">
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">Scanner QR Code</h3>
        <p className="text-sm text-gray-600">Scansiona il QR del cliente per validare la transazione</p>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {/* Scanner Interface */}
          {!scannedData && (
            <div className="text-center py-8">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4">
                {isScanning ? (
                  <div className="animate-pulse text-4xl">📱</div>
                ) : (
                  <span className="text-4xl text-gray-400">📷</span>
                )}
              </div>
              
              {isScanning ? (
                <div className="space-y-2">
                  <p className="text-blue-600 font-medium">Scansionando...</p>
                  <div className="w-8 h-1 bg-blue-600 rounded animate-pulse mx-auto"></div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Tocca il pulsante per avviare la scansione
                </p>
              )}
            </div>
          )}

          {/* Scanned Data Display */}
          {scannedData && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">QR Scansionato</h4>
                  {isExpired ? (
                    <Badge variant="danger" icon="⚠️">Scaduto</Badge>
                  ) : (
                    <Badge variant="success" icon="✅">Valido</Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{scannedData.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servizio:</span>
                    <span className="font-medium">{scannedData.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punti:</span>
                    <span className="font-bold text-blue-600">{scannedData.pointsToRedeem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Transazione:</span>
                    <span className="font-mono text-xs">{scannedData.transactionId.slice(-8)}</span>
                  </div>
                </div>
              </div>

              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">
                    ⚠️ Questo QR code è scaduto. Chiedi al cliente di generarne uno nuovo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">❌ {scanError}</p>
            </div>
          )}
        </div>
      </Card.Content>

      <Card.Footer>
        {!scannedData ? (
          <Button 
            onClick={simulateScan}
            loading={isScanning}
            className="w-full"
            size="lg"
          >
            {isScanning ? 'Scansionando...' : '📷 Avvia Scanner'}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={rejectTransaction}
              variant="secondary"
              disabled={isProcessing}
            >
              ❌ Rifiuta
            </Button>
            <Button 
              onClick={validateTransaction}
              loading={isProcessing}
              disabled={!!isExpired}
              variant={isExpired ? 'danger' : 'success'}
            >
              {isProcessing ? 'Elaborando...' : '✅ Conferma'}
            </Button>
          </div>
        )}
        
        {scannedData && (
          <Button 
            onClick={() => {
              setScannedData(null)
              setScanError(null)
            }}
            variant="secondary"
            size="sm"
            className="w-full mt-2"
          >
            🔄 Scansiona Nuovo QR
          </Button>
        )}
      </Card.Footer>
    </Card>
  )
}