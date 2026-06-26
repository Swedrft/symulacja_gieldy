import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Wallet } from 'lucide-react';
import { brokerService } from '../services/brokerService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TradeModal({ stock, onClose }) {
  const [brokerState, setBrokerState] = useState(brokerService.getState());
  const [action, setAction] = useState('buy'); // 'buy' | 'sell'
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit'
  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState(stock.price);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsub = brokerService.subscribe(setBrokerState);
    return () => unsub();
  }, []);

  const ownedQuantity = brokerState.portfolio[stock.id]?.quantity || 0;
  
  // Obliczenia wartości
  const currentExecPrice = orderType === 'market' ? stock.price : targetPrice;
  const value = quantity * currentExecPrice;
  const commission = brokerService.calculateCommission(value);
  const totalCost = value + commission;
  const totalRevenue = value - commission;
  
  const maxBuy = Math.floor((brokerState.balance - 5.0) / currentExecPrice); 
  const finalMaxBuy = maxBuy > 0 ? maxBuy : 0;

  const handleTrade = () => {
    setError(null);
    setSuccess(false);
    
    if (quantity <= 0) {
      setError('Ilość musi być większa niż 0');
      return;
    }
    
    if (orderType === 'limit' && targetPrice <= 0) {
      setError('Cena docelowa musi być większa od zera');
      return;
    }

    let result;
    if (orderType === 'market') {
      if (action === 'buy') result = brokerService.buyStock(stock.id, quantity);
      else result = brokerService.sellStock(stock.id, quantity);
    } else {
      result = brokerService.placeLimitOrder(action, stock.id, quantity, targetPrice);
    }

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  // Przygotowanie danych historycznych do wykresu (180 ticków = ok. 6 msc)
  const chartData = stock.history.map((val, idx) => ({ index: idx, value: val }));
  const isUp = stock.history[0] <= stock.history[stock.history.length - 1];

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="glass-panel modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '95vh', overflowY: 'auto' }}>
        
        {/* NAGŁÓWEK */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="mb-1 text-gradient text-2xl">{stock.name} ({stock.id})</h2>
            <div className="text-muted text-sm flex gap-2">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{stock.category}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end mr-4">
             <div className="text-sm text-muted">Obecna Cena</div>
             <div className="text-3xl font-bold">{stock.price.toFixed(2)} PLN</div>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* DUŻY WYKRES HISTORYCZNY */}
        <div className="mb-8 bg-black/20 rounded-lg p-4" style={{ height: '300px' }}>
          <h3 className="text-sm text-muted mb-2">Historia cen (symulacja 6 msc wstecz)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isUp ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                 contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'none', borderRadius: '8px' }}
                 formatter={(value) => [`${value} PLN`, 'Cena']}
                 labelFormatter={() => ''}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isUp ? 'var(--success)' : 'var(--danger)'} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PANEL TRANSAKCYJNY */}
        <div className="grid md:grid-cols-2 gap-8">
          
          <div>
             <h3 className="mb-4 text-gradient">Szczegóły Zlecenia</h3>
             
             <div className="flex gap-2 mb-4">
              <button 
                className={`btn flex-1 ${orderType === 'market' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setOrderType('market')}
                style={{ fontSize: '0.85rem' }}
              >
                RYNKOWE (MARKET)
              </button>
              <button 
                className={`btn flex-1 ${orderType === 'limit' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setOrderType('limit')}
                style={{ fontSize: '0.85rem' }}
              >
                OCZEKUJĄCE (LIMIT)
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                className={`btn flex-1 ${action === 'buy' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setAction('buy'); setError(null); }}
              >
                KUP
              </button>
              <button 
                className={`btn flex-1 ${action === 'sell' ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => { setAction('sell'); setError(null); }}
              >
                SPRZEDAJ
              </button>
            </div>

            {orderType === 'limit' && (
              <div className="input-group">
                <label className="input-label">Cena docelowa (PLN)</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  className="input-field"
                  value={targetPrice || ''}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Ilość akcji</label>
              <input 
                type="number" 
                min="1" 
                max={action === 'buy' ? finalMaxBuy : ownedQuantity}
                className="input-field"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Posiadasz: {ownedQuantity} szt.</span>
                {action === 'buy' && <span>Możesz kupić max: ~{finalMaxBuy} szt.</span>}
              </div>
            </div>
          </div>

          <div>
             <h3 className="mb-4 text-gradient">Podsumowanie</h3>
             
             <div className="mb-4 p-4 rounded-lg bg-black/20">
                <div className="text-sm text-muted mb-1">Dostępne środki</div>
                <div className="flex items-center gap-1 font-bold text-success text-xl">
                  <Wallet size={20} /> {brokerState.balance.toFixed(2)} PLN
                </div>
             </div>

             <div className="py-4 border-t border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="text-muted text-sm">Wartość akcji</div>
                <div className="font-bold">{value.toFixed(2)} PLN</div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-muted text-sm">Prowizja (0.39%, min. 5 PLN)</div>
                <div className="font-bold text-danger">-{commission.toFixed(2)} PLN</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-muted font-bold">{action === 'buy' ? 'Całkowity Koszt' : 'Otrzymasz na konto'}</div>
                <div className={`text-2xl font-bold ${action === 'buy' ? 'text-danger' : 'text-success'}`}>
                  {action === 'buy' ? totalCost.toFixed(2) : totalRevenue.toFixed(2)} PLN
                </div>
              </div>
            </div>

            <div className="mt-6">
              {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-3 rounded">{error}</div>}
              {success && <div className="text-success mb-4 text-sm bg-success/10 p-3 rounded">
                {orderType === 'market' ? 'Transakcja zakończona sukcesem!' : 'Zlecenie zostało przyjęte do realizacji!'}
              </div>}

              <button 
                className={`btn w-full ${action === 'buy' ? 'btn-primary' : 'btn-danger'}`}
                style={{ padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleTrade}
                disabled={!quantity || quantity <= 0 || (action === 'buy' && quantity > finalMaxBuy) || (action === 'sell' && quantity > ownedQuantity)}
              >
                {action === 'buy' ? (orderType === 'market' ? 'Zatwierdź Zakup' : 'Złóż Zlecenie Kupna') : (orderType === 'market' ? 'Zatwierdź Sprzedaż' : 'Złóż Zlecenie Sprzedaży')} <ArrowRight size={20} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
