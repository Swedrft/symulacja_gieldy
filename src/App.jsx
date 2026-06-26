import { useState, useEffect } from 'react'
import { LineChart, Wallet, PieChart, Activity, RefreshCw, ScrollText, Bell } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { Market } from './components/Market'
import { History } from './components/History'
import { brokerService } from './services/brokerService'
import { marketService } from './services/marketService'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [brokerState, setBrokerState] = useState(brokerService.getState())
  const [marketData, setMarketData] = useState(marketService.getStocks())
  const [latestNews, setLatestNews] = useState(null)

  useEffect(() => {
    const unsubBroker = brokerService.subscribe(setBrokerState)
    const unsubMarket = marketService.subscribe((stocks, news) => {
      setMarketData(stocks);
      if (news) {
        setLatestNews(news);
        setTimeout(() => setLatestNews(null), 5000); // Ukryj po 5 sekundach
      }
    })
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
    <div className="app-container relative">
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
          <button 
            className={`btn btn-outline ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            <ScrollText size={18} /> Historia
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

      {latestNews && (
        <div className="animate-fade-in fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-start gap-3" 
             style={{ 
               background: 'var(--bg-panel)', 
               backdropFilter: 'blur(10px)', 
               border: '1px solid var(--border-color)',
               maxWidth: '350px'
             }}>
          <Bell className={latestNews.isPositive ? "text-success" : "text-danger"} size={24} />
          <div>
            <h4 className="mb-1" style={{ fontSize: '0.9rem' }}>Wiadomość z Rynku</h4>
            <p className="text-sm text-muted">{latestNews.message}</p>
          </div>
        </div>
      )}

      <main className="main-content animate-fade-in">
        {currentView === 'dashboard' && <Dashboard brokerState={brokerState} marketData={marketData} />}
        {currentView === 'market' && <Market marketData={marketData} />}
        {currentView === 'history' && <History brokerState={brokerState} />}
      </main>
    </div>
  )
}

export default App
