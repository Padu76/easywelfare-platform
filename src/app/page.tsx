'use client'

import { useState, useEffect } from 'react'
// Removed Next.js Link import for compatibility

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [roiData, setRoiData] = useState({ employees: 50, monthlyBudget: 500 })
  const [isVisible, setIsVisible] = useState(false)
  const [showFiscalWarning, setShowFiscalWarning] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      quote: "EasyWelfare ha rivoluzionato il nostro approccio al welfare aziendale. I dipendenti sono più felici e noi risparmiamo il 30% sui costi.",
      author: "Marco Bianchi",
      role: "HR Director",
      company: "TechCorp Verona",
      rating: 5
    },
    {
      quote: "Finalmente posso gestire i miei servizi wellness senza costi fissi. Guadagno di più e i clienti sono soddisfatti.",
      author: "Sara Rossi",
      role: "Proprietaria",
      company: "Wellness Center",
      rating: 5
    },
    {
      quote: "Utilizzo tutti i miei punti welfare ogni mese. Personal trainer, massaggi, nutrizionista... tutto incluso!",
      author: "Luca Verdi",
      role: "Dipendente",
      company: "Innovation SRL",
      rating: 5
    }
  ]

  const calculateROI = () => {
    const annualBudget = roiData.monthlyBudget * 12
    const maxLegalAmount = roiData.employees * 774.69 // Limite fiscale per dipendente
    const actualBudget = Math.min(annualBudget, maxLegalAmount)
    
    // Calcoli fiscali dettagliati
    const irpefSavings = actualBudget * 0.22 // 22% detrazione IRPEF
    const inpsSavings = actualBudget * 0.10 // ~10% risparmio contributi
    const totalTaxSavings = irpefSavings + inpsSavings
    
    const employeeSatisfaction = roiData.employees * 50 // €50 per dipendente di valore percepito
    const totalROI = totalTaxSavings + employeeSatisfaction
    
    const isOverLimit = annualBudget > maxLegalAmount
    
    return { 
      annualBudget, 
      actualBudget,
      maxLegalAmount,
      irpefSavings, 
      inpsSavings,
      totalTaxSavings,
      employeeSatisfaction, 
      totalROI,
      isOverLimit
    }
  }

  const roi = calculateROI()

  useEffect(() => {
    setShowFiscalWarning(roi.isOverLimit)
  }, [roi.isOverLimit])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EW</span>
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                EasyWelfare
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#come-funziona" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Come Funziona
              </a>
              <a href="#calcolatore" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Calcola Risparmio
              </a>
              <a href="#prezzi" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Prezzi
              </a>
              <a href="#testimonial" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Testimonianze
              </a>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <a href="/demo" className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Prova Demo
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-green-900' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welfare Aziendale
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent block">
                Rivoluzionario
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              La prima piattaforma italiana che semplifica il welfare aziendale per aziende, dipendenti e partner. 
              <strong className="text-blue-600"> Zero costi fissi, massimi vantaggi fiscali.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href="/demo" className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                🚀 Inizia Gratis Ora
              </a>
              <a href="#come-funziona" className={`px-8 py-4 rounded-full text-lg font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                📖 Scopri Come Funziona
              </a>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md ${darkMode ? 'bg-white/10' : 'bg-white/80'} hover:scale-105 transition-transform duration-300`}>
                <div className="text-3xl font-bold text-blue-600 mb-2">32%</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risparmio Fiscale Totale</div>
              </div>
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md ${darkMode ? 'bg-white/10' : 'bg-white/80'} hover:scale-105 transition-transform duration-300`}>
                <div className="text-3xl font-bold text-green-600 mb-2">0€</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Costi di Setup per Partner</div>
              </div>
              <div className={`text-center p-6 rounded-2xl backdrop-blur-md ${darkMode ? 'bg-white/10' : 'bg-white/80'} hover:scale-105 transition-transform duration-300`}>
                <div className="text-3xl font-bold text-purple-600 mb-2">5min</div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Setup Completo Piattaforma</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Perché Scegliere EasyWelfare?
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Una soluzione pensata per tutti: aziende, dipendenti e partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Companies */}
            <div className={`p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
              darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'
            }`}>
              <div className="text-4xl mb-4">🏢</div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Per le Aziende
              </h3>
              <ul className={`space-y-3 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Risparmio fiscale del 32% garantito
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Setup in 5 minuti, zero burocrazia
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Dashboard completa con analytics
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Fatturazione automatica semplificata
                </li>
              </ul>
              <a href="/dashboard/company" className="block text-center bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors">
                Inizia come Azienda
              </a>
            </div>

            {/* For Employees */}
            <div className={`p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
              darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'
            }`}>
              <div className="text-4xl mb-4">👤</div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Per i Dipendenti
              </h3>
              <ul className={`space-y-3 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Servizi premium scontati fino al 30%
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  QR code semplice e veloce
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Catalogo sempre aggiornato
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Storico completo e trasparente
                </li>
              </ul>
              <a href="/dashboard/employee" className="block text-center bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 transition-colors">
                Esplora come Dipendente
              </a>
            </div>

            {/* For Partners */}
            <div className={`p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
              darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'
            }`}>
              <div className="text-4xl mb-4">🏪</div>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Per i Partner
              </h3>
              <ul className={`space-y-3 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Zero costi di ingresso nel circuito
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Paghi solo il 15% sulle vendite
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Nuovi clienti automaticamente
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Pagamenti puntuali garantiti
                </li>
              </ul>
              <a href="/dashboard/partner" className="block text-center bg-purple-600 text-white py-3 px-6 rounded-full hover:bg-purple-700 transition-colors">
                Diventa Partner
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="come-funziona" className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Come Funziona in 3 Semplici Passi
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Dal caricamento crediti alla fruizione del servizio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 group-hover:scale-110 ${
                darkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>
                1
              </div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                💳 Azienda Carica Crediti
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                L&apos;azienda carica i crediti welfare e li distribuisce ai dipendenti. 
                Tutto con vantaggi fiscali automatici.
              </p>
            </div>

            <div className="text-center group">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 group-hover:scale-110 ${
                darkMode ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-600'
              }`}>
                2
              </div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🛍️ Dipendente Sceglie Servizio
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Il dipendente naviga il catalogo, sceglie il servizio preferito 
                e genera un QR code in pochi secondi.
              </p>
            </div>

            <div className="text-center group">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 group-hover:scale-110 ${
                darkMode ? 'bg-purple-800 text-purple-300' : 'bg-purple-100 text-purple-600'
              }`}>
                3
              </div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📱 Partner Scansiona QR
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Il partner scansiona il QR, eroga il servizio e riceve 
                il pagamento automaticamente a fine mese.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a href="/demo" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              🎯 Prova il Flusso Completo
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced ROI Calculator */}
      <section id="calcolatore" className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💰 Calcola il Tuo Risparmio Fiscale
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Scopri esattamente quanto risparmi con i vantaggi fiscali del welfare aziendale
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Section */}
            <div className={`p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🧮 Calcolatore Risparmio
              </h3>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Numero Dipendenti
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Min 5</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={roiData.employees}
                    onChange={(e) => setRoiData(prev => ({ ...prev, employees: Math.max(5, parseInt(e.target.value) || 5) }))}
                    className={`w-full p-4 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="es. 50"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Budget Mensile per Dipendente (€)
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Max €64,56</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={roiData.monthlyBudget}
                    onChange={(e) => setRoiData(prev => ({ ...prev, monthlyBudget: Math.min(65, Math.max(10, parseInt(e.target.value) || 10)) }))}
                    className={`w-full p-4 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="es. 50"
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Limite fiscale: €774,69 annui per dipendente
                  </p>
                </div>
              </div>

              {/* Warning se supera limiti */}
              {showFiscalWarning && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-amber-500 text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="text-amber-800 font-semibold">Attenzione: Limite Fiscale Superato</h4>
                      <p className="text-amber-700 text-sm mt-1">
                        Stai superando il limite di €{roi.maxLegalAmount.toLocaleString()} deducibili. 
                        Il calcolo mostra solo la parte deducibile.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-blue-600 mb-2">€{roi.actualBudget.toLocaleString()}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Budget Deducibile</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-green-600 mb-2">€{roi.irpefSavings.toLocaleString()}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risparmio IRPEF (22%)</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-purple-600 mb-2">€{roi.inpsSavings.toLocaleString()}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risparmio INPS (10%)</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-orange-600 mb-2">€{roi.totalTaxSavings.toLocaleString()}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risparmio Totale</div>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  💡 Con EasyWelfare risparmi <strong className="text-green-600">€{roi.totalTaxSavings.toLocaleString()}</strong> all&apos;anno in tasse!
                </p>
                <a href="/dashboard/company" className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Inizia a Risparmiare Ora
                </a>
              </div>
            </div>

            {/* Information Section */}
            <div className="space-y-8">
              {/* How Tax Savings Work */}
              <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 Come Funziona il Risparmio Fiscale
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detrazione IRPEF (22%)</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Il welfare aziendale è completamente deducibile dalle tasse aziendali
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Risparmio Contributi INPS (~10%)</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Non paghi contributi previdenziali sui benefit welfare
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Zero Tasse per i Dipendenti</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        I dipendenti non pagano IRPEF sui servizi welfare ricevuti
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements for Welfare */}
              <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 Requisiti per Accedere al Welfare
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-lg">✅</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Minimo 5 Dipendenti</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Requisito base per attivare il piano welfare aziendale
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-lg">✅</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Limite €774,69 per Dipendente/Anno</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Massimo deducibile secondo la normativa fiscale italiana
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-lg">✅</span>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Servizi Pre-Approvati</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Solo servizi welfare-compliant (fitness, salute, formazione)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Setup Guide */}
              <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🚀 Come Iniziare (5 minuti)
                </h3>
                <div className="space-y-3">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>1.</strong> Registra la tua azienda su EasyWelfare
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>2.</strong> Carica i dati dei dipendenti (CSV o manuale)
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>3.</strong> Carica il budget welfare e distribuisci i punti
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>4.</strong> I dipendenti ricevono accesso immediato
                  </div>
                </div>
                <div className="mt-4">
                  <a href="/demo" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    Prova la Demo Completa →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonial" className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ⭐ Cosa Dicono i Nostri Clienti
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Storie di successo reali da tutta Italia
            </p>
          </div>

          <div className={`p-8 rounded-2xl shadow-xl text-center transition-all duration-500 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-2xl">⭐</span>
              ))}
            </div>
            
            <blockquote className={`text-xl mb-6 italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              &quot;{testimonials[currentTestimonial].quote}&quot;
            </blockquote>
            
            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {testimonials[currentTestimonial].author}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {testimonials[currentTestimonial].role} presso {testimonials[currentTestimonial].company}
            </div>

            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prezzi" className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💳 Prezzi Trasparenti
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Paghi solo per quello che usi. Zero costi nascosti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Starter
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">Gratis</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/mese</span>
                </div>
                <ul className={`space-y-3 mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Fino a 20 dipendenti
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Dashboard base
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    15% commissione sui servizi
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Supporto email
                  </li>
                </ul>
                <a href="/dashboard/company" className="block text-center bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors">
                  Inizia Gratis
                </a>
              </div>
            </div>

            {/* Professional Plan */}
            <div className={`p-8 rounded-2xl border-2 relative transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gradient-to-br from-blue-900 to-green-900 border-blue-500' : 'bg-gradient-to-br from-blue-50 to-green-50 border-blue-500'
            }`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Più Popolare
                </span>
              </div>
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Professional
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-green-600">€49</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/mese</span>
                </div>
                <ul className={`space-y-3 mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Fino a 100 dipendenti
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Dashboard avanzata + Analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    12% commissione sui servizi
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Supporto prioritario
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    AI fiscale inclusa
                  </li>
                </ul>
                <a href="/dashboard/company" className="block text-center bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300">
                  Scegli Professional
                </a>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enterprise
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-purple-600">Custom</span>
                </div>
                <ul className={`space-y-3 mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Dipendenti illimitati
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Dashboard personalizzata
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    10% commissione sui servizi
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Account manager dedicato
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Integrazioni custom
                  </li>
                </ul>
                <a href="mailto:sales@easywelfare.it" className="block text-center bg-purple-600 text-white py-3 px-6 rounded-full hover:bg-purple-700 transition-colors">
                  Contattaci
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-green-900' : 'bg-gradient-to-r from-blue-600 to-green-500'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto a Rivoluzionare il Tuo Welfare?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Unisciti alle centinaia di aziende che hanno già scelto EasyWelfare. 
            Setup gratuito in 5 minuti, risultati immediati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/demo" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              🚀 Prova Demo Gratuita
            </a>
            <a href="mailto:info@easywelfare.it" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              📞 Prenota Consulenza
            </a>
          </div>
          
          <div className="mt-12 text-blue-100 text-sm">
            💡 <strong>Garanzia 30 giorni</strong> - Non soddisfatto? Rimborso completo senza domande
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EW</span>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>EasyWelfare</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                La piattaforma italiana che semplifica il welfare aziendale per tutti.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prodotto</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="/demo" className="hover:text-blue-600">Demo</a></li>
                <li><a href="#prezzi" className="hover:text-blue-600">Prezzi</a></li>
                <li><a href="#come-funziona" className="hover:text-blue-600">Come Funziona</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Azienda</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-600">Chi Siamo</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Carriere</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Supporto</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="mailto:support@easywelfare.it" className="hover:text-blue-600">Contattaci</a></li>
                <li><a href="#" className="hover:text-blue-600">FAQ</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t text-center text-sm ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
            <p>&copy; 2024 EasyWelfare. Tutti i diritti riservati. Made with ❤️ in Verona, Italy.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}