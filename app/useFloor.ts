'use client';

import { useEffect, useRef, useState } from 'react';
import {
  KEY,
  type Coin,
  type Save,
  type Tape,
  aimAt,
  applyLive,
  buy,
  fresh,
  goLive,
  goReplay,
  load,
  manualMine,
  sell,
  setOverclock,
  tick,
  upgrade,
} from './engine';

export function useFloor() {
  const [save, setSave] = useState<Save>(fresh);
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState('');
  const [banner, setBanner] = useState(0);
  const [coolUntil, setCoolUntil] = useState(0);
  const saveRef = useRef(save);
  const seen = useRef<number | null>(null);
  const second = useRef(0);
  saveRef.current = save;

  useEffect(() => {
    const loaded = load();
    seen.current = loaded.t3x;
    setSave(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      localStorage.setItem(KEY, JSON.stringify(saveRef.current));
    }, 4000);
    const flush = () => localStorage.setItem(KEY, JSON.stringify(saveRef.current));
    window.addEventListener('beforeunload', flush);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      second.current += 1;
      setSave((current) => tick(current, second.current));
    }, 1000);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (!ready || seen.current === null) return;
    if (save.t3x > seen.current) setBanner(save.t3x);
    seen.current = save.t3x;
  }, [ready, save.t3x]);

  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(''), 2400);
    return () => clearTimeout(id);
  }, [note]);

  useEffect(() => {
    if (!ready) return;
    let stop = false;
    async function pull() {
      try {
        const res = await fetch('/api/prices', { cache: 'no-store' });
        const data = await res.json();
        if (stop || !data?.live || !data.prices) return;
        setSave((current) => applyLive(current, data.prices, data.change, data.at || Date.now()));
      } catch {
        /* street stays frozen */
      }
    }
    pull();
    const id = setInterval(pull, 20000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [ready]);

  return {
    save,
    ready,
    note,
    banner,
    coolUntil,
    dismiss() {
      setBanner(0);
    },
    aim(coin: Coin) {
      if (saveRef.current.phase !== 'dawn') {
        setNote('Aim locks at dawn.');
        return;
      }
      setSave((current) => aimAt(current, coin));
    },
    overclock(on: boolean) {
      if (saveRef.current.phase !== 'dawn') {
        setNote('Overclock locks at dawn.');
        return;
      }
      setSave((current) => setOverclock(current, on));
    },
    mine() {
      const current = saveRef.current;
      if (Date.now() < coolUntil) return;
      if (current.phase !== 'day') {
        setNote('Rigs only hash during the day.');
        return;
      }
      if (current.tripped) {
        setNote('The rig tripped. Dawn resets it.');
        return;
      }
      setCoolUntil(Date.now() + 2000);
      setSave((value) => manualMine(value));
    },
    upgrade(coin: Coin) {
      const result = upgrade(saveRef.current, coin);
      if (result.error) setNote(result.error);
      setSave(result.save);
    },
    buy(coin: Coin, usd: number) {
      const result = buy(saveRef.current, coin, usd);
      setNote(result.error || `Bought ${coin}.`);
      setSave(result.save);
    },
    sell(coin: Coin, fraction: number) {
      const result = sell(saveRef.current, coin, fraction);
      setNote(result.error || `Sold ${coin}.`);
      setSave(result.save);
    },
    live() {
      setSave((current) => goLive(current));
    },
    replay(tape: Tape) {
      setSave((current) => goReplay(current, tape));
    },
    reset() {
      localStorage.removeItem(KEY);
      const next = fresh();
      seen.current = 0;
      setSave(next);
      setBanner(0);
    },
  };
}
