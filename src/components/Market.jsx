import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart } from 'lucide-react';
import { TradeModal } from './TradeModal';

export function Market({ marketData }) {
  const [selectedStock, setSelectedStock] = useState(null);

  return (
    <div className="animate-fade-in grid gap-8">
      <div>
        <h1 className="text-gradient">Rynek Giełdowy</h1>
        <p className="text-muted">Kupuj i sprzedawaj akcje największych spółek oraz ETF-y</p>
      </div>

      <div className="glass-panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="stock-list">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Cena Rynkowa</th>
                <th>Zmiana</th>
                <th className="text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map(stock => (
                <tr key={stock.id} className="stock-row">
                  <td>
                    <div className="font-bold">{stock.name}</div>
                    <div className="text-muted text-sm">{stock.id}</div>
                  </td>
                  <td className="font-bold text-lg">{stock.price.toFixed(2)} PLN</td>
                  <td>
                    <div className={`flex items-center gap-1 ${stock.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                      {stock.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(stock.change).toFixed(2)} PLN
                    </div>
                  </td>
                  <td className="text-right">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <ShoppingCart size={16} /> Handluj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStock && (
        <TradeModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}
    </div>
  );
}
