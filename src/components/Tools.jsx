import React, { useState } from 'react';
import { Bell, Calendar, Trash2, Plus, Calculator, Banknote, Landmark } from 'lucide-react';
import { brokerService } from '../services/brokerService';

export function Tools({ brokerState, marketData }) {
  const [selectedStock, setSelectedStock] = useState(marketData[0]?.id || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('above');
  
  // Kalkulator Zysków
  const [calcEntryPrice, setCalcEntryPrice] = useState('100');
  const [calcExitPrice, setCalcExitPrice] = useState('110');
  const [calcQuantity, setCalcQuantity] = useState('10');
  const [calcLeverage, setCalcLeverage] = useState(1);
  const [calcType, setCalcType] = useState('long');

  // Kredyt
  const [loanAmount, setLoanAmount] = useState('');

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!selectedStock || !targetPrice) return;
    
    brokerService.addPriceAlert(selectedStock, parseFloat(targetPrice), alertType);
    setTargetPrice('');
  };

  const handleRemoveAlert = (id) => {
    brokerService.removePriceAlert(id);
  };

  const handleTakeLoan = (e) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);
    if (amount > 0) {
      brokerService.takeLoan(amount);
      setLoanAmount('');
    }
  };

  const handleRepayLoan = (e) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);
    if (amount > 0) {
      brokerService.repayLoan(amount);
      setLoanAmount('');
    }
  };

  // Obliczenia do kalkulatora
  const numEntry = Number(calcEntryPrice) || 0;
  const numExit = Number(calcExitPrice) || 0;
  const numQty = Number(calcQuantity) || 0;

  const calcTotalValue = numEntry * numQty;
  const calcMargin = calcLeverage > 0 ? calcTotalValue / calcLeverage : 0;
  const calcCommissionEntry = Math.max(5, calcTotalValue * 0.0039);
  const calcTotalValueExit = numExit * numQty;
  const calcCommissionExit = Math.max(5, calcTotalValueExit * 0.0039);
  
  let calcProfit = 0;
  if (calcType === 'long') {
    calcProfit = (numExit - numEntry) * numQty;
  } else {
    calcProfit = (numEntry - numExit) * numQty;
  }
  
  const calcNetProfit = calcProfit - calcCommissionEntry - calcCommissionExit;
  const calcROI = calcMargin > 0 ? (calcNetProfit / calcMargin) * 100 : 0;

  const dividendStocks = marketData
    .filter(s => s.fundamentals.dividendYield > 0)
    .sort((a, b) => b.fundamentals.dividendYield - a.fundamentals.dividendYield);

  return (
    <div className="animate-fade-in grid gap-8 md:grid-cols-2">
      
      {/* Alerty Cenowe */}
      <div className="glass-panel flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-y-auto min-h-0">
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

      {/* Kalkulator Zysków */}
      <div className="glass-panel flex flex-col">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gradient">
          <Calculator size={24} /> Kalkulator Zysków CFD
        </h2>
        <p className="text-muted mb-6">Przelicz na sucho potencjalny zysk z pozycji biorąc pod uwagę dźwignię i prowizje.</p>

        <div className="flex flex-col gap-4 mb-4 bg-black/20 p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Typ Pozycji</label>
              <select className="input-field" value={calcType} onChange={e => setCalcType(e.target.value)}>
                <option value="long">LONG (Wzrosty)</option>
                <option value="short">SHORT (Spadki)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Dźwignia</label>
              <select className="input-field" value={calcLeverage} onChange={e => setCalcLeverage(Number(e.target.value))}>
                <option value="1">x1</option>
                <option value="2">x2</option>
                <option value="5">x5</option>
                <option value="10">x10</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Cena Wejścia (PLN)</label>
              <input type="number" className="input-field" value={calcEntryPrice} onChange={e => setCalcEntryPrice(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Cena Wyjścia (PLN)</label>
              <input type="number" className="input-field" value={calcExitPrice} onChange={e => setCalcExitPrice(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Ilość Akcji</label>
            <input type="number" className="input-field" value={calcQuantity} onChange={e => setCalcQuantity(e.target.value)} />
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Całkowita Wartość Pozycji:</span>
            <span>{calcTotalValue.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Wymagany Depozyt (Margin):</span>
            <span className="font-bold text-white">{calcMargin.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Szacowana Prowizja (Otwarcia i Zamknięcia):</span>
            <span className="text-danger">{(calcCommissionEntry + calcCommissionExit).toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-lg mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
            <span className="font-bold">Zysk netto:</span>
            <div className="text-right">
              <span className={`font-bold ${calcNetProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {calcNetProfit > 0 ? '+' : ''}{calcNetProfit.toFixed(2)} PLN
              </span>
              <div className={`text-sm ${calcROI >= 0 ? 'text-success' : 'text-danger'}`}>
                ROI: {calcROI > 0 ? '+' : ''}{calcROI.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kredyt Bankowy */}
      <div className="glass-panel flex flex-col">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gradient">
          <Landmark size={24} /> Bank (Kredyt Gotówkowy)
        </h2>
        <p className="text-muted mb-6">Brakuje Ci gotówki na zabezpieczenie pozycji (Margin)? Zaciągnij pożyczkę rynkową. Oprocentowanie to {((brokerState.loan?.interestRate || 0.0005) * 100).toFixed(2)}% co ok. 30 sekund trwania symulacji.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-black/20 rounded-lg">
            <div className="text-sm text-muted">Wolne Środki</div>
            <div className="text-xl font-bold text-success">{brokerState.balance.toFixed(2)} PLN</div>
          </div>
          <div className="p-4 bg-black/20 rounded-lg border border-danger/30">
            <div className="text-sm text-muted">Zadłużenie</div>
            <div className="text-xl font-bold text-danger">{brokerState.loan?.amount?.toFixed(2) || '0.00'} PLN</div>
          </div>
        </div>

        <form className="flex flex-col gap-4">
          <div className="input-group">
            <label className="input-label">Kwota (PLN)</label>
            <input 
              type="number" 
              className="input-field text-xl" 
              value={loanAmount} 
              onChange={e => setLoanAmount(e.target.value)} 
              placeholder="np. 5000"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline flex-1 border-success text-success hover:bg-success hover:text-white" onClick={handleTakeLoan}>
              Wypłać Kredyt
            </button>
            <button className="btn btn-outline flex-1 border-primary text-primary hover:bg-primary hover:text-white" onClick={handleRepayLoan}>
              Spłać Kredyt
            </button>
          </div>
        </form>
      </div>

      {/* Kalendarz Dywidend */}
      <div className="glass-panel flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gradient">
          <Calendar size={24} /> Kalendarz Dywidend
        </h2>
        <p className="text-muted mb-4 text-sm">Lista spółek wypłacających dywidendy. Posiadaj akcje (Long), aby otrzymać wypłatę.</p>

        <div className="flex-1 overflow-y-auto min-h-0">
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
