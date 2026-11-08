'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

type Coin = 'BTC' | 'ETH' | 'SOL';
type Bag = Record<Coin, number>;

const COINS: Coin[] = ['BTC', 'ETH', 'SOL'];

const LOOK: Record<Coin, { name: string; color: string; letter: string; vol: number; start: number }> = {
  BTC: { name: 'Bitcoin', color: '#f7931a', letter: 'B', vol: 480, start: 65000 },
  ETH: { name: 'Ether', color: '#8aa4ff', letter: 'E', vol: 55, start: 3500 },
  SOL: { name: 'Solana', color: '#14f195', letter: 'S', vol: 4.5, start: 150 },
};

const empty = (): Bag => ({ BTC: 0, ETH: 0, SOL: 0 });

export default function CryptoLand() {
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<Bag>(empty);
  const [power, setPower] = useState<Bag>({ BTC: 1, ETH: 1, SOL: 1 });
  const [prices, setPrices] = useState<Bag>({ BTC: 65000, ETH: 3500, SOL: 150 });
  const [history, setHistory] = useState<Record<Coin, number[]>>({
    BTC: Array(24).fill(65000),
    ETH: Array(24).fill(3500),
    SOL: Array(24).fill(150),
  });
  const [dirs, setDirs] = useState<Record<Coin, 'up' | 'down'>>({ BTC: 'up', ETH: 'up', SOL: 'up' });
  const [selected, setSelected] = useState<Coin>('BTC');
  const [live, setLive] = useState(true);
  const [buyAmt, setBuyAmt] = useState('250');
  const [sellPct, setSellPct] = useState('25');
  const [toast, setToast] = useState('');
  const [bursts, setBursts] = useState<{ id: number; coin: Coin; text: string }[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        const nextDir = { ...dirs };
        const ticks: Partial<Bag> = {};
        for (const coin of COINS) {
          const change = (Math.random() - 0.48) * LOOK[coin].vol;
          const value = Math.max(LOOK[coin].start * 0.15, Math.round((prev[coin] + change) * 100) / 100);
          next[coin] = value;
          ticks[coin] = value;
          nextDir[coin] = value >= prev[coin] ? 'up' : 'down';
        }
        setDirs(nextDir);
        setHistory((book) => {
          const copy = { ...book };
          for (const coin of COINS) copy[coin] = [...book[coin].slice(-23), ticks[coin] as number];
          return copy;
        });
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
    // dirs is read only to seed the first paint; the tick replaces it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  function mine(coin: Coin, manual: boolean) {
    const mined = power[coin] * (manual ? Math.random() * 0.012 + 0.002 : Math.random() * 0.003 + 0.0005);
    setPortfolio((bag) => ({ ...bag, [coin]: bag[coin] + mined }));
    if (manual) setBalance((cash) => cash + Math.random() * 6 + 1);
    const id = Date.now() + Math.random();
    setBursts((list) => [...list.slice(-10), { id, coin, text: `+${mined.toFixed(4)}` }]);
    setTimeout(() => setBursts((list) => list.filter((item) => item.id !== id)), 900);
  }

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const coin = COINS[Math.floor(Math.random() * COINS.length)];
      mine(coin, false);
    }, 1600);
    return () => clearInterval(id);
  }, [live, power]);

  function upgrade(coin: Coin) {
    const cost = 1000 * power[coin];
    if (balance < cost) {
      setToast('Not enough cash for that rig.');
      return;
    }
    setBalance((cash) => cash - cost);
    setPower((rigs) => ({ ...rigs, [coin]: rigs[coin] + 1 }));
  }

  function buy(coin: Coin, usd: number) {
    if (!usd || usd <= 0) return;
    if (balance < usd) {
      setToast('Not enough cash for that buy.');
      return;
    }
    const qty = usd / prices[coin];
    setBalance((cash) => cash - usd);
    setPortfolio((bag) => ({ ...bag, [coin]: bag[coin] + qty }));
    setToast(`Bought ${qty.toFixed(4)} ${coin}`);
  }

  function sell(coin: Coin, fraction: number) {
    const qty = portfolio[coin] * fraction;
    if (qty <= 0) {
      setToast(`No ${coin} in the vault.`);
      return;
    }
    setPortfolio((bag) => ({ ...bag, [coin]: bag[coin] - qty }));
    setBalance((cash) => cash + qty * prices[coin]);
    setToast(`Sold ${qty.toFixed(4)} ${coin}`);
  }

  const worth = balance + COINS.reduce((sum, coin) => sum + portfolio[coin] * prices[coin], 0);
  const avgPower = COINS.reduce((sum, coin) => sum + power[coin], 0) / 3;
  const color = LOOK[selected].color;

  const chart = useMemo(
    () => ({
      labels: history[selected].map((_, i) => `${i}`),
      datasets: [
        {
          data: history[selected],
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [history, selected, color],
  );

  return (
    <div className="land">
      <div className="land-bg" />
      <main className="shell">
        <header className="top">
          <div className="brand">
            <img src="/t3x-mark.png" alt="" className="mark" />
            <div>
              <h1>Crypto Land</h1>
              <p>Mine the night city. Trade the live book.</p>
            </div>
          </div>
          <button className={`live-toggle ${live ? 'on' : ''}`} onClick={() => setLive((on) => !on)}>
            <i className="pulse" />
            <strong>{live ? 'RIGS LIVE' : 'RIGS IDLE'}</strong>
            <span>{live ? 'hashing' : 'paused'}</span>
          </button>
        </header>

        <div className="tape" aria-hidden="true">
          {COINS.map((coin) => (
            <b key={coin} className={dirs[coin]}>
              {coin} ${prices[coin].toLocaleString()} {dirs[coin] === 'up' ? '▲' : '▼'}
            </b>
          ))}
        </div>

        <section className="stats">
          <article className="stat">
            <small>CASH</small>
            <strong>${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </article>
          <article className="stat">
            <small>NET WORTH</small>
            <strong>${worth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </article>
          <article className="stat">
            <small>AVG RIG POWER</small>
            <strong>{avgPower.toFixed(1)}</strong>
          </article>
        </section>

        <section className="floor">
          <article className="panel">
            <h2>Mining floor</h2>
            <div className="rigs">
              {COINS.map((coin) => {
                const cost = 1000 * power[coin];
                return (
                  <div key={coin} className="rig" style={{ ['--coin' as string]: LOOK[coin].color }}>
                    {bursts
                      .filter((burst) => burst.coin === coin)
                      .map((burst) => (
                        <span key={burst.id} className="burst">
                          {burst.text}
                        </span>
                      ))}
                    <div className="rig-head">
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                        <div className="coin">{LOOK[coin].letter}</div>
                        <div>
                          <h3>{LOOK[coin].name}</h3>
                          <p>Rig power {power[coin]}</p>
                        </div>
                      </div>
                      <div className={`price ${dirs[coin]}`}>
                        ${prices[coin].toLocaleString()}
                        <div>{dirs[coin] === 'up' ? '▲' : '▼'}</div>
                      </div>
                    </div>
                    <button className="mine" onClick={() => mine(coin, true)}>
                      Mine {coin}
                    </button>
                    <div className="rig-meta">
                      <span>Held {portfolio[coin].toFixed(4)}</span>
                      <span>${(portfolio[coin] * prices[coin]).toFixed(0)}</span>
                    </div>
                    <button className="upgrade" disabled={balance < cost} onClick={() => upgrade(coin)}>
                      Upgrade · ${cost.toLocaleString()}
                    </button>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="panel">
            <h2>T3X exchange</h2>
            <div className="pair-row">
              {COINS.map((coin) => (
                <button
                  key={coin}
                  className={`pair ${selected === coin ? 'on' : ''}`}
                  style={{ ['--coin' as string]: LOOK[coin].color }}
                  onClick={() => setSelected(coin)}
                >
                  {coin}
                </button>
              ))}
            </div>
            <div className="quote">
              <strong style={{ color }}>{`$${prices[selected].toLocaleString()}`}</strong>
              <span className={dirs[selected]}>{dirs[selected] === 'up' ? 'lifting' : 'slipping'}</span>
            </div>
            <div className="chart-wrap">
              <Line
                data={chart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { enabled: false } },
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  animation: { duration: 400 },
                }}
              />
            </div>
            <div className="books">
              <div className="book buy">
                <label>BUY WITH CASH</label>
                <input value={buyAmt} inputMode="decimal" onChange={(event) => setBuyAmt(event.target.value)} />
                <div className="chips">
                  {[100, 500, 1000].map((n) => (
                    <button key={n} onClick={() => setBuyAmt(String(n))}>
                      ${n}
                    </button>
                  ))}
                </div>
                <button className="go buy" onClick={() => buy(selected, Number(buyAmt) || 0)}>
                  Buy {selected}
                </button>
              </div>
              <div className="book sell">
                <label>SELL FROM VAULT</label>
                <input value={sellPct} inputMode="decimal" onChange={(event) => setSellPct(event.target.value)} />
                <div className="chips">
                  {[25, 50, 100].map((n) => (
                    <button key={n} onClick={() => setSellPct(String(n))}>
                      {n}%
                    </button>
                  ))}
                </div>
                <button className="go sell" onClick={() => sell(selected, (Number(sellPct) || 0) / 100)}>
                  Sell {selected}
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="panel vault">
          <h2>Vault</h2>
          <div className="coin-list">
            {COINS.map((coin) => (
              <div key={coin} className="coin-row">
                <b>
                  {LOOK[coin].name}
                  <span>{coin}</span>
                </b>
                <span>{portfolio[coin].toFixed(4)}</span>
                <em>${(portfolio[coin] * prices[coin]).toFixed(2)}</em>
              </div>
            ))}
          </div>
        </section>

        <footer className="foot">
          <a href="https://t3x.futuret3ch.com.au" target="_blank" rel="noopener">
            <img src="/t3x-mark.png" alt="" />
            <span>Created by futuret3ch</span>
          </a>
          <p>Intellectual property. Trademarked 2026.</p>
        </footer>
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
