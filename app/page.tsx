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
  }, []);

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
        [crypto]: prev[crypto as keyof Portfolio] + qty
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
        [crypto]: prev[crypto as keyof Portfolio] - qty
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
        <h1 className="text-5xl font-bold text-center mb-8 text-green-400">🚀 CRYPTO LAND</h1>
        <p className="text-center mb-8 text-xl">Master Jason the 13th best developer in Australia — Mine. Trade. Dominate.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-xl border border-green-500/30">
            <div className="text-green-400">Balance</div>
            <div className="text-3xl font-mono">${balance.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-green-500/30">
            <div className="text-green-400">Net Worth</div>
            <div className="text-3xl font-mono">${totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-green-500/30">
            <div className="text-green-400">Mining Level</div>
            <div className="text-3xl font-mono">Avg {Object.values(miningPower).reduce((a,b)=>a+b,0)/3}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mining Section */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-green-500/20">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">⛏️ Mining Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cryptos.map(crypto => (
                <div key={crypto} className="bg-slate-800 p-6 rounded-xl">
                  <div className="flex justify-between mb-4">
                    <span className="text-xl font-bold">{crypto}</span>
                    <span className="font-mono text-green-400">${prices[crypto].toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => mineCrypto(crypto as keyof Portfolio)}
                    className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold mb-3 transition"
                  >
                    MINE {crypto}
                  </button>
                  <div className="text-sm mb-2">Held: {portfolio[crypto as keyof Portfolio].toFixed(4)}</div>
                  <button
                    onClick={() => upgradeMining(crypto as keyof Portfolio)}
                    className="w-full bg-amber-600 hover:bg-amber-500 py-2 rounded-lg text-sm transition"
                  >
                    Upgrade (Cost: ${ (1000 * miningPower[crypto as keyof Portfolio]).toLocaleString() })
                  </button>
                  <div className="text-xs mt-1 text-slate-400">Power: {miningPower[crypto as keyof Portfolio]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Section */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-green-500/20">
            <h2 className="text-3xl font-bold mb-6">📈 Live Trading</h2>
            
            <div className="mb-6">
              <select 
                value={selectedCrypto} 
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="bg-slate-800 p-3 rounded-lg w-full text-lg mb-4"
              >
                {cryptos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="text-4xl font-mono text-green-400 mb-4">${prices[selectedCrypto].toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <input 
                  type="number" 
                  id="buyAmount"
                  placeholder="USD Amount" 
                  className="bg-slate-800 p-4 rounded-lg w-full mb-2 text-lg"
                  defaultValue="100"
                />
                <button 
                  onClick={() => {
                    const amt = parseFloat((document.getElementById('buyAmount') as HTMLInputElement).value) || 100;
                    buyCrypto(selectedCrypto, amt);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold"
                >
                  BUY
                </button>
              </div>
              <div>
                <input 
                  type="number" 
                  id="sellQty"
                  placeholder="Quantity" 
                  step="0.001"
                  className="bg-slate-800 p-4 rounded-lg w-full mb-2 text-lg"
                  defaultValue="0.1"
                />
                <button 
                  onClick={() => {
                    const qty = parseFloat((document.getElementById('sellQty') as HTMLInputElement).value) || 0.1;
                    sellCrypto(selectedCrypto, qty);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 py-4 rounded-xl font-bold"
                >
                  SELL
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
        <div className="mt-8 bg-slate-900 p-8 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">💼 Your Portfolio</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4">Crypto</th>
                  <th className="text-right py-4">Amount</th>
                  <th className="text-right py-4">Price</th>
                  <th className="text-right py-4">Value</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map(crypto => {
                  const amt = portfolio[crypto as keyof Portfolio];
                  const value = amt * prices[crypto];
                  return (
                    <tr key={crypto} className="border-b border-slate-800 last:border-0">
                      <td className="py-4 font-bold">{crypto}</td>
                      <td className="py-4 text-right font-mono">{amt.toFixed(4)}</td>
                      <td className="py-4 text-right font-mono">${prices[crypto].toLocaleString()}</td>
                      <td className="py-4 text-right font-mono text-green-400">${value.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoLand;
