import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, RadioReceiver } from 'lucide-react';
import { marketService } from '../services/marketService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

export function Dashboard({ brokerState, marketData }) {
  // Obliczanie wartości portfela z uwzględnieniem kategorii
  let totalStockValue = 0;
  const categoryValues = {};
  
  const portfolioItems = Object.entries(brokerState.portfolio).map(([stockId, data]) => {
    const stock = marketData.find(s => s.id === stockId);
    if (!stock) return null;
    
    const currentPrice = stock.price;
    const value = data.quantity * currentPrice;
    const profit = value - (data.quantity * data.averagePrice);
    const profitPercent = (profit / (data.quantity * data.averagePrice)) * 100;
    
    totalStockValue += value;
    categoryValues[stock.category] = (categoryValues[stock.category] || 0) + value;

    return {
      ...stock,
      quantity: data.quantity,
      averagePrice: data.averagePrice,
      currentValue: value,
      profit,
      profitPercent
    };
  }).filter(Boolean);

  const totalValue = brokerState.balance + totalStockValue;
  const initialValue = 10000;
  const totalProfit = totalValue - initialValue;
  const totalProfitPercent = (totalProfit / initialValue) * 100;

  // Przygotowanie danych do Pie Chart (Dywersyfikacja)
  const pieData = Object.entries(categoryValues).map(([name, value]) => ({ name, value }));
  // Dodanie gotówki do wykresu kołowego
  if (brokerState.balance > 0) {
    pieData.push({ name: 'Gotówka', value: brokerState.balance });
  }

  // Przygotowanie dummy-historii do głównego wykresu konta
  const accountHistoryData = [
    { name: 'Start', value: initialValue },
    { name: 'Teraz', value: totalValue }
  ];

  const newsHistory = marketService.getNewsHistory();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-gradient mb-2">Twój Pulpit</h1>
        <p className="text-muted">Centrum dowodzenia i analityki Twojego portfela</p>
      </div>

      <div className="dashboard-grid-3">
        <div className="glass-panel">
          <div className="text-sm text-muted mb-2 flex items-center gap-2"><DollarSign size={16}/> Wartość Konta</div>
          <div className="text-3xl font-bold mb-2">{totalValue.toFixed(2)} PLN</div>
          <div className={`text-sm flex items-center gap-1 ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(totalProfit).toFixed(2)} PLN ({totalProfitPercent.toFixed(2)}%)
          </div>
        </div>

        <div className="glass-panel">
          <div className="text-sm text-muted mb-2 flex items-center gap-2"><Briefcase size={16}/> Zainwestowano</div>
          <div className="text-3xl font-bold mb-2">{totalStockValue.toFixed(2)} PLN</div>
          <div className="text-sm text-muted">W aktywne pozycje giełdowe</div>
        </div>

        <div className="glass-panel">
          <div className="text-sm text-muted mb-2 flex items-center gap-2"><Activity size={16}/> Wolne Środki</div>
          <div className="text-3xl font-bold mb-2 text-success">{brokerState.balance.toFixed(2)} PLN</div>
          <div className="text-sm text-muted">Gotowe do zainwestowania</div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-panel flex flex-col">
          <h3 className="mb-4 text-gradient">Historia Wartości Konta</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accountHistoryData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-color)' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel flex flex-col">
          <h3 className="mb-4 text-gradient">Dywersyfikacja</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(2)} PLN`}
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">Brak danych</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="glass-panel">
          <h3 className="mb-6 text-gradient">Twój Portfel</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="stock-list">
              <thead>
                <tr>
                  <th>Walor</th>
                  <th>Kategoria</th>
                  <th>Ilość</th>
                  <th>Śr. Cena Kupna</th>
                  <th>Wartość Zakupu</th>
                  <th>Obecna Cena</th>
                  <th>Obecna Wartość</th>
                  <th className="text-right">Zysk / Strata</th>
                </tr>
              </thead>
              <tbody>
                {portfolioItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">
                      Twój portfel jest pusty. Przejdź do zakładki Rynek, aby dokonać pierwszej inwestycji.
                    </td>
                  </tr>
                ) : (
                  portfolioItems.map(item => (
                    <tr key={item.id} className="stock-row">
                      <td className="font-bold">{item.id}</td>
                      <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{item.category}</span></td>
                      <td>{item.quantity} szt.</td>
                      <td>{item.averagePrice.toFixed(2)}</td>
                      <td>{(item.quantity * item.averagePrice).toFixed(2)} PLN</td>
                      <td className="font-bold">{item.price.toFixed(2)}</td>
                      <td className="font-bold">{item.currentValue.toFixed(2)} PLN</td>
                      <td className={`text-right font-bold ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {item.profit > 0 ? '+' : ''}{item.profit.toFixed(2)} PLN <br/>
                        <span className="text-sm">({item.profitPercent > 0 ? '+' : ''}{item.profitPercent.toFixed(2)}%)</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <h3 className="mb-6 text-gradient flex items-center gap-2"><RadioReceiver size={20} /> Oś Czasu (News)</h3>
          {newsHistory.length === 0 ? (
            <div className="text-muted text-center py-4">Brak wiadomości z rynku.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {newsHistory.map(news => (
                <div key={news.id} className="p-3 rounded bg-black/20 border-l-4" style={{ borderColor: news.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                  <div className="text-xs text-muted mb-1">{new Date(news.date).toLocaleTimeString()} • {news.stockId}</div>
                  <div className="text-sm">{news.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
