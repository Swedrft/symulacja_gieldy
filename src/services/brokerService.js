import { marketService } from './marketService';

class BrokerService {
  constructor() {
    this.storageKey = 'symulacja_gieldy_broker_state';
    this.initialBalance = 10000;
    this.state = this.loadState();
    this.listeners = [];
    this.tickCounter = 0;

    marketService.subscribe((stocks, currentNews, newsHistory, dividendEvent) => {
      this.tickCounter++;
      this.checkLimitOrders(stocks);
      this.checkPriceAlerts(stocks);
      this.checkMarginCalls(stocks);
      this.processLoans();
      
      // Co 10 ticków symulacji (ok. 30s) wykonaj zrzut historii konta
      if (this.tickCounter % 10 === 0) {
        this.snapshotAccountHistory(stocks);
      }

      if (dividendEvent) {
        this.processDividend(dividendEvent);
      }
    });
  }

  processDividend(dividendEvent) {
    const { stockId, dividendPerShare } = dividendEvent;
    
    // W nowym modelu przechodzimy przez otwarte pozycje "long" dla dywidend
    const longPositions = this.state.positions.filter(p => p.stockId === stockId && p.type === 'long');
    let totalPayout = 0;
    
    longPositions.forEach(pos => {
      totalPayout += pos.quantity * dividendPerShare;
    });

    if (totalPayout > 0) {
      this.state.balance += totalPayout;
      this.state.transactions.unshift({
        id: Date.now().toString() + 'div',
        type: 'DIVIDEND',
        stockId,
        quantity: 0,
        price: dividendPerShare,
        commission: 0,
        total: totalPayout,
        date: new Date().toISOString()
      });
      this.saveState();
    }
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.limitOrders) parsed.limitOrders = [];
        if (!parsed.priceAlerts) parsed.priceAlerts = [];
        if (!parsed.accountHistory) parsed.accountHistory = [];
        if (!parsed.loan) parsed.loan = { amount: 0, interestRate: 0.0005 }; // 0.05% na tick
        if (!parsed.positions) {
          parsed.positions = [];
          if (parsed.portfolio) {
            Object.entries(parsed.portfolio).forEach(([stockId, data]) => {
              if (data.quantity > 0) {
                parsed.positions.push({
                  id: Date.now().toString() + Math.random().toString().slice(2, 6),
                  stockId,
                  type: 'long',
                  quantity: data.quantity,
                  entryPrice: data.averagePrice,
                  leverage: 1,
                  margin: data.quantity * data.averagePrice
                });
              }
            });
            delete parsed.portfolio;
          }
        }
        return parsed;
      } catch(e) {
        console.error('Failed to load state', e);
      }
    }
    return {
      balance: this.initialBalance,
      positions: [],
      transactions: [],
      limitOrders: [],
      priceAlerts: [],
      accountHistory: [{ date: new Date().toISOString(), value: this.initialBalance }],
      loan: { amount: 0, interestRate: 0.0005 }
    };
  }

  // Oblicza aktualną, całkowitą wartość konta z otwartymi pozycjami
  calculateTotalValue(stocks) {
    let totalStockValue = 0;
    this.state.positions.forEach(pos => {
      const stock = stocks.find(s => s.id === pos.stockId);
      if (stock) {
        let profit = 0;
        if (pos.type === 'long') {
          profit = (stock.price - pos.entryPrice) * pos.quantity;
        } else {
          profit = (pos.entryPrice - stock.price) * pos.quantity;
        }
        totalStockValue += (pos.margin + profit);
      }
    });
    return this.state.balance + totalStockValue;
  }

  snapshotAccountHistory(stocks) {
    const value = this.calculateTotalValue(stocks);
    this.state.accountHistory.push({
      date: new Date().toISOString(),
      value: Number(value.toFixed(2))
    });
    
    // Zatrzymujemy max 100 zrzutów, aby wykres nie był zbyt gęsty
    if (this.state.accountHistory.length > 100) {
      this.state.accountHistory.shift();
    }
    this.saveState();
  }

  processLoans() {
    if (this.state.loan && this.state.loan.amount > 0) {
      const interest = this.state.loan.amount * this.state.loan.interestRate;
      this.state.balance -= interest;
      // Nie zapisujemy tego jako osobnej transakcji by nie spamować, zrobimy to cicho
      // Jednak można też dodawać powiadomienia, jeśli saldo spadnie poniżej 0
    }
  }

  takeLoan(amount) {
    if (amount <= 0) return { success: false };
    this.state.balance += amount;
    this.state.loan.amount += amount;
    this.state.transactions.unshift({
      id: Date.now().toString() + 'loan',
      type: 'LOAN_TAKEN',
      stockId: 'BANK',
      quantity: 0,
      price: 0,
      commission: 0,
      total: amount,
      date: new Date().toISOString()
    });
    this.saveState();
    return { success: true };
  }

  repayLoan(amount) {
    if (amount <= 0 || this.state.loan.amount === 0) return { success: false };
    const repayment = Math.min(amount, this.state.loan.amount);
    if (this.state.balance < repayment) {
      return { success: false, error: 'Brak środków na spłatę kredytu' };
    }
    this.state.balance -= repayment;
    this.state.loan.amount -= repayment;
    this.state.transactions.unshift({
      id: Date.now().toString() + 'repay',
      type: 'LOAN_REPAID',
      stockId: 'BANK',
      quantity: 0,
      price: 0,
      commission: 0,
      total: -repayment,
      date: new Date().toISOString()
    });
    this.saveState();
    return { success: true };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
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

  openPosition(stockId, type, quantity, leverage = 1, isLimit = false, targetPrice = null) {
    if (quantity <= 0) return { success: false, error: 'Nieprawidłowa ilość' };
    const stock = marketService.getStock(stockId);
    if (!stock) return { success: false, error: 'Nieprawidłowa akcja' };

    const price = isLimit ? targetPrice : stock.price;
    const totalValue = price * quantity;
    const requiredMargin = totalValue / leverage;
    const commission = this.calculateCommission(totalValue);
    const totalCost = requiredMargin + commission;

    if (isLimit) {
      // Dla zleceń oczekujących blokujemy środki tak jakbyśmy wchodzili teraz
      const lockedFunds = this.state.limitOrders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + (o.quantity * o.targetPrice / o.leverage) + this.calculateCommission(o.quantity * o.targetPrice), 0);
        
      if (this.state.balance - lockedFunds < totalCost) {
         return { success: false, error: 'Brak wolnych środków na depozyt i prowizję' };
      }

      this.state.limitOrders.push({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        type, // 'long' lub 'short'
        stockId,
        quantity,
        targetPrice,
        leverage,
        status: 'pending',
        date: new Date().toISOString()
      });
      this.saveState();
      return { success: true };
    }

    // Wykonanie Market
    if (this.state.balance < totalCost) {
      return { success: false, error: 'Brak środków na zabezpieczenie pozycji i prowizję' };
    }

    this.state.balance -= totalCost;
    
    this.state.positions.push({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      stockId,
      type,
      quantity,
      entryPrice: stock.price,
      leverage,
      margin: requiredMargin,
      date: new Date().toISOString()
    });

    this.state.transactions.unshift({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type: type === 'long' ? 'OPEN_LONG' : 'OPEN_SHORT',
      stockId,
      quantity,
      price: stock.price,
      commission,
      total: -totalCost,
      date: new Date().toISOString()
    });

    this.saveState();
    return { success: true };
  }

  closePosition(positionId) {
    const posIndex = this.state.positions.findIndex(p => p.id === positionId);
    if (posIndex === -1) return { success: false, error: 'Pozycja nie istnieje' };
    
    const pos = this.state.positions[posIndex];
    const stock = marketService.getStock(pos.stockId);
    
    const totalValue = pos.quantity * stock.price;
    const commission = this.calculateCommission(totalValue);

    let profit = 0;
    if (pos.type === 'long') {
      profit = (stock.price - pos.entryPrice) * pos.quantity;
    } else {
      profit = (pos.entryPrice - stock.price) * pos.quantity;
    }

    // Dodajemy margin i profit, odejmujemy prowizję zamknięcia
    const closeRevenue = pos.margin + profit - commission;
    this.state.balance += closeRevenue;
    
    this.state.transactions.unshift({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type: pos.type === 'long' ? 'CLOSE_LONG' : 'CLOSE_SHORT',
      stockId: pos.stockId,
      quantity: pos.quantity,
      price: stock.price,
      commission,
      total: closeRevenue,
      date: new Date().toISOString()
    });

    this.state.positions.splice(posIndex, 1);
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

  checkLimitOrders(stocks) {
    let changed = false;
    this.state.limitOrders.forEach(order => {
      if (order.status !== 'pending') return;
      const stock = stocks.find(s => s.id === order.stockId);
      if (!stock) return;

      if ((order.type === 'long' && stock.price <= order.targetPrice) || 
          (order.type === 'short' && stock.price >= order.targetPrice)) {
         
         // Spróbuj wykonać
         const totalValue = order.targetPrice * order.quantity;
         const requiredMargin = totalValue / order.leverage;
         const commission = this.calculateCommission(totalValue);
         const totalCost = requiredMargin + commission;

         if (this.state.balance >= totalCost) {
            this.state.balance -= totalCost;
            this.state.positions.push({
              id: Date.now().toString() + Math.random().toString().slice(2, 6),
              stockId: order.stockId,
              type: order.type,
              quantity: order.quantity,
              entryPrice: order.targetPrice,
              leverage: order.leverage,
              margin: requiredMargin,
              date: new Date().toISOString()
            });

            this.state.transactions.unshift({
              id: Date.now().toString() + Math.random().toString().slice(2, 6),
              type: order.type === 'long' ? 'LIMIT_LONG_EXEC' : 'LIMIT_SHORT_EXEC',
              stockId: order.stockId,
              quantity: order.quantity,
              price: order.targetPrice,
              commission,
              total: -totalCost,
              date: new Date().toISOString()
            });

            order.status = 'executed';
         } else {
            order.status = 'failed';
         }
         changed = true;
      }
    });
    if (changed) this.saveState();
  }

  checkMarginCalls(stocks) {
    let changed = false;
    // Sprawdzanie czy strata na pozycji jest większa lub bliska marginowi.
    // Dla uproszczenia zamykamy gdy margin + profit <= 0. 
    // Czyli cały depozyt zabezpieczający został zjedzony przez stratę.
    
    // Iterujemy od końca, żeby bezpiecznie usuwać elementy
    for (let i = this.state.positions.length - 1; i >= 0; i--) {
      const pos = this.state.positions[i];
      const stock = stocks.find(s => s.id === pos.stockId);
      if (!stock) continue;

      let profit = 0;
      if (pos.type === 'long') {
        profit = (stock.price - pos.entryPrice) * pos.quantity;
      } else {
        profit = (pos.entryPrice - stock.price) * pos.quantity;
      }

      if (pos.margin + profit <= 0) {
        // MARGIN CALL - Auto zamknięcie
        const totalValue = pos.quantity * stock.price;
        const commission = this.calculateCommission(totalValue);
        
        // Zamykamy z wynikiem (0, bo margin zjedzony) i ewentualnie dodajemy dług za prowizję
        const closeRevenue = pos.margin + profit - commission; 
        this.state.balance += closeRevenue; // Prawdopodobnie będzie to ujemne ze względu na prowizję
        
        this.state.transactions.unshift({
          id: Date.now().toString() + 'mc',
          type: 'MARGIN_CALL',
          stockId: pos.stockId,
          quantity: pos.quantity,
          price: stock.price,
          commission,
          total: closeRevenue,
          date: new Date().toISOString()
        });
        
        // Powiadomienie
        marketService.notify({
          id: Date.now().toString(),
          stockId: pos.stockId,
          message: `MARGIN CALL! Twoja pozycja na ${pos.stockId} została przymusowo zamknięta z powodu braku depozytu.`,
          isPositive: false,
          date: new Date().toISOString()
        });

        this.state.positions.splice(i, 1);
        changed = true;
      }
    }
    
    if (changed) this.saveState();
  }

  // --- Alerty ---
  addPriceAlert(stockId, targetPrice, type) {
    this.state.priceAlerts.push({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      stockId,
      targetPrice,
      type, // 'above' lub 'below'
      active: true
    });
    this.saveState();
  }

  removePriceAlert(id) {
    this.state.priceAlerts = this.state.priceAlerts.filter(a => a.id !== id);
    this.saveState();
  }

  checkPriceAlerts(stocks) {
    let changed = false;
    this.state.priceAlerts.forEach(alert => {
      if (!alert.active) return;
      const stock = stocks.find(s => s.id === alert.stockId);
      if (!stock) return;

      if ((alert.type === 'above' && stock.price >= alert.targetPrice) ||
          (alert.type === 'below' && stock.price <= alert.targetPrice)) {
          
          alert.active = false;
          changed = true;

          // Uruchom powiadomienie ogólne przez marketService
          marketService.notify({
            id: Date.now().toString() + 'alert',
            stockId: stock.id,
            message: `ALERT CENOWY: ${stock.name} osiągnął wyznaczony poziom ${alert.targetPrice} PLN! (Aktualna cena: ${stock.price} PLN)`,
            isPositive: true,
            date: new Date().toISOString()
          });
      }
    });
    if (changed) this.saveState();
  }

  resetAccount() {
    this.state = {
      balance: this.initialBalance,
      positions: [],
      transactions: [],
      limitOrders: [],
      priceAlerts: [],
      accountHistory: [{ date: new Date().toISOString(), value: this.initialBalance }],
      loan: { amount: 0, interestRate: 0.0005 }
    };
    this.saveState();
  }
}

export const brokerService = new BrokerService();
