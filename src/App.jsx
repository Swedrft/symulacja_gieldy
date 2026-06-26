import { useState, useEffect } from 'react'
import { LineChart, Wallet, PieChart, Activity, RefreshCw } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { Market } from './components/Market'
import { brokerService } from './services/brokerService'
import { marketService } from './services/marketService'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [brokerState, setBrokerState] = useState(brokerService.getState())
  const [marketData, setMarketData] = useState(marketService.getStocks())

  useEffect(() => {
    const unsubBroker = brokerService.subscribe(setBrokerState)
    const unsubMarket = marketService.subscribe(setMarketData)
    return () => {
      unsubBroker()
      unsubMarket()
    }
  }, [])

  const handleReset = () => {
    if(confirm('Czy na pewno chcesz zresetować swoje konto do stanu początkowego? Stracisz całą historię.')) {
      brokerService.resetAccount()
    }
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <Activity className="text-gradient" size={28} />
          <span>Symulacja<span className="text-gradient">Giełdy</span></span>
        </div>
        
        <div className="nav-links">
          <button 
            className={`btn btn-outline ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <PieChart size={18} /> Pulpit
          </button>
          <button 
            className={`btn btn-outline ${currentView === 'market' ? 'active' : ''}`}
            onClick={() => setCurrentView('market')}
          >
            <LineChart size={18} /> Rynek
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} className="text-success" />
            <strong>{brokerState.balance.toFixed(2)} PLN</strong>
          </div>
          <button className="btn btn-outline" onClick={handleReset} title="Zresetuj konto">
            <RefreshCw size={18} />
          </button>
        </div>
      </nav>

      <main className="main-content animate-fade-in">
        {currentView === 'dashboard' && <Dashboard brokerState={brokerState} marketData={marketData} />}
        {currentView === 'market' && <Market marketData={marketData} />}
      </main>
    </div>
  )
}

export default App
