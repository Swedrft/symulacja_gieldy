import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart } from 'lucide-react';
import { StockDetailsModal } from './StockDetailsModal';

// Lekki, zoptymalizowany wykres sparkline oparty o natywne SVG
const Sparkline = React.memo(({ history, isUp, stockId }) => {
  const data = history.slice(-45); // pobieramy tylko ostatnie 45 punktów dla małego wykresu
  if (data.length < 2) return <div style={{ height: '80px' }} />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const height = 80;
  const width = 300;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 2 - ((val - min) / range) * (height - 4); // margines bezpieczeństwa
    return { x, y };
  });
  
  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const fillPathData = `${pathData} L ${width},${height} L 0,${height} Z`;
  const gradientId = `sparkline-grad-${stockId}`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="80" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Obszar pod wykresem z gradientem */}
      <path
        d={fillPathData}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      
      {/* Linia wykresu */}
      <path
        d={pathData}
        fill="none"
        stroke={isUp ? 'var(--success)' : 'var(--danger)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

Sparkline.displayName = 'Sparkline';

export function Market({ marketData }) {
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(marketData.map(s => s.category))];

  const filteredData = activeCategory === 'All' 
    ? marketData 
    : marketData.filter(s => s.category === activeCategory);

  return (
    <div className="animate-fade-in grid gap-8">
      <div>
        <h1 className="text-gradient">Rynek Giełdowy</h1>
        <p className="text-muted">Kupuj i sprzedawaj akcje spółek, fundusze ETF oraz kryptowaluty</p>
      </div>

      <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="md:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredData.map(stock => {
          const isUp = stock.trend === 'up';
          
          return (
            <div 
              key={stock.id} 
              className="glass-panel stock-card p-4 cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedStock(stock)}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-xl">{stock.name}</div>
                    <div className="text-muted text-sm flex gap-2 items-center mt-1">
                      <span>{stock.id}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{stock.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">{stock.price.toFixed(2)} PLN</div>
                    <div className={`flex items-center justify-end gap-1 font-bold ${isUp ? 'text-success' : 'text-danger'}`}>
                      {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(stock.change).toFixed(2)} ({((stock.change / (stock.price - stock.change)) * 100).toFixed(2)}%)
                    </div>
                  </div>
                </div>
                
                <div style={{ height: '80px', width: '100%', margin: '1rem 0' }}>
                  <Sparkline history={stock.history} isUp={isUp} stockId={stock.id} />
                </div>
              </div>

              <button 
                className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 mt-2"
                onClick={(e) => { e.stopPropagation(); setSelectedStock(stock); }}
              >
                <ShoppingCart size={20} /> Handluj
              </button>
            </div>
          );
        })}
      </div>

      {selectedStock && (
        <StockDetailsModal 
          stock={marketData.find(s => s.id === selectedStock.id) || selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}
    </div>
  );
}

