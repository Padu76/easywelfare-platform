import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EasyWelfare</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/demo" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Demo
              </Link>
              <Link href="/dashboard/company" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Accedi
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welfare Aziendale
            <span className="text-blue-600"> Semplificato</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Gestisci benefit aziendali, distribuisci punti ai dipendenti e offri servizi di benessere. 
            Tutto in una piattaforma semplice e sicura.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/demo" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Prova Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Per le Aziende</h3>
              <p className="mt-2 text-gray-600">
                Carica crediti, distribuisci punti ai dipendenti e monitora l'utilizzo con reportistica dettagliata.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Per i Dipendenti</h3>
              <p className="mt-2 text-gray-600">
                Utilizza i tuoi punti welfare per servizi di fitness, benessere e salute. Tutto con un QR code.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900">Per i Partner</h3>
              <p className="mt-2 text-gray-600">
                Entra nel circuito senza costi iniziali. Paga solo una percentuale sulle vendite effettuate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}