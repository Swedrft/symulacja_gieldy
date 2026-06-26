class MarketService {
  constructor() {
    this.stocks = [
      // US Tech
      { id: 'AAPL', name: 'Apple Inc.', category: 'US Tech', price: 175.50, change: 0, trend: 'up', history: Array(20).fill(175.50) },
      { id: 'MSFT', name: 'Microsoft Corp.', category: 'US Tech', price: 410.20, change: 0, trend: 'up', history: Array(20).fill(410.20) },
      { id: 'TSLA', name: 'Tesla Inc.', category: 'US Tech', price: 190.80, change: 0, trend: 'down', history: Array(20).fill(190.80) },
      { id: 'NVDA', name: 'NVIDIA Corp.', category: 'US Tech', price: 880.10, change: 0, trend: 'up', history: Array(20).fill(880.10) },
      { id: 'AMZN', name: 'Amazon.com', category: 'US Tech', price: 178.90, change: 0, trend: 'up', history: Array(20).fill(178.90) },
      { id: 'GOOGL', name: 'Alphabet Inc.', category: 'US Tech', price: 168.30, change: 0, trend: 'up', history: Array(20).fill(168.30) },
      { id: 'META', name: 'Meta Platforms', category: 'US Tech', price: 502.10, change: 0, trend: 'up', history: Array(20).fill(502.10) },
      { id: 'NFLX', name: 'Netflix Inc.', category: 'US Tech', price: 620.40, change: 0, trend: 'up', history: Array(20).fill(620.40) },
      
      // GPW (Polski rynek w wirtualnych PLN dla ułatwienia)
      { id: 'CDR', name: 'CD Projekt S.A.', category: 'GPW', price: 115.20, change: 0, trend: 'down', history: Array(20).fill(115.20) },
      { id: 'PKO', name: 'PKO BP', category: 'GPW', price: 58.40, change: 0, trend: 'up', history: Array(20).fill(58.40) },
      { id: 'PKN', name: 'Orlen S.A.', category: 'GPW', price: 66.80, change: 0, trend: 'down', history: Array(20).fill(66.80) },
      { id: 'DNP', name: 'Dino Polska', category: 'GPW', price: 380.00, change: 0, trend: 'up', history: Array(20).fill(380.00) },
      { id: 'ALE', name: 'Allegro', category: 'GPW', price: 32.50, change: 0, trend: 'up', history: Array(20).fill(32.50) },
      { id: 'LPP', name: 'LPP S.A.', category: 'GPW', price: 16500.00, change: 0, trend: 'up', history: Array(20).fill(16500.00) },

      // Kryptowaluty
      { id: 'BTC', name: 'Bitcoin', category: 'Krypto', price: 275000.00, change: 0, trend: 'up', history: Array(20).fill(275000.00) },
      { id: 'ETH', name: 'Ethereum', category: 'Krypto', price: 14500.00, change: 0, trend: 'up', history: Array(20).fill(14500.00) },
      { id: 'SOL', name: 'Solana', category: 'Krypto', price: 620.00, change: 0, trend: 'down', history: Array(20).fill(620.00) },

      // Surowce
      { id: 'GOLD', name: 'Gold (Ounce)', category: 'Surowce', price: 9500.00, change: 0, trend: 'up', history: Array(20).fill(9500.00) },
      { id: 'OIL', name: 'Crude Oil', category: 'Surowce', price: 340.00, change: 0, trend: 'down', history: Array(20).fill(340.00) },

      // ETF
      { id: 'SPY', name: 'S&P 500 ETF', category: 'ETF', price: 2050.00, change: 0, trend: 'up', history: Array(20).fill(2050.00) },
      { id: 'QQQ', name: 'Nasdaq 100 ETF', category: 'ETF', price: 1800.00, change: 0, trend: 'up', history: Array(20).fill(1800.00) },
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
    // Update prices every 3 seconds
    setInterval(() => {
      let currentNews = null;

      // 5% szans na wygenerowanie newsa w danej "turze"
      if (Math.random() < 0.05) {
        const randomStock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
        const isPositive = Math.random() > 0.5;
        const effect = (Math.random() * 0.04) + 0.02; // Zmiana o 2% do 6%

        currentNews = {
          id: Date.now().toString(),
          stockId: randomStock.id,
          message: isPositive 
            ? `Dobre wieści dla ${randomStock.name}! Akcje idą w górę.`
            : `Problemy w ${randomStock.name}. Inwestorzy reagują wyprzedażą.`,
          isPositive
        };

        // Natychmiastowy wpływ na cenę
        randomStock.price = randomStock.price * (1 + (isPositive ? effect : -effect));
      }

      this.stocks = this.stocks.map(stock => {
        const volatility = stock.category === 'Krypto' ? 0.008 : (stock.category === 'ETF' ? 0.002 : 0.005);
        const changePercent = (Math.random() * volatility * 2) - volatility;
        
        const oldPrice = stock.price;
        const newPrice = oldPrice * (1 + changePercent);
        
        const newHistory = [...stock.history, newPrice].slice(-20);
        
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number((newPrice - oldPrice).toFixed(2)),
          trend: newPrice >= oldPrice ? 'up' : 'down',
          history: newHistory
        };
      });

      this.notify(currentNews);
    }, 3000);
  }
}

export const marketService = new MarketService();
