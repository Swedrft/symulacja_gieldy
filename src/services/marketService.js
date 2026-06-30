class MarketService {
  constructor() {
    this.stocks = [
      // US Tech
      { id: 'AAPL', name: 'Apple Inc.', category: 'US Tech', price: 215.30, change: 0, trend: 'up', history: [] },
      { id: 'MSFT', name: 'Microsoft Corp.', category: 'US Tech', price: 440.50, change: 0, trend: 'up', history: [] },
      { id: 'NVDA', name: 'NVIDIA Corp.', category: 'US Tech', price: 125.40, change: 0, trend: 'up', history: [] },
      { id: 'GOOGL', name: 'Alphabet Inc.', category: 'US Tech', price: 185.20, change: 0, trend: 'up', history: [] },
      { id: 'AMZN', name: 'Amazon.com', category: 'US Tech', price: 188.90, change: 0, trend: 'up', history: [] },
      { id: 'META', name: 'Meta Platforms', category: 'US Tech', price: 512.40, change: 0, trend: 'up', history: [] },
      { id: 'TSLA', name: 'Tesla Inc.', category: 'US Tech', price: 195.80, change: 0, trend: 'down', history: [] },
      { id: 'NFLX', name: 'Netflix Inc.', category: 'US Tech', price: 670.40, change: 0, trend: 'up', history: [] },
      { id: 'AMD', name: 'Advanced Micro Devices', category: 'US Tech', price: 160.20, change: 0, trend: 'up', history: [] },
      { id: 'INTC', name: 'Intel Corp.', category: 'US Tech', price: 30.50, change: 0, trend: 'down', history: [] },
      { id: 'UBER', name: 'Uber Technologies', category: 'US Tech', price: 71.30, change: 0, trend: 'up', history: [] },
      { id: 'ABNB', name: 'Airbnb Inc.', category: 'US Tech', price: 152.10, change: 0, trend: 'up', history: [] },
      
      // US Other (S&P 500)
      { id: 'KO', name: 'Coca-Cola Co.', category: 'US Inne', price: 62.50, change: 0, trend: 'up', history: [] },
      { id: 'PEP', name: 'PepsiCo Inc.', category: 'US Inne', price: 168.40, change: 0, trend: 'up', history: [] },
      { id: 'MCD', name: 'McDonald\'s Corp.', category: 'US Inne', price: 260.80, change: 0, trend: 'down', history: [] },
      { id: 'JNJ', name: 'Johnson & Johnson', category: 'US Inne', price: 148.90, change: 0, trend: 'up', history: [] },
      { id: 'JPM', name: 'JPMorgan Chase', category: 'US Inne', price: 202.10, change: 0, trend: 'up', history: [] },
      { id: 'V', name: 'Visa Inc.', category: 'US Inne', price: 275.40, change: 0, trend: 'up', history: [] },
      { id: 'WMT', name: 'Walmart Inc.', category: 'US Inne', price: 68.20, change: 0, trend: 'up', history: [] },
      { id: 'DIS', name: 'Walt Disney Co.', category: 'US Inne', price: 102.30, change: 0, trend: 'down', history: [] },
      
      // GPW 
      { id: 'CDR', name: 'CD Projekt S.A.', category: 'GPW', price: 151.20, change: 0, trend: 'up', history: [] },
      { id: 'PKO', name: 'PKO BP', category: 'GPW', price: 58.40, change: 0, trend: 'up', history: [] },
      { id: 'PKN', name: 'Orlen S.A.', category: 'GPW', price: 66.80, change: 0, trend: 'down', history: [] },
      { id: 'DNP', name: 'Dino Polska', category: 'GPW', price: 412.00, change: 0, trend: 'up', history: [] },
      { id: 'ALE', name: 'Allegro', category: 'GPW', price: 37.50, change: 0, trend: 'up', history: [] },
      { id: 'LPP', name: 'LPP S.A.', category: 'GPW', price: 16500.00, change: 0, trend: 'up', history: [] },
      { id: 'KGH', name: 'KGHM Polska Miedź', category: 'GPW', price: 145.20, change: 0, trend: 'up', history: [] },
      { id: 'PZU', name: 'PZU S.A.', category: 'GPW', price: 51.10, change: 0, trend: 'down', history: [] },
      { id: 'MBK', name: 'mBank S.A.', category: 'GPW', price: 620.50, change: 0, trend: 'up', history: [] },
      { id: 'ZAB', name: 'Żabka Group', category: 'GPW', price: 22.30, change: 0, trend: 'up', history: [] },

      // Kryptowaluty
      { id: 'BTC', name: 'Bitcoin', category: 'Krypto', price: 255000.00, change: 0, trend: 'up', history: [] },
      { id: 'ETH', name: 'Ethereum', category: 'Krypto', price: 13500.00, change: 0, trend: 'up', history: [] },
      { id: 'SOL', name: 'Solana', category: 'Krypto', price: 620.00, change: 0, trend: 'down', history: [] },
      { id: 'BNB', name: 'Binance Coin', category: 'Krypto', price: 2400.00, change: 0, trend: 'up', history: [] },
      { id: 'DOGE', name: 'Dogecoin', category: 'Krypto', price: 0.65, change: 0, trend: 'down', history: [] },

      // Surowce
      { id: 'GOLD', name: 'Złoto (Uncja)', category: 'Surowce', price: 9500.00, change: 0, trend: 'up', history: [] },
      { id: 'SILV', name: 'Srebro (Uncja)', category: 'Surowce', price: 125.00, change: 0, trend: 'up', history: [] },
      { id: 'OIL', name: 'Ropa WTI', category: 'Surowce', price: 340.00, change: 0, trend: 'down', history: [] },

      // ETF
      { id: 'SPY', name: 'S&P 500 ETF', category: 'ETF', price: 2050.00, change: 0, trend: 'up', history: [] },
      { id: 'QQQ', name: 'Nasdaq 100 ETF', category: 'ETF', price: 1800.00, change: 0, trend: 'up', history: [] },
      { id: 'VTI', name: 'Vanguard Total Stock', category: 'ETF', price: 1100.00, change: 0, trend: 'up', history: [] },

      // Lotnictwo
      { id: 'BA', name: 'Boeing Co.', category: 'Lotnictwo', price: 210.50, change: 0, trend: 'up', history: [] },
      { id: 'AIR', name: 'Airbus SE', category: 'Lotnictwo', price: 165.20, change: 0, trend: 'up', history: [] },
      { id: 'DAL', name: 'Delta Air Lines', category: 'Lotnictwo', price: 50.80, change: 0, trend: 'up', history: [] },
      { id: 'RYA', name: 'Ryanair Holdings', category: 'Lotnictwo', price: 21.40, change: 0, trend: 'up', history: [] },
      { id: 'LHA', name: 'Lufthansa', category: 'Lotnictwo', price: 7.50, change: 0, trend: 'down', history: [] },

      // Motoryzacja
      { id: 'TM', name: 'Toyota Motor Corp.', category: 'Motoryzacja', price: 240.10, change: 0, trend: 'up', history: [] },
      { id: 'VOW3', name: 'Volkswagen AG', category: 'Motoryzacja', price: 115.30, change: 0, trend: 'down', history: [] },
      { id: 'F', name: 'Ford Motor Co.', category: 'Motoryzacja', price: 12.40, change: 0, trend: 'up', history: [] },
      { id: 'BMW', name: 'BMW AG', category: 'Motoryzacja', price: 105.60, change: 0, trend: 'up', history: [] },
      { id: 'RACE', name: 'Ferrari N.V.', category: 'Motoryzacja', price: 395.20, change: 0, trend: 'up', history: [] },
    ];
    
    this.newsHistory = [];
    this.listeners = [];

    this.preGenerateHistoryAndFinancials();
    this.startSimulation();
  }

  // Generujemy około 180 punktów w tył symulując "Hossę i Bessę" oraz dane fundamentalne
  preGenerateHistoryAndFinancials() {
    this.stocks.forEach(stock => {
      let currentSimulatedPrice = stock.price;
      const volatility = stock.category === 'Krypto' ? 0.02 : (stock.category === 'ETF' ? 0.005 : 0.015);
      
      // Historia (Random walk with momentum)
      let momentum = 0;
      let minPrice = stock.price;
      let maxPrice = stock.price;

      for (let i = 0; i < 1000; i++) {
        momentum += (Math.random() - 0.5) * 0.005;
        if (momentum > 0.02) momentum = 0.02;
        if (momentum < -0.02) momentum = -0.02;

        const dailyChange = (Math.random() - 0.5) * volatility + momentum;
        currentSimulatedPrice = currentSimulatedPrice * (1 + dailyChange);
        stock.history.unshift(Number(currentSimulatedPrice.toFixed(2)));
        
        if (currentSimulatedPrice > maxPrice) maxPrice = currentSimulatedPrice;
        if (currentSimulatedPrice < minPrice) minPrice = currentSimulatedPrice;
      }
      
      stock.price = stock.history[stock.history.length - 1]; 
      
      // --- Dane Fundamentalne (Mocki) ---
      const sharesOutstanding = Math.floor(Math.random() * 5000000000) + 100000000; // Ilość akcji
      const marketCap = stock.price * sharesOutstanding;
      
      // Finanse na przestrzeni 5 lat (2022-2026)
      const isProfitable = Math.random() > 0.1; // 90% firm zarabia
      const margin = isProfitable ? (Math.random() * 0.25 + 0.05) : -(Math.random() * 0.15 + 0.05);
      
      let baseRevenue = marketCap / (Math.random() * 5 + 1); // Przychód zależny od kapitalizacji (P/S ratio)
      const financials = [];
      const years = [2022, 2023, 2024, 2025, 2026];
      
      for (let i = 0; i < 5; i++) {
         const yearGrowth = (Math.random() * 0.2) - 0.05; // -5% do +15% rocznie
         baseRevenue = baseRevenue * (1 + yearGrowth);
         const operatingIncome = baseRevenue * margin * (1 + (Math.random()*0.1 - 0.05));
         const operatingCost = baseRevenue - operatingIncome;
         
         financials.push({
           year: years[i],
           revenue: Number(baseRevenue.toFixed(0)),
           operatingCost: Number(operatingCost.toFixed(0)),
           operatingIncome: Number(operatingIncome.toFixed(0))
         });
      }

      // Podsumowanie Statystyk
      const eps = financials[4].operatingIncome / sharesOutstanding;
      const peRatio = eps > 0 ? stock.price / eps : 0;
      const volume = Math.floor(Math.random() * sharesOutstanding * 0.01); // 1% akcji dziennie

      // Rekomendacja Analityków (od 1 do 5)
      // 1: Zdecydowanie sprzedawaj, 2: Sprzedawaj, 3: Trzymaj, 4: Kupuj, 5: Zdecydowanie Kupuj
      let recommendationScore = 3;
      if (eps > 0 && peRatio < 20) recommendationScore += 1;
      if (eps > 0 && peRatio < 10) recommendationScore += 1;
      if (stock.trend === 'up') recommendationScore += 1;
      if (eps < 0) recommendationScore -= 1;
      if (stock.trend === 'down') recommendationScore -= 1;
      
      recommendationScore = Math.max(1, Math.min(5, recommendationScore));
      
      const recommendationsText = {
        1: 'Zdecydowanie sprzedawaj',
        2: 'Sprzedawaj',
        3: 'Trzymaj',
        4: 'Kupuj',
        5: 'Zdecydowanie kupuj'
      };

      stock.fundamentals = {
        min52Week: Number(minPrice.toFixed(2)),
        max52Week: Number(maxPrice.toFixed(2)),
        marketCap: Number(marketCap.toFixed(0)),
        volume: volume,
        eps: Number(eps.toFixed(2)),
        peRatio: Number(peRatio.toFixed(2)),
        dividendYield: (stock.category === 'GPW' || stock.category === 'US Tech' || stock.category === 'US Inne') ? Number((Math.random() * 4).toFixed(2)) : 0,
        financials: financials,
        recommendation: {
          score: recommendationScore,
          text: recommendationsText[recommendationScore],
          analystsCount: Math.floor(Math.random() * 50) + 10
        }
      };
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
    setInterval(() => {
      let currentNews = null;
      let dividendEvent = null;

      if (Math.random() < 0.05) {
        const randomStock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
        const isPositive = Math.random() > 0.5;
        const effect = (Math.random() * 0.04) + 0.02;

        const positiveTemplates = [
          `Dobre wieści dla ${randomStock.name}! Raport finansowy przerósł oczekiwania.`,
          `Firma ${randomStock.name} ogłasza przełomową technologię. Akcje szybują w górę!`,
          `Nowy duży kontrakt dla ${randomStock.name} podpisany. Inwestorzy świętują.`,
          `Zarząd ${randomStock.name} podnosi prognozy zysków na ten rok.`,
          `Fuzja na horyzoncie? Silne wzrosty na akcjach ${randomStock.name}.`,
          `Świetne wyniki sprzedaży ${randomStock.name} w ostatnim kwartale.`,
          `Analitycy podnoszą rekomendację dla ${randomStock.name} do 'Zdecydowanie Kupuj'.`
        ];

        const negativeTemplates = [
          `Problemy w ${randomStock.name}. Inwestorzy reagują nagłą wyprzedażą.`,
          `Afera w zarządzie ${randomStock.name}. Akcje tracą na wartości.`,
          `Słabsze niż oczekiwano wyniki finansowe ciągną ${randomStock.name} w dół.`,
          `Problemy z łańcuchem dostaw uderzają w zyski ${randomStock.name}.`,
          `Nowe regulacje mogą zaszkodzić modelowi biznesowemu ${randomStock.name}.`,
          `Opóźnienia w premierze kluczowego produktu ${randomStock.name}.`,
          `Agencja ratingowa obniża ocenę dla ${randomStock.name}.`
        ];

        const message = isPositive 
          ? positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)]
          : negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];

        currentNews = {
          id: Date.now().toString(),
          stockId: randomStock.id,
          message: message,
          isPositive,
          date: new Date().toISOString()
        };
        randomStock.price = randomStock.price * (1 + (isPositive ? effect : -effect));
      }

      if (Math.random() < 0.01) {
        const dividendStocks = this.stocks.filter(s => s.fundamentals.dividendYield > 0);
        if (dividendStocks.length > 0) {
          const divStock = dividendStocks[Math.floor(Math.random() * dividendStocks.length)];
          const dividendPerShare = Number((divStock.price * (divStock.fundamentals.dividendYield / 100)).toFixed(2));
          
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
        
        const newHistory = [...stock.history, newPrice].slice(-1000);
        
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
