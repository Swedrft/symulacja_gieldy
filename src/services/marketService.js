class MarketService {
  constructor() {
    // Initial real-world like data
    this.stocks = [
      { id: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 0, trend: 'up' },
      { id: 'MSFT', name: 'Microsoft Corp.', price: 410.20, change: 0, trend: 'up' },
      { id: 'TSLA', name: 'Tesla Inc.', price: 190.80, change: 0, trend: 'down' },
      { id: 'NVDA', name: 'NVIDIA Corp.', price: 880.10, change: 0, trend: 'up' },
      { id: 'AMZN', name: 'Amazon.com', price: 178.90, change: 0, trend: 'up' },
      { id: 'CDR', name: 'CD Projekt S.A.', price: 115.20, change: 0, trend: 'down' },
      { id: 'SPY', name: 'S&P 500 ETF', price: 512.30, change: 0, trend: 'up' },
    ];
    
    this.listeners = [];
    
    // Start price simulation
    this.startSimulation();
  }

  getStocks() {
    return this.stocks;
  }

  getStock(id) {
    return this.stocks.find(s => s.id === id);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener([...this.stocks]));
  }

  startSimulation() {
    // Update prices every 3 seconds to simulate live market
    setInterval(() => {
      this.stocks = this.stocks.map(stock => {
        // Random walk: change price by -0.5% to +0.5%
        const volatility = 0.005;
        const changePercent = (Math.random() * volatility * 2) - volatility;
        
        const oldPrice = stock.price;
        const newPrice = oldPrice * (1 + changePercent);
        
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number((newPrice - oldPrice).toFixed(2)),
          trend: newPrice >= oldPrice ? 'up' : 'down'
        };
      });
      this.notify();
    }, 3000);
  }
}

export const marketService = new MarketService();
