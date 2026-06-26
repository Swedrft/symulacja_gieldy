import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Trash2, CalendarDays } from 'lucide-react';
import { brokerService } from '../services/brokerService';

export function History({ brokerState }) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'orders'

  const handleCancelOrder = (id) => {
    if (confirm('Czy na pewno chcesz anulować to zlecenie?')) {
      brokerService.cancelLimitOrder(id);
    }
  };

  return (
    <div className="animate-fade-in grid gap-8">
      <div>
        <h1 className="text-gradient">Historia i Zlecenia</h1>
        <p className="text-muted">Przegląd Twojej aktywności na koncie maklerskim</p>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-color)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('transactions')}
        >
          <CalendarDays size={18} /> Historia Transakcji
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('orders')}
        >
          <Clock size={18} /> Zlecenia Oczekujące (Limit)
        </button>
      </div>

      <div className="glass-panel">
        {activeTab === 'transactions' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="stock-list">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Typ</th>
                  <th>Walor</th>
                  <th>Ilość</th>
                  <th>Kurs</th>
                  <th>Prowizja</th>
                  <th className="text-right">Wartość Netto</th>
                </tr>
              </thead>
              <tbody>
                {brokerState.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted">
                      Brak historii transakcji.
                    </td>
                  </tr>
                ) : brokerState.transactions.map(t => (
                  <tr key={t.id} className="stock-row">
                    <td className="text-sm text-muted">{new Date(t.date).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${t.type.includes('BUY') ? 'badge-success' : 'badge-danger'}`}>
                        {t.type.replace('_EXEC', '')}
                      </span>
                    </td>
                    <td className="font-bold">{t.stockId}</td>
                    <td>{t.quantity} szt.</td>
                    <td>{t.price.toFixed(2)} PLN</td>
                    <td className="text-danger">-{t.commission.toFixed(2)} PLN</td>
                    <td className={`text-right font-bold ${t.type.includes('BUY') ? 'text-danger' : 'text-success'}`}>
                      {t.type.includes('BUY') ? '-' : '+'}{t.total.toFixed(2)} PLN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="stock-list">
              <thead>
                <tr>
                  <th>Data Złożenia</th>
                  <th>Typ</th>
                  <th>Walor</th>
                  <th>Ilość</th>
                  <th>Cena Docelowa (Limit)</th>
                  <th>Status</th>
                  <th className="text-right">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {brokerState.limitOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted">
                      Brak zleceń oczekujących.
                    </td>
                  </tr>
                ) : brokerState.limitOrders.map(o => (
                  <tr key={o.id} className="stock-row">
                    <td className="text-sm text-muted">{new Date(o.date).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${o.type === 'buy' ? 'badge-success' : 'badge-danger'}`}>
                        LIMIT {o.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-bold">{o.stockId}</td>
                    <td>{o.quantity} szt.</td>
                    <td className="font-bold text-lg">{o.targetPrice.toFixed(2)} PLN</td>
                    <td>
                      <span className="text-sm" style={{
                        color: o.status === 'pending' ? 'var(--warning)' : 
                               o.status === 'executed' ? 'var(--success)' : 'var(--text-muted)'
                      }}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      {o.status === 'pending' && (
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleCancelOrder(o.id)}
                        >
                          <Trash2 size={14} /> Anuluj
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
