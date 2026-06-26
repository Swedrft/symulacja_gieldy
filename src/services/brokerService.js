import { marketService } from './marketService';

class BrokerService {
  constructor() {
    this.storageKey = 'symulacja_gieldy_broker_state';
    
    // Zawsze startujemy z 10 000 wirtualnych PLN
    this.initialBalance = 10000;
    
    this.state = this.loadState();
    this.listeners = [];

    // Nasłuchujemy zmian na rynku, aby realizować zlecenia z limitem
    marketService.subscribe((stocks) => this.checkLimitOrders(stocks));
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.limitOrders) parsed.limitOrders = [];
        return parsed;
      } catch(e) {
        console.error('Failed to load state', e);
      }
    }
    return {
      balance: this.initialBalance,
      portfolio: {}, // { 'AAPL': { quantity: 10, averagePrice: 150 } }
      transactions: [], // { id, type, stockId, quantity, price, commission, total, date }
      limitOrders: [] // { id, type, stockId, quantity, targetPrice, status }
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

  calculateCommission(value) {
    const rate = 0.0039;
    const minCommission = 5.00;
    const commission = value * rate;
    return commission > minCommission ? commission : minCommission;
  }

  // Zlecenie natychmiastowe (Market Order)
  buyStock(stockId, quantity) {
    const stock = marketService.getStock(stockId);
    if (!stock || quantity <= 0) return { success: false, error: 'Nieprawidłowa akcja lub ilość' };

    return this.executeBuy(stockId, quantity, stock.price);
  }

  sellStock(stockId, quantity) {
    const stock = marketService.getStock(stockId);
    if (!stock || quantity <= 0) return { success: false, error: 'Nieprawidłowa akcja lub ilość' };

    return this.executeSell(stockId, quantity, stock.price);
  }

  // Realizacja kupna z podaną ceną (wspólna dla Market i Limit)
  executeBuy(stockId, quantity, price, isLimit = false) {
    const value = price * quantity;
    const commission = this.calculateCommission(value);
    const totalCost = value + commission;

    if (this.state.balance < totalCost) {
      return { success: false, error: 'Brak wystarczających środków na koncie (uwzględniając prowizję)' };
    }

    this.state.balance -= totalCost;

    if (!this.state.portfolio[stockId]) {
      this.state.portfolio[stockId] = { quantity: 0, averagePrice: 0 };
    }
    
    const currPort = this.state.portfolio[stockId];
    const totalValueBefore = currPort.quantity * currPort.averagePrice;
    currPort.quantity += quantity;
    currPort.averagePrice = (totalValueBefore + totalCost) / currPort.quantity;

    this.state.transactions.unshift({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type: isLimit ? 'LIMIT_BUY_EXEC' : 'BUY',
      stockId,
      quantity,
      price,
      commission,
      total: totalCost,
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  // Realizacja sprzedaży z podaną ceną
  executeSell(stockId, quantity, price, isLimit = false) {
    const currPort = this.state.portfolio[stockId];
    if (!currPort || currPort.quantity < quantity) {
      return { success: false, error: 'Nie masz wystarczającej ilości akcji do sprzedaży' };
    }

    const value = price * quantity;
    const commission = this.calculateCommission(value);
    const totalRevenue = value - commission; 

    this.state.balance += totalRevenue;
    currPort.quantity -= quantity;
    
    if (currPort.quantity === 0) {
      delete this.state.portfolio[stockId];
    }

    this.state.transactions.unshift({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type: isLimit ? 'LIMIT_SELL_EXEC' : 'SELL',
      stockId,
      quantity,
      price,
      commission,
      total: totalRevenue,
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  // Zlecenie oczekujące (Limit Order)
  placeLimitOrder(type, stockId, quantity, targetPrice) {
    if (quantity <= 0 || targetPrice <= 0) return { success: false, error: 'Nieprawidłowa ilość lub cena' };
    
    const stock = marketService.getStock(stockId);
    if (!stock) return { success: false, error: 'Nieprawidłowa akcja' };

    // Zablokuj środki lub sprawdź stan posiadania akcji
    if (type === 'buy') {
      const value = targetPrice * quantity;
      const commission = this.calculateCommission(value);
      const totalCost = value + commission;
      
      // Oblicz już zablokowane środki na inne zlecenia kupna
      const lockedFunds = this.state.limitOrders
        .filter(o => o.type === 'buy' && o.status === 'pending')
        .reduce((sum, o) => sum + (o.targetPrice * o.quantity) + this.calculateCommission(o.targetPrice * o.quantity), 0);
        
      if (this.state.balance - lockedFunds < totalCost) {
         return { success: false, error: 'Brak wolnych środków na to zlecenie oczekujące' };
      }
    } else {
       // Sprawdź czy mamy wystarczająco akcji (odejmując te już zablokowane na innych zleceniach)
       const currPort = this.state.portfolio[stockId];
       const owned = currPort ? currPort.quantity : 0;
       const lockedShares = this.state.limitOrders
         .filter(o => o.type === 'sell' && o.stockId === stockId && o.status === 'pending')
         .reduce((sum, o) => sum + o.quantity, 0);
         
       if (owned - lockedShares < quantity) {
         return { success: false, error: 'Nie masz wystarczającej liczby wolnych akcji' };
       }
    }

    this.state.limitOrders.push({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type, // 'buy' | 'sell'
      stockId,
      quantity,
      targetPrice,
      status: 'pending',
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  cancelLimitOrder(orderId) {
    const orderIndex = this.state.limitOrders.findIndex(o => o.id === orderId);
    if(orderIndex !== -1 && this.state.limitOrders[orderIndex].status === 'pending') {
       this.state.limitOrders[orderIndex].status = 'cancelled';
       this.saveState();
       return true;
    }
    return false;
  }

  // Sprawdzanie czy rynek dotarł do limitów
  checkLimitOrders(stocks) {
    let changed = false;
    this.state.limitOrders.forEach(order => {
      if (order.status !== 'pending') return;

      const stock = stocks.find(s => s.id === order.stockId);
      if (!stock) return;

      // Limit Buy: Cena rynkowa spadła poniżej lub do celu
      if (order.type === 'buy' && stock.price <= order.targetPrice) {
         const res = this.executeBuy(order.stockId, order.quantity, order.targetPrice, true);
         if(res.success) {
           order.status = 'executed';
           changed = true;
         } else {
           order.status = 'failed'; // np. brakło środków pomimo blokady (mało prawdopodobne, ale dla bezpieczeństwa)
           changed = true;
         }
      }
      // Limit Sell: Cena rynkowa wzrosła powyżej lub do celu
      else if (order.type === 'sell' && stock.price >= order.targetPrice) {
         const res = this.executeSell(order.stockId, order.quantity, order.targetPrice, true);
         if(res.success) {
           order.status = 'executed';
           changed = true;
         } else {
           order.status = 'failed';
           changed = true;
         }
      }
    });

    if (changed) {
      this.saveState();
    }
  }

  resetAccount() {
    this.state = {
      balance: this.initialBalance,
      portfolio: {},
      transactions: [],
      limitOrders: []
    };
    this.saveState();
  }
}

export const brokerService = new BrokerService();
