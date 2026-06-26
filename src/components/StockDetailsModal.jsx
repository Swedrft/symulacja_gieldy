import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';
import { X, TrendingUp, TrendingDown, DollarSign, Activity, Users, Info, BarChart2, Briefcase } from 'lucide-react';
import { brokerService } from '../services/brokerService';
import { marketService } from '../services/marketService';

export function StockDetailsModal({ stock, onClose }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [timeRange, setTimeRange] = useState('6M');
  const [tradeMode, setTradeMode] = useState('market'); // market | limit
  const [actionType, setActionType] = useState('buy'); // buy | sell
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(stock.price);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPrice = stock.price;
  const isUp = stock.trend === 'up';

  const getDaysForRange = (range) => {
    switch(range) {
      case '3M': return 90;
      case '6M': return 180;
      case '1R': return 365;
      case '2L': return 730;
      case '3L': return 1095;
      case 'MAX': return stock.history.length;
      default: return 180;
    }
  };

  const daysToTake = getDaysForRange(timeRange);
  const slicedHistory = stock.history.slice(-daysToTake);
  
  const chartData = slicedHistory.map((val, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (slicedHistory.length - 1 - i));
    return {
      name: date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      cena: val
    };
  });

  const handleTrade = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (tradeMode === 'market') {
        const total = quantity * currentPrice;
        const msg = brokerService.executeMarketOrder(stock.id, actionType, quantity, currentPrice);
        setSuccess(`${msg} Wartość rynkowa: ${total.toFixed(2)} PLN`);
      } else {
        brokerService.placeLimitOrder(stock.id, actionType, quantity, limitPrice);
        setSuccess(`Zlecenie oczekujące (Limit ${actionType === 'buy' ? 'Kupna' : 'Sprzedaży'}) zostało złożone po cenie ${limitPrice.toFixed(2)} PLN.`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const renderSummaryTab = () => (
    <div className="dashboard-grid-2">
      <div className="flex flex-col gap-6">
        {/* Main Chart */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {['3M', '6M', '1R', '2L', '3L', 'MAX'].map(range => (
              <button 
                key={range}
                className={`btn ${timeRange === range ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cena" 
                  stroke={isUp ? 'var(--success)' : 'var(--danger)'} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-black/20 rounded-lg">
          <div>
            <div className="text-xs text-muted mb-1">Zakres 52 tyg.</div>
            <div className="font-bold">{stock.fundamentals.min52Week} - {stock.fundamentals.max52Week}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Kapitalizacja</div>
            <div className="font-bold">{(stock.fundamentals.marketCap / 1000000).toFixed(2)} mln</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Wolumen</div>
            <div className="font-bold">{stock.fundamentals.volume.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Przew. Dywidenda</div>
            <div className="font-bold">{stock.fundamentals.dividendYield}%</div>
          </div>
        </div>
      </div>

      {/* Trading Panel */}
      <div className="p-6 bg-black/20 rounded-lg border border-[rgba(255,255,255,0.05)]">
        <h3 className="mb-4 text-xl font-bold border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
          <Briefcase size={20} /> Transakcja
        </h3>
        
        <div className="flex gap-2 mb-4">
          <button 
            className={`flex-1 py-2 btn ${actionType === 'buy' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => { setActionType('buy'); setError(''); setSuccess(''); }}
          >
            KUP
          </button>
          <button 
            className={`flex-1 py-2 btn ${actionType === 'sell' ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => { setActionType('sell'); setError(''); setSuccess(''); }}
          >
            SPRZEDAJ
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            className={`flex-1 py-1 btn ${tradeMode === 'market' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTradeMode('market')}
          >
            Zlecenie Rynkowe
          </button>
          <button 
            className={`flex-1 py-1 btn ${tradeMode === 'limit' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTradeMode('limit')}
          >
            Zlecenie z Limitem
          </button>
        </div>

        <form onSubmit={handleTrade} className="flex flex-col gap-4">
          <div className="input-group">
            <label className="input-label">Ilość akcji (Sztuki)</label>
            <input 
              type="number" 
              className="input-field text-xl font-bold" 
              min="1" 
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              required 
            />
          </div>

          {tradeMode === 'limit' && (
            <div className="input-group">
              <label className="input-label">Limit Ceny (PLN)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field text-xl font-bold text-accent" 
                value={limitPrice} 
                onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)}
                required 
              />
            </div>
          )}

          <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Cena za akcję:</span>
              <span>{tradeMode === 'market' ? currentPrice.toFixed(2) : limitPrice.toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Prowizja (0.39% / min 5):</span>
              <span className="text-danger">~{Math.max(5, (quantity * (tradeMode === 'market' ? currentPrice : limitPrice)) * 0.0039).toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)]">
              <span>Szacowana wartość:</span>
              <span>{(quantity * (tradeMode === 'market' ? currentPrice : limitPrice)).toFixed(2)} PLN</span>
            </div>
          </div>

          {error && <div className="p-3 bg-danger/10 text-danger rounded border border-danger text-sm">{error}</div>}
          {success && <div className="p-3 bg-success/10 text-success rounded border border-success text-sm">{success}</div>}

          <button 
            type="submit" 
            className={`btn w-full py-3 text-lg mt-2 ${actionType === 'buy' ? 'btn-success' : 'btn-danger'}`}
          >
            {actionType === 'buy' ? 'KUP TERAZ' : 'SPRZEDAJ TERAZ'}
          </button>
        </form>

        {/* Company News */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-bold border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
            Wydarzenia
          </h3>
          <div className="flex flex-col gap-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {marketService.getNewsHistory().filter(n => n.stockId === stock.id).length === 0 ? (
              <div className="text-muted text-sm text-center">Brak nowych wydarzeń dla tej spółki.</div>
            ) : (
              marketService.getNewsHistory().filter(n => n.stockId === stock.id).map(news => (
                <div key={news.id} className="p-3 rounded bg-black/20 border-l-4" style={{ borderColor: news.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                  <div className="text-xs text-muted mb-1">{new Date(news.date).toLocaleTimeString()}</div>
                  <div className="text-sm">{news.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialsTab = () => {
    const finData = stock.fundamentals.financials.map(f => ({
      name: f.year.toString(),
      'Przychody': f.revenue,
      'Dochód operacyjny': f.operatingIncome,
      'Koszty operacyjne': f.operatingCost
    }));

    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <h3 className="text-2xl font-bold flex items-center gap-2 mb-2"><BarChart2 /> Rachunek Zysków i Strat</h3>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)' }}
                formatter={(value) => `${(value).toLocaleString()} PLN`}
              />
              <Legend />
              <Bar dataKey="Przychody" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Koszty operacyjne" fill="#f59e0b" stackId="a" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Dochód operacyjny" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderEarningsTab = () => {
    const rec = stock.fundamentals.recommendation;
    // Przygotowanie danych do wskaźnika "Gauge"
    const gaugeData = [
      { name: 'Sprzedawaj', value: 20, fill: '#ef4444' },
      { name: 'Trzymaj', value: 20, fill: '#f59e0b' },
      { name: 'Kupuj', value: 20, fill: '#10b981' }
    ];

    return (
      <div className="grid grid-cols-2 gap-8 animate-fade-in">
        <div className="glass-panel">
          <h3 className="text-xl font-bold mb-6 border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
            <Users /> Rekomendacja Analityków
          </h3>
          
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${rec.score >= 4 ? 'text-success' : (rec.score <= 2 ? 'text-danger' : 'text-warning')}`}>
              {rec.text}
            </div>
            <div className="text-muted mt-2">Na podstawie opinii {rec.analystsCount} analityków</div>
          </div>

          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Strzałka wskaźnika - bardzo prosta implementacja */}
            <div className="flex justify-center -mt-8 font-bold text-xl">
              Wynik: {rec.score} / 5
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="text-xl font-bold mb-6 border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
            <Info /> Kluczowe Wskaźniki Wyceny
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-black/20 rounded">
              <span className="text-muted">Zysk na akcję (EPS)</span>
              <span className="font-bold text-lg">{stock.fundamentals.eps} PLN</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/20 rounded">
              <span className="text-muted">Wskaźnik Cena/Zysk (C/Z)</span>
              <span className="font-bold text-lg">{stock.fundamentals.peRatio}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/20 rounded">
              <span className="text-muted">Kapitalizacja</span>
              <span className="font-bold text-lg">{(stock.fundamentals.marketCap / 1000000).toFixed(2)} mln PLN</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/20 rounded">
              <span className="text-muted">Akcje w obrocie</span>
              <span className="font-bold text-lg">{Math.floor(stock.fundamentals.marketCap / currentPrice).toLocaleString()} szt.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!document.body) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="glass-panel modal-content relative" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '1200px', width: '95%', maxHeight: '95vh', overflowY: 'auto' }}
      >
        <button 
          className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer' }}
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl m-0">{stock.name}</h2>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{stock.id}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{stock.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">{currentPrice.toFixed(2)} <span className="text-lg text-muted">PLN</span></span>
                <span className={`text-xl font-bold flex items-center gap-1 ${isUp ? 'text-success' : 'text-danger'}`}>
                  {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  {Math.abs(stock.change).toFixed(2)} ({((stock.change / (currentPrice - stock.change)) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('summary')}
          >
            Podsumowanie
          </button>
          <button 
            className={`btn ${activeTab === 'financials' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('financials')}
          >
            Finanse
          </button>
          <button 
            className={`btn ${activeTab === 'earnings' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('earnings')}
          >
            Analiza i Wskaźniki
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'financials' && renderFinancialsTab()}
        {activeTab === 'earnings' && renderEarningsTab()}

      </div>
    </div>,
    document.body
  );
}
