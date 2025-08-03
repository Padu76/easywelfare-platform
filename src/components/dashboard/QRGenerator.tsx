'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode.react'
import Button from '../ui/button'
import Card from '../ui/card'
import { QRCodeData, Service } from '@/types'

interface QRGeneratorProps {
  service: Service
  employeeId: string
  onGenerated?: (qrData: QRCodeData) => void
}

export default function QRGenerator({ service, employeeId, onGenerated }: QRGeneratorProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const generateQRCode = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate API call to generate QR code
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      
      const newQrData: QRCodeData = {
        transactionId,
        employeeId,
        serviceId: service.id,
        pointsToRedeem: service.pointsRequired,
        expiresAt
      }
      
      setQrData(newQrData)
      setTimeLeft(15 * 60) // 15 minutes in seconds
      
      if (onGenerated) {
        onGenerated(newQrData)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && qrData) {
      setQrData(null) // Expire the QR code
    }
  }, [timeLeft, qrData])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const qrValue = qrData ? JSON.stringify(qrData) : ''

  return (
    <Card className="max-w-md mx-auto">
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">Genera QR Code</h3>
        <p className="text-sm text-gray-600">Per prenotare: {service.name}</p>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{service.name}</span>
              <span className="text-blue-600 font-bold">{service.pointsRequired} punti</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
          </div>

          {/* QR Code Display */}
          {qrData ? (
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <QRCode 
                  value={qrValue} 
                  size={200} 
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Mostra questo QR al partner
                </p>
                <p className="text-xs text-gray-600">
                  ID Transazione: {qrData.transactionId.slice(-8)}
                </p>
                
                {/* Countdown Timer */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-orange-600">⏱️</span>
                  <span className={`font-mono font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-orange-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                {timeLeft < 60 && (
                  <p className="text-xs text-red-600">
                    ⚠️ Il QR scadrà tra meno di 1 minuto
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">📱</span>
              </div>
              <p className="text-gray-600 mb-4">
                Genera un QR code per prenotare questo servizio
              </p>
            </div>
          )}
        </div>
      </Card.Content>

      <Card.Footer>
        {!qrData ? (
          <Button 
            onClick={generateQRCode}
            loading={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generando...' : 'Genera QR Code'}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button 
              onClick={generateQRCode}
              loading={isGenerating}
              variant="secondary"
              className="w-full"
            >
              Genera Nuovo QR
            </Button>
            <p className="text-xs text-center text-gray-500">
              Scade automaticamente tra {formatTime(timeLeft)}
            </p>
          </div>
        )}
      </Card.Footer>
    </Card>
  )
}