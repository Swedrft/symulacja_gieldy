import { marketService } from './marketService';

class BrokerService {
  constructor() {
    this.storageKey = 'symulacja_gieldy_broker_state';
    
    // Zawsze startujemy z 10 000 wirtualnych PLN
    this.initialBalance = 10000;
    
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {
        console.error('Failed to load state', e);
      }
    }
    return {
      balance: this.initialBalance,
      portfolio: {}, // { 'AAPL': { quantity: 10, averagePrice: 150 } }
      transactions: [] // { type: 'BUY', stockId: 'AAPL', quantity: 1, price: 150, date: '...' }
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // wyślij obecny stan od razu po subskrypcji
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  getState() {
    return this.state;
  }

  buyStock(stockId, quantity) {
    const stock = marketService.getStock(stockId);
    if (!stock || quantity <= 0) return { success: false, error: 'Nieprawidłowa akcja lub ilość' };

    const totalCost = stock.price * quantity;
    if (this.state.balance < totalCost) {
      return { success: false, error: 'Brak wystarczających środków na koncie' };
    }

    // Odlicz z salda
    this.state.balance -= totalCost;

    // Dodaj do portfolio
    if (!this.state.portfolio[stockId]) {
      this.state.portfolio[stockId] = { quantity: 0, averagePrice: 0 };
    }
    
    const currPort = this.state.portfolio[stockId];
    const totalValueBefore = currPort.quantity * currPort.averagePrice;
    currPort.quantity += quantity;
    currPort.averagePrice = (totalValueBefore + totalCost) / currPort.quantity;

    // Zapisz transakcję
    this.state.transactions.unshift({
      id: Date.now().toString(),
      type: 'BUY',
      stockId,
      quantity,
      price: stock.price,
      total: totalCost,
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  sellStock(stockId, quantity) {
    const stock = marketService.getStock(stockId);
    if (!stock || quantity <= 0) return { success: false, error: 'Nieprawidłowa akcja lub ilość' };

    const currPort = this.state.portfolio[stockId];
    if (!currPort || currPort.quantity < quantity) {
      return { success: false, error: 'Nie masz wystarczającej ilości akcji do sprzedaży' };
    }

    const totalRevenue = stock.price * quantity;

    // Dodaj do salda
    this.state.balance += totalRevenue;

    // Odejmij z portfolio
    currPort.quantity -= quantity;
    if (currPort.quantity === 0) {
      delete this.state.portfolio[stockId];
    }

    // Zapisz transakcję
    this.state.transactions.unshift({
      id: Date.now().toString(),
      type: 'SELL',
      stockId,
      quantity,
      price: stock.price,
      total: totalRevenue,
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  resetAccount() {
    this.state = {
      balance: this.initialBalance,
      portfolio: {},
      transactions: []
    };
    this.saveState();
  }
}

export const brokerService = new BrokerService();
