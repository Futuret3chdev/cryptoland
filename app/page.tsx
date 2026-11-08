'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement } from 'chart.js';
import Trailer from './Trailer';
import {
  COINS,
  LOOK,
  type Coin,
  type Tape,
  cycleU,
  dayBill,
  dayYield,
  money,
  px,
  qty,
  quote,
  stamp,
  worth,
} from './engine';
import { useFloor } from './useFloor';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const TAPES: { id: Tape; label: string }[] = [
  { id: 'slide', label: 'Red day' },
  { id: 'melt', label: 'Melt-up' },
  { id: 'chop', label: 'Chop' },
];

export default function CryptoLand() {
  const floor = useFloor();
  const { save, ready } = floor;
  const [pick, setPick] = useState<Coin>('SOL');
  const [usd, setUsd] = useState('250');
  const [part, setPart] = useState('25');
  const [rules, setRules] = useState(false);
  const [trailer, setTrailer] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!localStorage.getItem('cl-seen-trailer')) setTrailer(true);
  }, [ready]);

  const now = Date.now();
  const mark = ready ? stamp(save, now) : 'FROZEN';
  const coin = pick;
  const color = LOOK[coin].color;
  const due = dayBill(save.power[save.aim], save.overclock);
  const yieldIfHeld = dayYield(save);
  const dial = cycleU(save.phase, save.left) * 100;
  const chart = useMemo(
    () => ({
      labels: save.hist[coin].map((_, index) => `${index}`),
      datasets: [
        {
          data: save.hist[coin],
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [save.hist, coin, color],
  );

  function closeTrailer() {
    localStorage.setItem('cl-seen-trailer', '1');
    setTrailer(false);
  }

  if (!ready) {
    return (
      <div className="land is-dawn">
        <div className="land-bg" />
        <p className="boot">Opening the floor…</p>
      </div>
    );
  }

  const move = save.change[save.aim];
  const banner =
    save.phase === 'dawn'
      ? mark === 'REPLAY'
        ? `Replay · ${save.tape === 'slide' ? 'red day' : save.tape === 'melt' ? 'melt-up' : 'chop'}. Not the live street. Aim the rig.`
        : `Dawn ${save.day}. ${LOOK[save.aim].name} ${move >= 0 ? '+' : ''}${move.toFixed(1)}% on the street. Aim one rig.`
      : save.phase === 'day'
        ? save.tripped
          ? 'The overclock tripped the rig. Hash stops until dawn. The bill still comes.'
          : `Hashing ${save.aim}. About ${qty(save.aim, yieldIfHeld)} if it holds. Bill at dusk ${money(due)}.`
        : save.dark
          ? `Power bill ${money(save.bill)} emptied the cash book. The next day runs dark unless you sell.`
          : `Dusk. Power bill ${money(save.bill)} left the cash book. Sell into the street or hold.`;

  return (
    <div className={`land is-${save.phase}`}>
      <div className="land-bg" />
      <main className="shell">
        <header className="drip">
          <img src="/t3x-mark.png" alt="" />
          <div className="drip-copy">
            <strong>T3X {save.drip.toFixed(4)}%</strong>
            <div className="drip-track">
              <i style={{ width: `${Math.min(100, save.drip)}%` }} />
              <em key={save.pulses} />
            </div>
          </div>
          <b>{save.t3x} held</b>
        </header>
        <p className="drip-note">Leave the floor open. Each hash adds a crumb. A full bar pays 1 T3X here. No wallet.</p>

        <section className="hero">
          <div className="brand">
            <img src="/t3x-mark.png" alt="" />
            <h1>Crypto Land</h1>
          </div>
          <div className="hero-pills">
            <span className={`stamp is-${mark.toLowerCase()}`}>{mark}</span>
            <button onClick={() => setTrailer(true)}>Trailer</button>
          </div>
        </section>

        <section className="tape" aria-label="Street">
          {COINS.map((id) => (
            <button key={id} className={coin === id ? 'on' : ''} onClick={() => setPick(id)}>
              <b>{id}</b>
              <span>{px(save.prices[id])}</span>
              <em className={save.change[id] >= 0 ? 'up' : 'down'}>
                {save.change[id] >= 0 ? '+' : ''}
                {save.change[id].toFixed(2)}%
              </em>
            </button>
          ))}
        </section>

        <section className="dial" aria-label="Game day">
          <div className="dial-track">
            <i style={{ left: `${dial}%` }} />
          </div>
          <div className="dial-labels">
            <span className={save.phase === 'dawn' ? 'on' : ''}>Dawn</span>
            <span className={save.phase === 'day' ? 'on' : ''}>Day</span>
            <span className={save.phase === 'dusk' ? 'on' : ''}>Dusk</span>
          </div>
        </section>

        <p className={`phase-card ${save.tripped ? 'is-trip' : ''}`}>{banner}</p>

        <section className="stats">
          <article>
            <small>Cash</small>
            <strong>{money(save.cash)}</strong>
          </article>
          <article>
            <small>Worth</small>
            <strong>{money(worth(save))}</strong>
          </article>
          <article>
            <small>Dusk bill</small>
            <strong>{money(save.phase === 'dusk' ? save.bill : due)}</strong>
          </article>
        </section>

        <section className="rigs">
          {COINS.map((id) => {
            const aimed = save.aim === id;
            return (
              <button
                key={id}
                className={`rig ${aimed ? 'is-aim' : 'is-dim'} ${aimed && save.phase === 'day' && !save.tripped ? 'is-live' : ''} ${aimed && save.tripped ? 'is-trip' : ''}`}
                style={{ ['--coin' as string]: LOOK[id].color }}
                onClick={() => floor.aim(id)}
              >
                <span className="coin">{LOOK[id].letter}</span>
                <span>
                  <strong>{LOOK[id].name}</strong>
                  <small>
                    Mining rig · power {save.power[id]} · {qty(id, save.bag[id])}
                  </small>
                </span>
                <em>{aimed ? (save.tripped ? 'Tripped' : 'Aimed') : 'Dim'}</em>
              </button>
            );
          })}
        </section>

        <div className="actions">
          <button className="mine" disabled={save.phase !== 'day' || save.tripped} onClick={floor.mine}>
            {save.phase !== 'day' ? 'Rigs sleep' : save.tripped ? 'Tripped' : `Mine ${save.aim}`}
          </button>
          <button className={save.overclock ? 'on' : ''} onClick={() => floor.overclock(!save.overclock)}>
            {save.overclock ? 'Overclock on' : 'Overclock'}
          </button>
          <button onClick={() => floor.upgrade(save.aim)}>Upgrade {save.aim} · {money(1000 * save.power[save.aim])}</button>
        </div>

        <section className="panel">
          <div className="panel-head">
            <h2>{LOOK[coin].name}</h2>
            <span>{mark === 'REPLAY' ? 'Replay path' : mark === 'LIVE' ? 'Live print' : 'Last print, feed quiet'}</span>
          </div>
          <div className="chart-wrap">
            <Line
              data={chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
                animation: { duration: 280 },
              }}
            />
          </div>
          <div className="books">
            <div>
              <label>Buy · you pay {px(quote(save.prices[coin], 'buy'))}</label>
              <input value={usd} inputMode="decimal" onChange={(event) => setUsd(event.target.value)} />
              <div className="chips">
                {[100, 500, 1000].map((n) => (
                  <button key={n} onClick={() => setUsd(String(n))}>
                    ${n}
                  </button>
                ))}
              </div>
              <button className="go buy" onClick={() => floor.buy(coin, Number(usd) || 0)}>
                Buy {coin}
              </button>
            </div>
            <div>
              <label>Sell · you get {px(quote(save.prices[coin], 'sell'))}</label>
              <input value={part} inputMode="decimal" onChange={(event) => setPart(event.target.value)} />
              <div className="chips">
                {[25, 50, 100].map((n) => (
                  <button key={n} onClick={() => setPart(String(n))}>
                    {n}%
                  </button>
                ))}
              </div>
              <button className="go sell" onClick={() => floor.sell(coin, (Number(part) || 0) / 100)}>
                Sell {coin}
              </button>
            </div>
          </div>
        </section>

        <section className="panel slim">
          <h2>Vault</h2>
          {COINS.map((id) => {
            const average = save.bag[id] > 0 ? save.basis[id] / save.bag[id] : 0;
            return (
              <div key={id} className="vault-row">
                <b>{id}</b>
                <span>{qty(id, save.bag[id])}</span>
                <span>{average ? `avg ${px(average)}` : 'mined'}</span>
                <em>{money(save.bag[id] * save.prices[id])}</em>
              </div>
            );
          })}
          <p className="held-line">
            T3X on this screen: {save.t3x}. Play money only.
          </p>
        </section>

        {save.blotter.length > 0 && (
          <section className="panel slim">
            <h2>Fills</h2>
            {save.blotter.map((fill) => (
              <div key={fill.id} className="vault-row">
                <b className={fill.side}>{fill.side}</b>
                <span>{fill.coin}</span>
                <span>{qty(fill.coin, fill.qty)}</span>
                <em>{px(fill.px)}</em>
              </div>
            ))}
          </section>
        )}

        <section className="panel slim">
          <h2>Desk</h2>
          <div className="desk">
            <button className={save.mode === 'live' ? 'on' : ''} onClick={floor.live}>
              Live
            </button>
            {TAPES.map((tape) => (
              <button key={tape.id} className={save.mode === 'replay' && save.tape === tape.id ? 'on' : ''} onClick={() => floor.replay(tape.id)}>
                {tape.label}
              </button>
            ))}
          </div>
        </section>

        <button className="rules-toggle" onClick={() => setRules((open) => !open)}>
          {rules ? 'Hide rules' : 'Rules'}
        </button>
        {rules && (
          <section className="panel slim rules">
            <p>One rig runs each game day. Aim it at dawn. Overclock hashes harder, draws a fatter bill, and can trip.</p>
            <p>Dusk takes the power bill from play cash. If the cash is short, the next day runs dark at half hash.</p>
            <p>Buys pay a hair over the print. Sells receive a hair under. Live mode uses the real street. Replay is a shaped day, labeled, never called live.</p>
            <p>The top bar is the long mine. Leave this page open. A full bar pays 1 T3X onto the screen. It can take a few days or a week. You cannot connect a wallet.</p>
            <button
              onClick={() => {
                if (window.confirm('Reset this floor, including the T3X bar on this screen?')) floor.reset();
              }}
            >
              Reset floor
            </button>
          </section>
        )}

        <footer className="foot">
          <a href="https://t3x.futuret3ch.com.au" target="_blank" rel="noopener">
            <img src="/t3x-mark.png" alt="" />
            <span>Created by futuret3ch</span>
          </a>
          <p>Intellectual property. Trademarked 2026.</p>
        </footer>
      </main>

      {floor.banner > 0 && (
        <div className="paid">
          <img src="/t3x-mark.png" alt="" />
          <div>
            <strong>1 T3X paid onto this screen.</strong>
            <p>You hold {floor.banner}. No wallet. The bar starts again.</p>
          </div>
          <button onClick={floor.dismiss}>Keep hashing</button>
        </div>
      )}
      {floor.note ? <div className="toast">{floor.note}</div> : null}
      {trailer ? <Trailer onClose={closeTrailer} /> : null}
    </div>
  );
}
