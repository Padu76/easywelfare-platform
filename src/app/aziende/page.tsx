'use client'

import { useState, useEffect } from 'react'

export default function AziendePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [employees, setEmployees] = useState(50)
  const [monthlyBudget, setMonthlyBudget] = useState(50)
  const [selectedExample, setSelectedExample] = useState('media')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Esempi predefiniti
  const examples = {
    piccola: { employees: 10, monthlyBudget: 60, label: 'Piccola Azienda (10 dipendenti)' },
    media: { employees: 50, monthlyBudget: 50, label: 'Media Azienda (50 dipendenti)' },
    grande: { employees: 200, monthlyBudget: 45, label: 'Grande Azienda (200 dipendenti)' }
  }

  const handleExampleChange = (example: keyof typeof examples) => {
    setSelectedExample(example)
    setEmployees(examples[example].employees)
    setMonthlyBudget(examples[example].monthlyBudget)
  }

  // Calcoli avanzati
  const calculateAdvancedROI = () => {
    const maxBudgetPerEmployee = 774.69
    const maxMonthlyPerEmployee = maxBudgetPerEmployee / 12
    const actualMonthlyBudget = Math.min(monthlyBudget, maxMonthlyPerEmployee)
    const annualBudgetPerEmployee = actualMonthlyBudget * 12
    const totalAnnualBudget = annualBudgetPerEmployee * employees
    
    // Calcoli fiscali dettagliati
    const irpefSavings = totalAnnualBudget * 0.22 // 22% IRPEF
    const inpsSavings = totalAnnualBudget * 0.10 // ~10% INPS
    const totalTaxSavings = irpefSavings + inpsSavings
    const netCost = totalAnnualBudget - totalTaxSavings
    const savingsPercentage = ((totalTaxSavings / totalAnnualBudget) * 100)
    
    const isOverLimit = monthlyBudget > maxMonthlyPerEmployee
    const suggestedBudget = Math.floor(maxMonthlyPerEmployee)
    
    return {
      employees,
      monthlyBudget: actualMonthlyBudget,
      annualBudgetPerEmployee,
      totalAnnualBudget,
      irpefSavings,
      inpsSavings,
      totalTaxSavings,
      netCost,
      savingsPercentage,
      isOverLimit,
      suggestedBudget,
      maxBudgetPerEmployee
    }
  }

  const roi = calculateAdvancedROI()

  const benefitsByCompanySize = {
    piccola: {
      icon: '🏢',
      challenges: ['Budget limitato', 'Poca esperienza con welfare', 'Necessità di semplicità'],
      solutions: ['Setup gratuito in 5 minuti', 'Supporto dedicato', 'Nessun costo fisso'],
      realExample: 'TechStart ha risparmiato €2.400 il primo anno con soli 8 dipendenti'
    },
    media: {
      icon: '🏭', 
      challenges: ['Gestione complessa HR', 'Necessità di analytics', 'Controllo dei costi'],
      solutions: ['Dashboard avanzata', 'Report automatici', 'AI per ottimizzazione'],
      realExample: 'MediaCorp ha aumentato la soddisfazione dipendenti del 40% e risparmiato €15.000'
    },
    grande: {
      icon: '🏙️',
      challenges: ['Multi-sede', 'Integrazione sistemi esistenti', 'Compliance complessa'],
      solutions: ['API personalizzate', 'Account manager dedicato', 'Supporto legale integrato'],
      realExample: 'EnterpriseCorp gestisce 500 dipendenti su 5 sedi risparmiando €65.000 annui'
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EW</span>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  EasyWelfare
                </span>
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Home
              </a>
              <a href="/prezzi" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Prezzi
              </a>
              <a href="/demo" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Demo
              </a>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <a href="/dashboard/company" className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Inizia Ora
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-green-900' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Calcola il Tuo 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
                Risparmio Fiscale
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Scopri <strong className="text-green-600">quanto puoi risparmiare</strong> con i vantaggi fiscali del welfare aziendale. 
              Calcoli precisi, esempi reali, setup immediato.
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
                ✅ 32% Risparmio Totale
              </div>
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                ⚡ Setup in 5 minuti
              </div>
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                🔒 Compliance garantita
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Calculator */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🧮 Calcolatore Avanzato Risparmio Fiscale
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Inserisci i tuoi dati o scegli un esempio predefinito per calcolare il risparmio esatto
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Input */}
            <div className={`p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 I Tuoi Dati
              </h3>

              {/* Quick Examples */}
              <div className="mb-8">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  🎯 Esempi Rapidi (clicca per applicare)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(examples).map(([key, example]) => (
                    <button
                      key={key}
                      onClick={() => handleExampleChange(key)}
                      className={`p-3 rounded-lg text-sm transition-all ${
                        selectedExample === key
                          ? 'bg-blue-600 text-white'
                          : darkMode 
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employees Slider */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  👥 Numero Dipendenti: <strong>{employees}</strong>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Min 5</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>100</span>
                  <span>250</span>
                  <span>500</span>
                </div>
              </div>

              {/* Monthly Budget Slider */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  💰 Budget Mensile per Dipendente: <strong>€{monthlyBudget}</strong>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Max €{Math.floor(roi.maxBudgetPerEmployee / 12)}
                  </span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>€10</span>
                  <span>€30</span>
                  <span>€50</span>
                  <span>€64 (Max)</span>
                  <span>€100</span>
                </div>
              </div>

              {/* Warning if over limit */}
              {roi.isOverLimit && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-amber-500 text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="text-amber-800 font-semibold">Attenzione: Limite Fiscale Superato</h4>
                      <p className="text-amber-700 text-sm mt-1">
                        Il budget ottimale è <strong>€{roi.suggestedBudget}/mese per dipendente</strong> per 
                        massimizzare i vantaggi fiscali. Stai superando il limite di €{roi.maxBudgetPerEmployee}/anno.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  💡 Suggerimenti per la tua azienda:
                </h4>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                  {employees <= 20 && (
                    <li>• Piano Starter perfetto per iniziare senza costi fissi</li>
                  )}
                  {employees > 20 && employees <= 100 && (
                    <li>• Piano Professional con analytics avanzate consigliato</li>
                  )}
                  {employees > 100 && (
                    <li>• Piano Enterprise con account manager dedicato</li>
                  )}
                  <li>• Budget ottimale: €{roi.suggestedBudget}/mese per dipendente</li>
                  <li>• Risparmio annuo stimato: €{Math.floor(roi.totalTaxSavings).toLocaleString()}</li>
                </ul>
              </div>
            </div>

            {/* Results Display */}
            <div className={`p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📈 Il Tuo Risparmio Annuale
              </h3>

              {/* Main Results Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    €{Math.floor(roi.totalAnnualBudget).toLocaleString()}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Budget Totale Annuo
                  </div>
                </div>
                <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-fifty'}`}>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    €{Math.floor(roi.totalTaxSavings).toLocaleString()}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Risparmio Totale
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-green-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-green-800'}`}>
                      💰 Risparmio IRPEF (22%)
                    </span>
                    <span className="text-green-600 font-bold">
                      €{Math.floor(roi.irpefSavings).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                      🏥 Risparmio INPS (~10%)
                    </span>
                    <span className="text-blue-600 font-bold">
                      €{Math.floor(roi.inpsSavings).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-purple-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-purple-800'}`}>
                      🎯 Costo Reale (post-risparmio)
                    </span>
                    <span className="text-purple-600 font-bold">
                      €{Math.floor(roi.netCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Percentage Savings */}
              <div className={`text-center p-6 rounded-lg mb-6 ${darkMode ? 'bg-gradient-to-r from-green-800 to-blue-800' : 'bg-gradient-to-r from-green-100 to-blue-100'}`}>
                <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.floor(roi.savingsPercentage)}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Risparmio Percentuale Totale
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <a 
                  href="/dashboard/company" 
                  className="block text-center bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  🚀 Inizia a Risparmiare Ora
                </a>
                <a 
                  href="/prezzi" 
                  className={`block text-center py-2 px-6 rounded-full transition-colors text-sm ${
                    darkMode ? 'text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Vedi Piani e Prezzi →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Benefits Explanation */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📋 Come Funzionano i Vantaggi Fiscali
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tutto quello che devi sapere sul welfare aziendale e i benefici fiscali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IRPEF Deduction */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-3xl mb-4">💰</div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detrazione IRPEF 22%
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Il welfare aziendale è completamente deducibile dalle tasse aziendali. 
                Ogni euro investito ti fa risparmiare 22 centesimi in IRPEF.
              </p>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                  Esempio: €10.000 welfare = €2.200 risparmio IRPEF
                </p>
              </div>
            </div>

            {/* INPS Savings */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-3xl mb-4">🏥</div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Risparmio Contributi INPS
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                I benefit welfare non sono soggetti a contributi previdenziali. 
                Risparmio aggiuntivo di circa il 10% dell&apos;importo.
              </p>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Esempio: €10.000 welfare = €1.000 risparmio INPS
                </p>
              </div>
            </div>

            {/* Employee Benefits */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-3xl mb-4">👤</div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Zero Tasse per Dipendenti
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                I dipendenti non pagano IRPEF sui servizi welfare ricevuti. 
                Valore pieno dei benefit senza trattenute.
              </p>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  €774 welfare = €774 di servizi reali
                </p>
              </div>
            </div>
          </div>

          {/* Legal Requirements */}
          <div className={`mt-12 p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-yellow-50'} border ${darkMode ? 'border-gray-700' : 'border-yellow-200'}`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ⚖️ Requisiti Legali per il Welfare Aziendale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  📏 Limiti e Soglie
                </h4>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• <strong>Massimo €774,69</strong> per dipendente all&apos;anno</li>
                  <li>• <strong>Minimo 5 dipendenti</strong> per attivare il welfare</li>
                  <li>• <strong>Servizi pre-approvati</strong> secondo normativa</li>
                  <li>• <strong>Documentazione</strong> completa per deduzioni</li>
                </ul>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  ✅ Servizi Welfare-Compliant
                </h4>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>• <strong>Fitness e benessere</strong> (palestre, spa, massaggi)</li>
                  <li>• <strong>Salute</strong> (visite mediche, prevenzione)</li>
                  <li>• <strong>Formazione</strong> (corsi, certificazioni)</li>
                  <li>• <strong>Servizi alla persona</strong> (asili, assistenza)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Size Examples */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🎯 EasyWelfare per Ogni Tipo di Azienda
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Soluzioni specifiche per piccole, medie e grandi aziende
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(benefitsByCompanySize).map(([size, data]) => (
              <div key={size} className={`p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="text-4xl mb-4">{data.icon}</div>
                <h3 className={`text-xl font-bold mb-4 capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {size} Azienda
                </h3>
                
                <div className="mb-6">
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    ❌ Sfide Comuni:
                  </h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {data.challenges.map((challenge, idx) => (
                      <li key={idx}>• {challenge}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                    ✅ Soluzioni EasyWelfare:
                  </h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {data.solutions.map((solution, idx) => (
                      <li key={idx}>• {solution}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    📊 Caso Reale:
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                    {data.realExample}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🚀 Come Iniziare con EasyWelfare
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Setup completo in 5 minuti, risultati immediati
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                1
              </div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Registrazione Gratuita
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Crea account azienda in 2 minuti
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-600'}`}>
                2
              </div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Carica Dipendenti
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                CSV o inserimento manuale
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-purple-800 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                3
              </div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Definisci Budget
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Carica crediti e distribuisci punti
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-orange-800 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                4
              </div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Attivazione
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Dipendenti possono usare subito i servizi
              </p>
            </div>
          </div>

          <div className="text-center">
            <a href="/dashboard/company" className="inline-block bg-gradient-to-r from-blue-600 to-green-500 text-white px-12 py-4 rounded-full text-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-4">
              🚀 Inizia Gratis Ora
            </a>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Setup gratuito • Nessun impegno • Risultati immediati
            </p>
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
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Risorse</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="/demo" className="hover:text-blue-600">Demo Interattiva</a></li>
                <li><a href="/prezzi" className="hover:text-blue-600">Piani e Prezzi</a></li>
                <li><a href="#" className="hover:text-blue-600">Guida Fiscale</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="/dashboard/company" className="hover:text-blue-600">Dashboard Azienda</a></li>
                <li><a href="/dashboard/employee" className="hover:text-blue-600">Dashboard Dipendente</a></li>
                <li><a href="/dashboard/partner" className="hover:text-blue-600">Dashboard Partner</a></li>
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