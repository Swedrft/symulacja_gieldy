import React, { useState } from 'react';
import { Bell, Calendar, Trash2, Plus } from 'lucide-react';
import { brokerService } from '../services/brokerService';

export function Tools({ brokerState, marketData }) {
  const [selectedStock, setSelectedStock] = useState(marketData[0]?.id || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('above');
  
  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!selectedStock || !targetPrice) return;
    
    brokerService.addPriceAlert(selectedStock, parseFloat(targetPrice), alertType);
    setTargetPrice('');
  };

  const handleRemoveAlert = (id) => {
    brokerService.removePriceAlert(id);
  };

  // Zbieranie informacji o nadchodzących dywidendach (dla uproszczenia pokażemy te spółki, które mają dywidendę > 0)
  const dividendStocks = marketData
    .filter(s => s.fundamentals.dividendYield > 0)
    .sort((a, b) => b.fundamentals.dividendYield - a.fundamentals.dividendYield);

  return (
    <div className="animate-fade-in grid gap-8 md:grid-cols-2">
      
      {/* Alerty Cenowe */}
      <div className="glass-panel flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gradient">
          <Bell size={24} /> Alerty Cenowe
        </h2>
        <p className="text-muted mb-6">Otrzymuj powiadomienia, gdy cena wybranej akcji osiągnie wskazany poziom.</p>

        <form onSubmit={handleAddAlert} className="flex flex-col gap-4 mb-8 bg-black/20 p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
          <div className="input-group">
            <label className="input-label">Spółka / Aktywo</label>
            <select 
              className="input-field" 
              value={selectedStock} 
              onChange={e => setSelectedStock(e.target.value)}
            >
              {marketData.map(stock => (
                <option key={stock.id} value={stock.id}>{stock.name} ({stock.id}) - {stock.price.toFixed(2)} PLN</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Warunek</label>
              <select 
                className="input-field" 
                value={alertType} 
                onChange={e => setAlertType(e.target.value)}
              >
                <option value="above">Cena Wzrośnie Powyżej</option>
                <option value="below">Cena Spadnie Poniżej</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Cena Docelowa</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field" 
                value={targetPrice} 
                onChange={e => setTargetPrice(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
            <Plus size={18} /> Dodaj Alert
          </button>
        </form>

        <div className="flex-1 overflow-y-auto">
          <h3 className="font-bold mb-3 border-b border-[rgba(255,255,255,0.1)] pb-2">Aktywne Alerty</h3>
          {brokerState.priceAlerts.length === 0 ? (
            <div className="text-muted text-center py-4">Brak aktywnych alertów.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {brokerState.priceAlerts.map(alert => {
                const stock = marketData.find(s => s.id === alert.stockId);
                return (
                  <div key={alert.id} className={`p-3 rounded-lg flex justify-between items-center ${alert.active ? 'bg-black/20' : 'bg-black/40 opacity-50'}`}>
                    <div>
                      <div className="font-bold">{stock?.name || alert.stockId}</div>
                      <div className="text-sm text-muted">
                        Powiadom gdy {alert.type === 'above' ? 'wzrośnie powyżej' : 'spadnie poniżej'} <span className="font-bold text-white">{alert.targetPrice} PLN</span>
                      </div>
                    </div>
                    <button 
                      className="text-danger hover:text-white p-2 transition-colors"
                      onClick={() => handleRemoveAlert(alert.id)}
                      title="Usuń alert"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Kalendarz Dywidend */}
      <div className="glass-panel flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gradient">
          <Calendar size={24} /> Kalendarz Dywidend
        </h2>
        <p className="text-muted mb-6">Lista spółek wypłacających dywidendy. Posiadaj akcje (Long) w momencie ogłoszenia, aby otrzymać wypłatę.</p>

        <div className="flex-1 overflow-y-auto">
          <table className="stock-list">
            <thead>
              <tr>
                <th>Spółka</th>
                <th>Cena</th>
                <th className="text-right">Roczna Stopa Dywidendy</th>
              </tr>
            </thead>
            <tbody>
              {dividendStocks.map(stock => (
                <tr key={stock.id} className="stock-row">
                  <td>
                    <div className="font-bold">{stock.name}</div>
                    <div className="text-xs text-muted">{stock.id}</div>
                  </td>
                  <td>{stock.price.toFixed(2)} PLN</td>
                  <td className="text-right font-bold text-success">
                    {stock.fundamentals.dividendYield.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
