import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Wallet } from 'lucide-react';
import { brokerService } from '../services/brokerService';

export function TradeModal({ stock, onClose }) {
  const [brokerState, setBrokerState] = useState(brokerService.getState());
  const [action, setAction] = useState('buy'); // 'buy' | 'sell'
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsub = brokerService.subscribe(setBrokerState);
    return () => unsub();
  }, []);

  const ownedQuantity = brokerState.portfolio[stock.id]?.quantity || 0;
  const maxBuy = Math.floor(brokerState.balance / stock.price);
  
  const totalValue = quantity * stock.price;

  const handleTrade = () => {
    setError(null);
    setSuccess(false);
    
    if (quantity <= 0) {
      setError('Ilość musi być większa niż 0');
      return;
    }

    let result;
    if (action === 'buy') {
      result = brokerService.buyStock(stock.id, quantity);
    } else {
      result = brokerService.sellStock(stock.id, quantity);
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

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="glass-panel modal-content">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="mb-1 text-gradient">Zlecenie: {stock.id}</h2>
            <div className="text-muted text-sm">{stock.name}</div>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-black/20">
          <div>
            <div className="text-sm text-muted mb-1">Cena aktualna</div>
            <div className="text-2xl font-bold">{stock.price.toFixed(2)} PLN</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted mb-1">Twoje środki</div>
            <div className="flex items-center gap-1 justify-end font-bold text-success">
              <Wallet size={16} /> {brokerState.balance.toFixed(2)} PLN
            </div>
          </div>
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

        <div className="input-group">
          <label className="input-label">Ilość akcji</label>
          <input 
            type="number" 
            min="1" 
            max={action === 'buy' ? maxBuy : ownedQuantity}
            className="input-field"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Posiadasz: {ownedQuantity} szt.</span>
            {action === 'buy' && <span>Możesz kupić max: {maxBuy} szt.</span>}
          </div>
        </div>

        <div className="flex justify-between items-center my-6 py-4 border-t border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-muted">Szacowana Wartość Transakcji</div>
          <div className="text-xl font-bold">{totalValue.toFixed(2)} PLN</div>
        </div>

        {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-3 rounded">{error}</div>}
        {success && <div className="text-success mb-4 text-sm bg-success/10 p-3 rounded">Transakcja zakończona sukcesem!</div>}

        <button 
          className={`btn w-full ${action === 'buy' ? 'btn-primary' : 'btn-danger'}`}
          onClick={handleTrade}
          disabled={quantity <= 0 || (action === 'buy' && quantity > maxBuy) || (action === 'sell' && quantity > ownedQuantity)}
        >
          {action === 'buy' ? 'Zatwierdź Zakup' : 'Zatwierdź Sprzedaż'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
