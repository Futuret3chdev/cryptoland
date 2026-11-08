'use client';

import { useEffect, useState } from 'react';
import type { Coin, Tape } from './engine';

const STEPS = ['Poster', 'Street', 'Aim', 'Hash', 'Dusk', 'Enter'];

export default function Trailer({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [street, setStreet] = useState<'live' | Tape | null>(null);
  const [aim, setAim] = useState<Coin | null>(null);
  const [fill, setFill] = useState(0.8);
  const [choice, setChoice] = useState<'hold' | 'sell' | null>(null);

  useEffect(() => {
    if (step !== 3) return;
    const id = setInterval(() => {
      setFill((value) => Math.min(18, value + 0.35 + Math.random() * 0.5));
    }, 160);
    return () => clearInterval(id);
  }, [step]);

  function next() {
    if (step === 1 && !street) return;
    if (step === 2 && !aim) return;
    if (step === 4 && !choice) return;
    if (step >= 5) {
      onClose();
      return;
    }
    setStep((value) => value + 1);
  }

  const blocked = (step === 1 && !street) || (step === 2 && !aim) || (step === 4 && !choice);

  return (
    <div className="trailer" role="dialog" aria-modal="true" aria-label="Crypto Land trailer">
      <div className="trailer-card">
        <div className="trailer-top">
          <span>Trailer</span>
          <button onClick={onClose}>Skip</button>
        </div>
        <div className="dots">
          {STEPS.map((label, index) => (
            <i key={label} className={index === step ? 'on' : ''} />
          ))}
        </div>

        {step === 0 && (
          <section className="scene">
            <img src="/mockup.jpg" alt="Crypto Land mockup" className="poster" />
            <h2>A game day on a real street.</h2>
            <p>The tape is live. The mine, the bill, and the day are yours.</p>
          </section>
        )}

        {step === 1 && (
          <section className="scene">
            <h2>Pick the street.</h2>
            <p>Live follows the real Bitcoin, Ether, and Solana prints. A tape replays one shaped day.</p>
            <div className="choices">
              <button className={street === 'live' ? 'on' : ''} onClick={() => setStreet('live')}>
                Live street
              </button>
              <button className={street === 'slide' ? 'on' : ''} onClick={() => setStreet('slide')}>
                Red day
              </button>
              <button className={street === 'melt' ? 'on' : ''} onClick={() => setStreet('melt')}>
                Melt-up
              </button>
              <button className={street === 'chop' ? 'on' : ''} onClick={() => setStreet('chop')}>
                Chop
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="scene">
            <h2>Aim one rig.</h2>
            <p>Dawn is the only time the hash moves. The other two stay dim until tomorrow.</p>
            <div className="choices">
              {(['BTC', 'ETH', 'SOL'] as Coin[]).map((coin) => (
                <button key={coin} className={aim === coin ? 'on' : ''} onClick={() => setAim(coin)}>
                  Aim {coin}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="scene">
            <h2>Hashing {aim}.</h2>
            <p>This preview runs fast. On the floor each crumb is tiny. Leave it open and a full bar takes a few days, or a week if the rolls stay small.</p>
            <div className="preview-bar">
              <div style={{ width: `${Math.min(100, (fill / 18) * 100)}%` }} />
            </div>
            <strong className="preview-read">{fill.toFixed(2)}% preview</strong>
            <p>At 100% the floor pays 1 T3X onto this screen. There is no wallet.</p>
          </section>
        )}

        {step === 4 && (
          <section className="scene">
            <h2>Dusk collects the bill.</h2>
            <p>Power is due in play cash. Sell into the book, or hold and risk a dark rig tomorrow.</p>
            <div className="choices">
              <button className={choice === 'hold' ? 'on' : ''} onClick={() => setChoice('hold')}>
                Hold
              </button>
              <button className={choice === 'sell' ? 'on' : ''} onClick={() => setChoice('sell')}>
                Sell
              </button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="scene">
            <img src="/t3x-mark.png" alt="" className="trailer-mark" />
            <h2>1 T3X, when the bar fills.</h2>
            <p>It stays on this screen. You cannot connect a wallet here. The street is real. The coins in the vault are the game.</p>
          </section>
        )}

        <button className="trailer-next" disabled={blocked} onClick={next}>
          {step === 5 ? 'Enter the floor' : 'Next'}
        </button>
      </div>
    </div>
  );
}
