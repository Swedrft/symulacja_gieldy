import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart } from 'lucide-react';
import { StockDetailsModal } from './StockDetailsModal';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

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

      <div className="glass-panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="stock-list">
            <thead>
              <tr>
                <th>Firma / Walor</th>
                <th>Kategoria</th>
                <th>Cena Rynkowa</th>
                <th style={{ width: '120px' }}>Wykres (Trend)</th>
                <th>Zmiana</th>
                <th className="text-right">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(stock => {
                const chartData = stock.history.map((val, i) => ({ index: i, value: val }));
                const isUp = stock.trend === 'up';
                
                return (
                  <tr key={stock.id} className="stock-row" onClick={() => setSelectedStock(stock)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="font-bold">{stock.name}</div>
                      <div className="text-muted text-sm">{stock.id}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{stock.category}</span>
                    </td>
                    <td className="font-bold text-lg">{stock.price.toFixed(2)}</td>
                    <td>
                      <div style={{ width: '100px', height: '40px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <YAxis domain={['auto', 'auto']} hide />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={isUp ? 'var(--success)' : 'var(--danger)'} 
                              strokeWidth={2} 
                              dot={false} 
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td>
                      <div className={`flex items-center gap-1 ${isUp ? 'text-success' : 'text-danger'}`}>
                        {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(stock.change).toFixed(2)}
                      </div>
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn btn-primary"
                        onClick={(e) => { e.stopPropagation(); setSelectedStock(stock); }}
                      >
                        <ShoppingCart size={16} /> Handluj
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStock && (
        <StockDetailsModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}
    </div>
  );
}
