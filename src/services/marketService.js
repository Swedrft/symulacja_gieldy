class MarketService {
  constructor() {
    this.stocks = [
      // US Tech
      { id: 'AAPL', name: 'Apple Inc.', category: 'US Tech', price: 175.50, change: 0, trend: 'up', history: [] },
      { id: 'MSFT', name: 'Microsoft Corp.', category: 'US Tech', price: 410.20, change: 0, trend: 'up', history: [] },
      { id: 'TSLA', name: 'Tesla Inc.', category: 'US Tech', price: 190.80, change: 0, trend: 'down', history: [] },
      { id: 'NVDA', name: 'NVIDIA Corp.', category: 'US Tech', price: 880.10, change: 0, trend: 'up', history: [] },
      { id: 'AMZN', name: 'Amazon.com', category: 'US Tech', price: 178.90, change: 0, trend: 'up', history: [] },
      { id: 'GOOGL', name: 'Alphabet Inc.', category: 'US Tech', price: 168.30, change: 0, trend: 'up', history: [] },
      { id: 'META', name: 'Meta Platforms', category: 'US Tech', price: 502.10, change: 0, trend: 'up', history: [] },
      { id: 'NFLX', name: 'Netflix Inc.', category: 'US Tech', price: 620.40, change: 0, trend: 'up', history: [] },
      
      // GPW 
      { id: 'CDR', name: 'CD Projekt S.A.', category: 'GPW', price: 115.20, change: 0, trend: 'down', history: [] },
      { id: 'PKO', name: 'PKO BP', category: 'GPW', price: 58.40, change: 0, trend: 'up', history: [] },
      { id: 'PKN', name: 'Orlen S.A.', category: 'GPW', price: 66.80, change: 0, trend: 'down', history: [] },
      { id: 'DNP', name: 'Dino Polska', category: 'GPW', price: 380.00, change: 0, trend: 'up', history: [] },
      { id: 'ALE', name: 'Allegro', category: 'GPW', price: 32.50, change: 0, trend: 'up', history: [] },
      { id: 'LPP', name: 'LPP S.A.', category: 'GPW', price: 16500.00, change: 0, trend: 'up', history: [] },

      // Kryptowaluty
      { id: 'BTC', name: 'Bitcoin', category: 'Krypto', price: 275000.00, change: 0, trend: 'up', history: [] },
      { id: 'ETH', name: 'Ethereum', category: 'Krypto', price: 14500.00, change: 0, trend: 'up', history: [] },
      { id: 'SOL', name: 'Solana', category: 'Krypto', price: 620.00, change: 0, trend: 'down', history: [] },

      // Surowce
      { id: 'GOLD', name: 'Gold (Ounce)', category: 'Surowce', price: 9500.00, change: 0, trend: 'up', history: [] },
      { id: 'OIL', name: 'Crude Oil', category: 'Surowce', price: 340.00, change: 0, trend: 'down', history: [] },

      // ETF
      { id: 'SPY', name: 'S&P 500 ETF', category: 'ETF', price: 2050.00, change: 0, trend: 'up', history: [] },
      { id: 'QQQ', name: 'Nasdaq 100 ETF', category: 'ETF', price: 1800.00, change: 0, trend: 'up', history: [] },
    ];
    
    this.newsHistory = [];
    this.listeners = [];

    this.preGenerateHistory();
    this.startSimulation();
  }

  // Generujemy około 180 punktów w tył symulując "Hossę i Bessę"
  preGenerateHistory() {
    this.stocks.forEach(stock => {
      let currentSimulatedPrice = stock.price;
      const volatility = stock.category === 'Krypto' ? 0.02 : (stock.category === 'ETF' ? 0.005 : 0.015);
      
      // Duży trend generowany przez random walk z momentum
      let momentum = 0;

      for (let i = 0; i < 180; i++) {
        momentum += (Math.random() - 0.5) * 0.005; // Powolna zmiana trendu głównego
        if (momentum > 0.02) momentum = 0.02;
        if (momentum < -0.02) momentum = -0.02;

        const dailyChange = (Math.random() - 0.5) * volatility + momentum;
        currentSimulatedPrice = currentSimulatedPrice * (1 + dailyChange);
        stock.history.unshift(Number(currentSimulatedPrice.toFixed(2))); // Dodajemy na początek
      }
      
      // Na końcu i tak lądujemy na current "price" z definicji
      stock.price = stock.history[stock.history.length - 1]; 
    });
  }

  getStocks() {
    return this.stocks;
  }

  getStock(id) {
    return this.stocks.find(s => s.id === id);
  }

  getNewsHistory() {
    return this.newsHistory;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(currentNews = null, dividendEvent = null) {
    if (currentNews) {
      this.newsHistory.unshift(currentNews);
      if (this.newsHistory.length > 50) this.newsHistory.pop();
    }
    this.listeners.forEach(listener => listener([...this.stocks], currentNews, this.newsHistory, dividendEvent));
  }

  startSimulation() {
    // Update prices every 3 seconds
    setInterval(() => {
      let currentNews = null;
      let dividendEvent = null;

      // 5% szans na News
      if (Math.random() < 0.05) {
        const randomStock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
        const isPositive = Math.random() > 0.5;
        const effect = (Math.random() * 0.04) + 0.02; // Zmiana o 2% do 6%

        currentNews = {
          id: Date.now().toString(),
          stockId: randomStock.id,
          message: isPositive 
            ? `Dobre wieści dla ${randomStock.name}! Raport finansowy przerósł oczekiwania.`
            : `Problemy w ${randomStock.name}. Inwestorzy reagują nagłą wyprzedażą.`,
          isPositive,
          date: new Date().toISOString()
        };
        randomStock.price = randomStock.price * (1 + (isPositive ? effect : -effect));
      }

      // 1% szans na Dywidendę ze spółek GPW / US Tech (nie ETF i nie Krypto)
      if (Math.random() < 0.01) {
        const dividendStocks = this.stocks.filter(s => s.category === 'GPW' || s.category === 'US Tech');
        if (dividendStocks.length > 0) {
          const divStock = dividendStocks[Math.floor(Math.random() * dividendStocks.length)];
          const dividendPerShare = Number((divStock.price * 0.02).toFixed(2)); // 2% yield
          
          dividendEvent = {
            stockId: divStock.id,
            dividendPerShare,
            message: `Zarząd ${divStock.name} ogłosił wypłatę dywidendy w wysokości ${dividendPerShare} PLN na akcję!`
          };
          
          currentNews = {
            id: Date.now().toString() + 'div',
            stockId: divStock.id,
            message: dividendEvent.message,
            isPositive: true,
            date: new Date().toISOString()
          };
        }
      }

      this.stocks = this.stocks.map(stock => {
        const volatility = stock.category === 'Krypto' ? 0.008 : (stock.category === 'ETF' ? 0.002 : 0.005);
        const changePercent = (Math.random() * volatility * 2) - volatility;
        
        const oldPrice = stock.price;
        const newPrice = oldPrice * (1 + changePercent);
        
        // Zaktualizuj historię (zachowaj max 180 elementów czyli 6 miesięcy)
        const newHistory = [...stock.history, newPrice].slice(-180);
        
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number((newPrice - oldPrice).toFixed(2)),
          trend: newPrice >= oldPrice ? 'up' : 'down',
          history: newHistory
        };
      });

      this.notify(currentNews, dividendEvent);
    }, 3000);
  }
}

export const marketService = new MarketService();
