'use client'

import { useState, useEffect } from 'react'

export default function PrezziPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('aziende')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const companyPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Gratis',
      period: '/mese',
      description: 'Perfetto per iniziare senza impegni',
      maxEmployees: 20,
      features: [
        'Fino a 20 dipendenti',
        'Dashboard base completa',
        'Distribuzione punti manuale',
        'Catalogo servizi standard',
        'QR code per transazioni',
        'Report mensili base',
        'Supporto email',
        'Commissione 15% sui servizi'
      ],
      limitations: [
        'Nessuna analytics avanzata',
        'Supporto solo via email',
        'Report limitati'
      ],
      cta: 'Inizia Gratis',
      ctaLink: '/dashboard/company',
      popular: false,
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '49',
      period: '/mese',
      description: 'La scelta più popolare per aziende in crescita',
      maxEmployees: 100,
      features: [
        'Fino a 100 dipendenti',
        'Dashboard avanzata + Analytics',
        'Distribuzione automatica punti',
        'Catalogo premium con sconti esclusivi',
        'QR code + Card digitali',
        'Report dettagliati + Export',
        'AI per ottimizzazione fiscale',
        'Supporto prioritario',
        'Commissione 12% sui servizi',
        'Integrazioni HR (CSV import)',
        'Multi-sede supportato'
      ],
      limitations: [],
      cta: 'Scegli Professional',
      ctaLink: '/dashboard/company',
      popular: true,
      color: 'green'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Soluzioni su misura per grandi aziende',
      maxEmployees: '∞',
      features: [
        'Dipendenti illimitati',
        'Dashboard personalizzata',
        'API personalizzate',
        'Catalogo esclusivo personalizzato',
        'Sistema di fatturazione avanzato',
        'Report personalizzati',
        'AI avanzata + Predictive analytics',
        'Account manager dedicato',
        'Commissione 10% sui servizi',
        'Integrazioni ERP/SAP',
        'Support SLA garantito',
        'Formazione team dedicata',
        'Conformità GDPR avanzata'
      ],
      limitations: [],
      cta: 'Contattaci',
      ctaLink: 'mailto:enterprise@easywelfare.it',
      popular: false,
      color: 'purple'
    }
  ]

  const partnerTiers = [
    {
      id: 'standard',
      name: 'Partner Standard',
      commission: '15%',
      description: 'Ingresso gratuito nel circuito EasyWelfare',
      requirements: 'Nessun requisito minimo',
      features: [
        '🚫 Zero costi di ingresso',
        '📱 Dashboard partner completa',
        '🔍 Scanner QR integrato',
        '📊 Report vendite mensili',
        '💰 Pagamenti puntuali fine mese',
        '🎯 Visibilità nel catalogo',
        '📞 Supporto email',
        '📈 Analytics base vendite'
      ],
      benefits: [
        'Nuovi clienti automatici',
        'Zero investimento marketing',
        'Pagamenti garantiti',
        'Gestione semplificata'
      ],
      cta: 'Diventa Partner',
      ctaLink: '/dashboard/partner',
      popular: false,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Partner Premium',
      commission: '12%',
      description: 'Per partner che vogliono massimizzare i ricavi',
      requirements: '€500/mese di transazioni min',
      features: [
        '💎 Commissione ridotta al 12%',
        '⭐ Posizionamento prioritario',
        '🎁 Offerte esclusive',
        '📊 Analytics avanzate',
        '🚀 Marketing co-branding',
        '📞 Supporto telefonico prioritario',
        '💡 Consulenza strategica',
        '🎯 Targeting clienti avanzato',
        '📈 A/B testing offerte',
        '🏆 Badge "Partner Premium"'
      ],
      benefits: [
        'Più visibilità = più clienti',
        'Commissioni più basse',
        'Support dedicato',
        'Crescita accelerata'
      ],
      cta: 'Richiedi Premium',
      ctaLink: 'mailto:partners@easywelfare.it',
      popular: true,
      color: 'green'
    },
    {
      id: 'vip',
      name: 'Partner VIP',
      commission: '10%',
      description: 'Esclusivo per partner di alto livello',
      requirements: '€2000/mese di transazioni min',
      features: [
        '🏆 Commissione minima al 10%',
        '👑 Esclusività territoriale',
        '💼 Account manager dedicato',
        '🎨 Marketing personalizzato',
        '📺 Campagne pubblicitarie',
        '🤝 Partnership strategiche',
        '📊 Dashboard personalizzata',
        '🔧 Integrazioni custom',
        '⚡ Support 24/7',
        '💰 Bonus performance',
        '🎯 Clienti enterprise dedicati',
        '📈 Revenue sharing speciale'
      ],
      benefits: [
        'Massimi ricavi possibili',
        'Esclusività territoriale',
        'Support dedicato VIP',
        'Crescita strategica'
      ],
      cta: 'Solo su Invito',
      ctaLink: '#',
      popular: false,
      color: 'purple'
    }
  ]

  const faqData = {
    aziende: [
      {
        question: 'Posso cambiare piano in qualsiasi momento?',
        answer: 'Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento. I cambiamenti saranno applicati dal prossimo ciclo di fatturazione.'
      },
      {
        question: 'Cosa succede se supero il limite di dipendenti?',
        answer: 'Ti invieremo una notifica quando ti avvicini al limite. Potrai fare upgrade automatico al piano superiore o pagare un supplemento di €2 per dipendente extra.'
      },
      {
        question: 'I vantaggi fiscali sono garantiti?',
        answer: 'Sì, EasyWelfare è completamente conforme alla normativa italiana sul welfare aziendale. Tutti i servizi sono pre-approvati per garantire la deducibilità fiscale.'
      },
      {
        question: 'Come funziona la fatturazione?',
        answer: 'Ricevi una fattura unica mensile che include il canone del piano e le commissioni sui servizi utilizzati. Tutto semplificato per la tua contabilità.'
      },
      {
        question: 'Posso integrare EasyWelfare con i miei sistemi HR?',
        answer: 'Sì, offriamo API e integrazioni con i principali sistemi HR. Nel piano Professional e Enterprise includiamo supporto per integrazioni personalizzate.'
      }
    ],
    partner: [
      {
        question: 'Ci sono costi nascosti oltre alla commissione?',
        answer: 'No, assolutamente. Paghi solo la commissione percentuale sulle vendite completate. Zero costi di setup, canoni fissi o fee nascoste.'
      },
      {
        question: 'Quando ricevo i pagamenti?',
        answer: 'I pagamenti vengono elaborati automaticamente entro 5 giorni lavorativi dalla fine di ogni mese, direttamente sul tuo conto corrente.'
      },
      {
        question: 'Posso scegliere quali servizi offrire?',
        answer: 'Sì, hai controllo completo sui tuoi servizi. Puoi attivare/disattivare servizi, modificare prezzi e disponibilità in tempo reale dalla dashboard.'
      },
      {
        question: 'Come funziona il sistema di recensioni?',
        answer: 'I clienti possono lasciare recensioni dopo ogni servizio. Le recensioni positive aumentano la tua visibilità nel catalogo e attraggono più clienti.'
      },
      {
        question: 'Posso diventare Partner Premium subito?',
        answer: 'Per il tier Premium devi raggiungere €500/mese di transazioni. Una volta raggiunto, puoi richiedere l&apos;upgrade e attiveremo i benefici entro 48 ore.'
      }
    ]
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
              <a href="/aziende" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Per Aziende
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
              Prezzi 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block">
                Trasparenti
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Paghi solo per quello che usi. <strong className="text-blue-600">Zero costi nascosti</strong>, 
              massima trasparenza, risultati garantiti.
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
                ✅ Setup Gratuito
              </div>
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                💰 Nessun Impegno
              </div>
              <div className={`px-6 py-3 rounded-full ${darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                📊 Fatturazione Unica
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className={`py-8 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className={`p-1 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <button
                onClick={() => setActiveTab('aziende')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'aziende'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏢 Per Aziende
              </button>
              <button
                onClick={() => setActiveTab('partner')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'partner'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏪 Per Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Plans */}
      {activeTab === 'aziende' && (
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🏢 Piani per Aziende
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Scegli il piano perfetto per la dimensione della tua azienda
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {companyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? darkMode 
                        ? 'bg-gradient-to-br from-green-900 to-blue-900 border-2 border-green-500'
                        : 'bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-500'
                      : darkMode 
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                        🔥 Più Popolare
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${plan.color === 'blue' ? 'text-blue-600' : plan.color === 'green' ? 'text-green-600' : 'text-purple-600'}`}>
                        {plan.price === 'Gratis' ? plan.price : `€${plan.price}`}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {typeof plan.maxEmployees === 'number' ? `Fino a ${plan.maxEmployees}` : plan.maxEmployees} dipendenti
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ✅ Funzionalità incluse:
                    </h4>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="mb-8">
                      <h4 className={`font-semibold mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                        ❌ Limitazioni:
                      </h4>
                      <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-400 mr-2 flex-shrink-0 mt-0.5">×</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={plan.ctaLink}
                    className={`block text-center py-4 px-6 rounded-full font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-xl transform hover:scale-105'
                        : plan.color === 'blue'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : plan.color === 'purple'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* Company Plans Comparison */}
            <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                💡 Quale piano scegliere?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Piccole Aziende (5-20 dipendenti)
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Piano Starter</strong> perfetto per iniziare senza costi fissi. 
                    Tutte le funzioni essenziali incluse.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🏭</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Medie Aziende (20-100 dipendenti)
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Piano Professional</strong> con analytics avanzate e AI. 
                    Ottimizza automaticamente il welfare.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🏙️</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Grandi Aziende (100+ dipendenti)
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Piano Enterprise</strong> con soluzioni su misura, 
                    integrazioni custom e support dedicato.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Partner Tiers */}
      {activeTab === 'partner' && (
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🏪 Commissioni Partner
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Zero costi di ingresso, paghi solo una commissione sulle vendite completate
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {partnerTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
                    tier.popular
                      ? darkMode 
                        ? 'bg-gradient-to-br from-green-900 to-purple-900 border-2 border-green-500'
                        : 'bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-500'
                      : darkMode 
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                        ⭐ Consigliato
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tier.description}
                    </p>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${tier.color === 'blue' ? 'text-blue-600' : tier.color === 'green' ? 'text-green-600' : 'text-purple-600'}`}>
                        {tier.commission}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {' '}commissione
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tier.requirements}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ✨ Vantaggi inclusi:
                    </h4>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 flex-shrink-0 mt-0.5">
                            {feature.startsWith('🚫') ? '🚫' : 
                             feature.startsWith('💎') ? '💎' : 
                             feature.startsWith('🏆') ? '🏆' : '✓'}
                          </span>
                          {feature.replace(/^[🚫💎🏆]/, '').trim()}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h4 className={`font-semibold mb-4 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      🎯 Perché scegliere questo tier:
                    </h4>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2 flex-shrink-0 mt-0.5">→</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={tier.ctaLink}
                    className={`block text-center py-4 px-6 rounded-full font-semibold transition-all duration-300 ${
                      tier.id === 'vip'
                        ? darkMode 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : tier.popular
                          ? 'bg-gradient-to-r from-green-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                          : tier.color === 'blue'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* Partner Success Examples */}
            <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <h3 className={`text-xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Esempi di Guadagni Partner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">🏋️</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Palestra Locale
                  </h4>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    €1.500/mese transazioni<br/>
                    <strong className="text-green-600">€1.305/mese ricavi</strong> (13% commissione)
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +40 nuovi clienti dal welfare
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💆</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Centro Benessere
                  </h4>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    €3.200/mese transazioni<br/>
                    <strong className="text-green-600">€2.816/mese ricavi</strong> (12% commissione - Premium)
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +85 nuovi clienti dal welfare
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🏥</div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Clinica Medica
                  </h4>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    €8.500/mese transazioni<br/>
                    <strong className="text-green-600">€7.650/mese ricavi</strong> (10% commissione - VIP)
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +200 nuovi pazienti dal welfare
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ❓ Domande Frequenti
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tutto quello che devi sapere su {activeTab === 'aziende' ? 'piani e fatturazione' : 'commissioni e pagamenti'}
            </p>
          </div>

          <div className="space-y-6">
            {faqData[activeTab].map((faq, idx) => (
              <div key={idx} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {faq.question}
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Non trovi la risposta che cerchi?
            </p>
            <a href="mailto:support@easywelfare.it" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
              📧 Contatta il Supporto
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-green-900' : 'bg-gradient-to-r from-blue-600 to-green-500'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {activeTab === 'aziende' ? 'Pronto a Risparmiare?' : 'Pronto a Guadagnare?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {activeTab === 'aziende' 
              ? 'Setup gratuito in 5 minuti. Inizia a risparmiare subito con i vantaggi fiscali del welfare.'
              : 'Ingresso gratuito nel circuito EasyWelfare. Inizia a guadagnare da nuovi clienti welfare.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={activeTab === 'aziende' ? '/dashboard/company' : '/dashboard/partner'} 
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {activeTab === 'aziende' ? '🚀 Inizia Gratis Ora' : '🤝 Diventa Partner'}
            </a>
            <a href="/demo" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              🎯 Prova la Demo
            </a>
          </div>
          
          <div className="mt-12 text-blue-100 text-sm">
            💡 <strong>Nessun impegno</strong> - Puoi cambiare o annullare in qualsiasi momento
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
                <li><a href="#" className="hover:text-blue-600">Come Funziona</a></li>
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