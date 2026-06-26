import React from 'react';
import { ArrowUpRight, ArrowDownRight, Briefcase, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard({ brokerState, marketData }) {
  // Calculate Portfolio Value
  let portfolioValue = 0;
  const portfolioDetails = [];
  
  Object.keys(brokerState.portfolio).forEach(stockId => {
    const p = brokerState.portfolio[stockId];
    const stock = marketData.find(s => s.id === stockId);
    if (stock) {
      const currentPrice = stock.price;
      const totalCurrentValue = p.quantity * currentPrice;
      const totalInvested = p.quantity * p.averagePrice;
      const profit = totalCurrentValue - totalInvested;
      const profitPercent = (profit / totalInvested) * 100;
      
      portfolioValue += totalCurrentValue;
      
      portfolioDetails.push({
        id: stockId,
        name: stock.name,
        quantity: p.quantity,
        avgPrice: p.averagePrice,
        currentPrice,
        totalValue: totalCurrentValue,
        profit,
        profitPercent
      });
    }
  });

  const totalAssets = brokerState.balance + portfolioValue;
  const totalProfit = totalAssets - 10000; // 10000 is initial balance
  const totalProfitPercent = (totalProfit / 10000) * 100;

  // Generate fake chart data based on transactions to show some history (simplified)
  const chartData = [
    { name: 'Start', value: 10000 },
    ...brokerState.transactions.map((t, index) => {
      // Very naive approach: we just simulate a smooth curve if there are transactions.
      return {
        name: new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        value: 10000 + (Math.random() * 500 - 250) // In a real app we'd calculate exact historical snapshots
      }
    }).reverse().slice(0, 10)
  ];
  if(chartData.length === 1) {
    chartData.push({ name: 'Teraz', value: totalAssets });
  }

  return (
    <div className="animate-fade-in grid gap-8">
      <div>
        <h1 className="text-gradient">Twój Pulpit Inwestora</h1>
        <p className="text-muted">Przegląd Twojego wirtualnego konta i posiadanych akcji</p>
      </div>
      
      {/* Top Cards */}
      <div className="grid grid-cols-3">
        <div className="glass-panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted">
            <Briefcase size={18} /> Wartość Całkowita
          </div>
          <div className="text-3xl font-bold">{totalAssets.toFixed(2)} PLN</div>
          <div className={`flex items-center gap-1 ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{Math.abs(totalProfit).toFixed(2)} PLN ({Math.abs(totalProfitPercent).toFixed(2)}%)</span>
            <span className="text-muted text-sm ml-2">od początku</span>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted">
            <TrendingUp size={18} /> Wartość Akcji
          </div>
          <div className="text-3xl font-bold">{portfolioValue.toFixed(2)} PLN</div>
          <div className="text-muted text-sm">Zainwestowano w {portfolioDetails.length} firm(y)</div>
        </div>

        <div className="glass-panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted">
            Wolne Środki
          </div>
          <div className="text-3xl font-bold">{brokerState.balance.toFixed(2)} PLN</div>
          <div className="text-muted text-sm">Gotowe do inwestycji</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel" style={{ height: '300px' }}>
        <h3 className="mb-4">Historia Wartości Portfela</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(0)} />
            <Tooltip 
              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio Table */}
      <div className="glass-panel">
        <h3 className="mb-4">Twoje Akcje</h3>
        {portfolioDetails.length === 0 ? (
          <div className="text-center text-muted py-8">
            Nie masz jeszcze żadnych akcji. Przejdź do zakładki Rynek, aby dokonać pierwszego zakupu!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="stock-list">
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Ilość</th>
                  <th>Śr. Cena Zakupu</th>
                  <th>Obecna Cena</th>
                  <th>Wartość</th>
                  <th>Zysk / Strata</th>
                </tr>
              </thead>
              <tbody>
                {portfolioDetails.map(item => (
                  <tr key={item.id} className="stock-row">
                    <td>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-muted text-sm">{item.id}</div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.avgPrice.toFixed(2)} PLN</td>
                    <td>{item.currentPrice.toFixed(2)} PLN</td>
                    <td className="font-bold">{item.totalValue.toFixed(2)} PLN</td>
                    <td>
                      <div className={`flex items-center gap-1 ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {item.profit >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(item.profit).toFixed(2)} ({Math.abs(item.profitPercent).toFixed(2)}%)
                      </div>
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
