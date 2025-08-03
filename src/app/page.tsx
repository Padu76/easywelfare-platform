'use client'

import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const testimonials = [
    {
      quote: "EasyWelfare ha rivoluzionato il nostro approccio al welfare aziendale. I dipendenti sono più felici e noi risparmiamo il 32% sui costi.",
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

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
              <a href="/aziende" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Per Aziende
              </a>
              <a href="/prezzi" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
              <div className="space-y-3">
                <a href="/aziende" className="block text-center bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors font-semibold">
                  💰 Calcola il Tuo Risparmio
                </a>
                <a href="/dashboard/company" className={`block text-center py-2 px-6 rounded-full transition-colors text-sm ${
                  darkMode ? 'text-blue-300 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'
                }`}>
                  Prova la Dashboard →
                </a>
              </div>
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
              <div className="space-y-3">
                <a href="/dashboard/employee" className="block text-center bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 transition-colors font-semibold">
                  🛍️ Esplora Servizi
                </a>
                <a href="/demo" className={`block text-center py-2 px-6 rounded-full transition-colors text-sm ${
                  darkMode ? 'text-green-300 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'
                }`}>
                  Prova la Demo →
                </a>
              </div>
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
                  Commissioni dal 10% al 15%
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
              <div className="space-y-3">
                <a href="/dashboard/partner" className="block text-center bg-purple-600 text-white py-3 px-6 rounded-full hover:bg-purple-700 transition-colors font-semibold">
                  🤝 Diventa Partner
                </a>
                <a href="/prezzi" className={`block text-center py-2 px-6 rounded-full transition-colors text-sm ${
                  darkMode ? 'text-purple-300 hover:bg-purple-900/20' : 'text-purple-600 hover:bg-purple-50'
                }`}>
                  Vedi Commissioni →
                </a>
              </div>
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

      {/* Quick ROI Teaser */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💰 Quanto Puoi Risparmiare?
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Scopri i vantaggi fiscali concreti del welfare aziendale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <div className="text-2xl mb-2">🏢</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Piccola Azienda</h3>
              <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>10 dipendenti</div>
              <div className="text-2xl font-bold text-green-600 mb-1">€2.478</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>risparmio annuo</div>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg border-2 border-blue-500`}>
              <div className="text-2xl mb-2">🏭</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Media Azienda</h3>
              <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>50 dipendenti</div>
              <div className="text-2xl font-bold text-green-600 mb-1">€12.390</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>risparmio annuo</div>
            </div>

            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <div className="text-2xl mb-2">🏙️</div>
              <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grande Azienda</h3>
              <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>200 dipendenti</div>
              <div className="text-2xl font-bold text-green-600 mb-1">€49.560</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>risparmio annuo</div>
            </div>
          </div>

          <div className="space-y-4">
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              💡 <strong>Calcoli basati su</strong>: Budget €774,69 per dipendente, IRPEF 22% + INPS 10%
            </p>
            <a href="/aziende" className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              📊 Calcola il Tuo Risparmio Esatto
            </a>
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
            <a href="/aziende" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              💰 Calcola il Tuo Risparmio
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
                <li><a href="/aziende" className="hover:text-blue-600">Per Aziende</a></li>
                <li><a href="/prezzi" className="hover:text-blue-600">Prezzi</a></li>
                <li><a href="#come-funziona" className="hover:text-blue-600">Come Funziona</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Risorse</h4>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-600">Guida Welfare</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Case Study</a></li>
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