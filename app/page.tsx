'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Portfolio {
  BTC: number;
  ETH: number;
  SOL: number;
}

const CryptoLand = () => {
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<Portfolio>({ BTC: 0, ETH: 0, SOL: 0 });
  const [miningPower, setMiningPower] = useState<Portfolio>({ BTC: 1, ETH: 1, SOL: 1 });
  const [prices, setPrices] = useState<{ [key: string]: number }>({ BTC: 65000, ETH: 3500, SOL: 150 });
  const [priceHistory, setPriceHistory] = useState<{ [key: string]: number[] }>({
    BTC: Array(20).fill(65000),
    ETH: Array(20).fill(3500),
    SOL: Array(20).fill(150),
  });
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  const cryptos = ['BTC', 'ETH', 'SOL'];

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrices = { ...prev };
        const newHistory = { ...priceHistory };

        cryptos.forEach(crypto => {
          const volatility = crypto === 'BTC' ? 800 : crypto === 'ETH' ? 100 : 15;
          const change = (Math.random() - 0.5) * volatility;
          newPrices[crypto] = Math.max(10, Math.round((newPrices[crypto] + change) * 100) / 100);

          newHistory[crypto] = [...(newHistory[crypto] || []).slice(1), newPrices[crypto]];
        });

        setPriceHistory(newHistory);
        return newPrices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [priceHistory]);

  const mineCrypto = (crypto: keyof Portfolio) => {
    const mined = miningPower[crypto] * (Math.random() * 0.01 + 0.001);
    setPortfolio(prev => ({
      ...prev,
      [crypto]: prev[crypto] + mined
    }));
    // Small reward
    setBalance(prev => prev + Math.random() * 5);
  };

  const upgradeMining = (crypto: keyof Portfolio) => {
    const cost = 1000 * miningPower[crypto];
    if (balance >= cost) {
      setBalance(prev => prev - cost);
      setMiningPower(prev => ({
        ...prev,
        [crypto]: prev[crypto] + 1
      }));
    } else {
      alert("Not enough balance!");
    }
  };

  const buyCrypto = (crypto: string, amountUSD: number) => {
    const price = prices[crypto];
    if (balance >= amountUSD) {
      const qty = amountUSD / price;
      setBalance(prev => prev - amountUSD);
      setPortfolio(prev => ({
        ...prev,
        [crypto as keyof Portfolio]: prev[crypto as keyof Portfolio] + qty
      }));
    } else {
      alert("Insufficient funds!");
    }
  };

  const sellCrypto = (crypto: string, qty: number) => {
    if (portfolio[crypto as keyof Portfolio] >= qty) {
      const proceeds = qty * prices[crypto];
      setBalance(prev => prev + proceeds);
      setPortfolio(prev => ({
        ...prev,
        [crypto as keyof Portfolio]: prev[crypto as keyof Portfolio] - qty
      }));
    } else {
      alert("Not enough in portfolio!");
    }
  };

  const totalValue = balance + Object.keys(portfolio).reduce((sum, key) => {
    return sum + portfolio[key as keyof Portfolio] * prices[key];
  }, 0);

  const chartData = {
    labels: Array.from({ length: 20 }, (_, i) => `T-${19-i}`),
    datasets: [{
      label: `${selectedCrypto} Price`,
      data: priceHistory[selectedCrypto],
      borderColor: '#22c55e',
      tension: 0.4,
    }]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-green-500/50">⛏️</div>
            <h1 className="text-7xl font-black tracking-tighter neon-green">CRYPTO LAND</h1>
          </div>
          <p className="text-center text-xl text-slate-400 max-w-md">The ultimate MT Ecosystem simulation</p>
          <div className="mt-3 text-sm text-slate-500 flex items-center gap-2">
            POWERED BY THE MT ECOSYSTEM • MADE BY FUTURET3CH & MEMETORRENT
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-3xl border border-green-500/30 crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-400 text-sm tracking-widest">USD BALANCE</div>
                <div className="text-4xl font-mono font-semibold mt-1">${balance.toLocaleString()}</div>
              </div>
              <div className="text-5xl opacity-20">💵</div>
            </div>
          </div>
          <div className="glass p-6 rounded-3xl border border-emerald-500/30 crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-400 text-sm tracking-widest">NET WORTH</div>
                <div className="text-4xl font-mono font-semibold mt-1 text-emerald-400">${totalValue.toLocaleString()}</div>
              </div>
              <div className="text-5xl opacity-20">📈</div>
            </div>
          </div>
          <div className="glass p-6 rounded-3xl border border-amber-500/30 crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-400 text-sm tracking-widest">AVG MINING POWER</div>
                <div className="text-4xl font-mono font-semibold mt-1">{(Object.values(miningPower).reduce((a,b)=>a+b,0)/3).toFixed(1)}</div>
              </div>
              <div className="text-5xl opacity-20">⚡</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mining Section */}
          <div className="glass p-8 rounded-3xl border border-green-500/20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 neon-green">⛏️ MT MINING RIGS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cryptos.map(crypto => (
                <div key={crypto} className="crypto-card glass p-6 rounded-2xl border border-green-500/30">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-3xl font-bold tracking-tighter">{crypto}</div>
                      <div className="font-mono text-emerald-400 text-xl">${prices[crypto].toLocaleString()}</div>
                    </div>
                    <div className="text-6xl opacity-30">⛏️</div>
                  </div>
                  
                  <button
                    onClick={() => mineCrypto(crypto as keyof Portfolio)}
                    className="mining-btn w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 py-4 rounded-2xl font-bold text-lg mb-4 shadow-lg shadow-emerald-500/40 transition-all active:scale-95"
                  >
                    MINE {crypto} ⚡
                  </button>
                  
                  <div className="flex justify-between text-sm mb-4 bg-slate-950/50 p-3 rounded-xl">
                    <span>Held:</span>
                    <span className="font-mono text-emerald-400">{portfolio[crypto as keyof Portfolio].toFixed(6)}</span>
                  </div>
                  
                  <button
                    onClick={() => upgradeMining(crypto as keyof Portfolio)}
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  >
                    UPGRADE RIG → Power: {miningPower[crypto as keyof Portfolio]} (Cost: ${(1000 * miningPower[crypto as keyof Portfolio]).toLocaleString()})
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Section */}
          <div className="glass p-8 rounded-3xl border border-emerald-500/20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 neon-green">📈 MT LIVE EXCHANGE</h2>
            
            <div className="mb-8">
              <div className="flex gap-3 mb-4">
                {cryptos.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCrypto(c)}
                    className={`flex-1 py-3 px-6 rounded-2xl font-mono transition-all ${selectedCrypto === c 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/50' 
                      : 'bg-slate-800 hover:bg-slate-700'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="text-5xl font-mono text-emerald-400 mb-2 tracking-tighter">${prices[selectedCrypto].toLocaleString()}</div>
              <div className="text-xs text-slate-500">LAST UPDATED JUST NOW • MT ECOSYSTEM</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="crypto-card">
                <div className="text-emerald-400 text-sm mb-2 tracking-widest">BUY ON MT EXCHANGE</div>
                <input 
                  type="number" 
                  id="buyAmount"
                  placeholder="Amount in USD" 
                  className="glass p-5 rounded-2xl w-full mb-3 text-xl font-mono border border-emerald-500/30 focus:border-emerald-400"
                  defaultValue="100"
                />
                <button 
                  onClick={() => {
                    const amt = parseFloat((document.getElementById('buyAmount') as HTMLInputElement).value) || 100;
                    buyCrypto(selectedCrypto, amt);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/50 active:scale-[0.985]"
                >
                  EXECUTE BUY
                </button>
              </div>
              <div className="crypto-card">
                <div className="text-rose-400 text-sm mb-2 tracking-widest">SELL ON MT EXCHANGE</div>
                <input 
                  type="number" 
                  id="sellQty"
                  placeholder="Quantity to sell" 
                  step="0.0001"
                  className="glass p-5 rounded-2xl w-full mb-3 text-xl font-mono border border-rose-500/30 focus:border-rose-400"
                  defaultValue="0.1"
                />
                <button 
                  onClick={() => {
                    const qty = parseFloat((document.getElementById('sellQty') as HTMLInputElement).value) || 0.1;
                    sellCrypto(selectedCrypto, qty);
                  }}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/50 active:scale-[0.985]"
                >
                  EXECUTE SELL
                </button>
              </div>
            </div>

            {/* Price Chart */}
            <div className="bg-slate-950 p-4 rounded-xl">
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="mt-8 glass p-8 rounded-3xl">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 neon-green">💼 MT PORTFOLIO VAULT</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-sm uppercase tracking-widest text-slate-400">
                  <th className="text-left py-5">Asset</th>
                  <th className="text-right py-5">Holdings</th>
                  <th className="text-right py-5">Market Price</th>
                  <th className="text-right py-5">Value (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cryptos.map(crypto => {
                  const amt = portfolio[crypto as keyof Portfolio];
                  const value = amt * prices[crypto];
                  return (
                    <tr key={crypto} className="hover:bg-slate-800/50 transition">
                      <td className="py-6 font-mono font-bold text-lg">{crypto}</td>
                      <td className="py-6 text-right font-mono text-emerald-400">{amt.toFixed(6)}</td>
                      <td className="py-6 text-right font-mono">${prices[crypto].toLocaleString()}</td>
                      <td className="py-6 text-right font-mono text-emerald-400 font-semibold">${value.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-center text-xs text-slate-500 mt-6">MT ECOSYSTEM • ALL RIGHTS RESERVED © FUTURET3CH & MEMETORRENT</div>
        </div>
      </div>
    </div>
  );
};

export default CryptoLand;