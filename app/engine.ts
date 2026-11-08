export type Coin = 'BTC' | 'ETH' | 'SOL';
export type Phase = 'dawn' | 'day' | 'dusk';
export type Mode = 'live' | 'replay';
export type Tape = 'slide' | 'melt' | 'chop';

export const COINS: Coin[] = ['BTC', 'ETH', 'SOL'];
export const KEY = 'cryptoland-save-v1';
export const DAWN = 20;
export const DAY = 160;
export const DUSK = 24;
export const SPREAD = 0.0015;

export const LOOK: Record<Coin, { name: string; color: string; letter: string; rate: number }> = {
  BTC: { name: 'Bitcoin', color: '#f7931a', letter: 'B', rate: 0.000008 },
  ETH: { name: 'Ether', color: '#8aa4ff', letter: 'E', rate: 0.00015 },
  SOL: { name: 'Solana', color: '#14f195', letter: 'S', rate: 0.004 },
};

export type Bag = Record<Coin, number>;

export type Fill = {
  id: number;
  side: 'buy' | 'sell';
  coin: Coin;
  qty: number;
  px: number;
};

export type Save = {
  cash: number;
  bag: Bag;
  basis: Bag;
  power: Bag;
  aim: Coin;
  overclock: boolean;
  tripped: boolean;
  dark: boolean;
  day: number;
  phase: Phase;
  left: number;
  mined: Bag;
  bill: number;
  t3x: number;
  drip: number;
  pulses: number;
  mode: Mode;
  tape: Tape;
  anchor: Bag;
  prices: Bag;
  change: Bag;
  street: Bag;
  streetChg: Bag;
  hist: Record<Coin, number[]>;
  blotter: Fill[];
  quoteAt: number;
};

export function zeros(): Bag {
  return { BTC: 0, ETH: 0, SOL: 0 };
}

function seed(): Bag {
  return { BTC: 76000, ETH: 2240, SOL: 89 };
}

function line(prices: Bag): Record<Coin, number[]> {
  return {
    BTC: Array(40).fill(prices.BTC),
    ETH: Array(40).fill(prices.ETH),
    SOL: Array(40).fill(prices.SOL),
  };
}

export function fresh(): Save {
  const prices = seed();
  return {
    cash: 10000,
    bag: zeros(),
    basis: zeros(),
    power: { BTC: 1, ETH: 1, SOL: 1 },
    aim: 'SOL',
    overclock: false,
    tripped: false,
    dark: false,
    day: 1,
    phase: 'dawn',
    left: DAWN,
    mined: zeros(),
    bill: 0,
    t3x: 0,
    drip: 0,
    pulses: 0,
    mode: 'live',
    tape: 'slide',
    anchor: { ...prices },
    prices: { ...prices },
    change: zeros(),
    street: { ...prices },
    streetChg: zeros(),
    hist: line(prices),
    blotter: [],
    quoteAt: 0,
  };
}

export function load(): Save {
  if (typeof window === 'undefined') return fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return sanitize(JSON.parse(raw));
  } catch {
    return fresh();
  }
}

export function sanitize(parsed: Partial<Save> | null): Save {
  const base = fresh();
  if (!parsed || typeof parsed.cash !== 'number' || !parsed.bag) return base;
  return {
    ...base,
    ...parsed,
    bag: { ...base.bag, ...parsed.bag },
    basis: { ...base.basis, ...parsed.basis },
    power: { ...base.power, ...parsed.power },
    mined: { ...base.mined, ...parsed.mined },
    prices: { ...base.prices, ...parsed.prices },
    change: { ...base.change, ...parsed.change },
    street: { ...base.street, ...(parsed.street || parsed.prices) },
    streetChg: { ...base.streetChg, ...(parsed.streetChg || parsed.change) },
    anchor: { ...base.anchor, ...parsed.anchor },
    hist: {
      BTC: parsed.hist?.BTC?.length ? parsed.hist.BTC.slice(-40) : base.hist.BTC,
      ETH: parsed.hist?.ETH?.length ? parsed.hist.ETH.slice(-40) : base.hist.ETH,
      SOL: parsed.hist?.SOL?.length ? parsed.hist.SOL.slice(-40) : base.hist.SOL,
    },
    blotter: Array.isArray(parsed.blotter) ? parsed.blotter.slice(0, 6) : [],
    aim: parsed.aim && LOOK[parsed.aim] ? parsed.aim : 'SOL',
  };
}

export function money(n: number) {
  const digits = Math.abs(n) >= 1000 ? 0 : 2;
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}

export function px(n: number) {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function qty(coin: Coin, n: number) {
  const digits = coin === 'BTC' ? 6 : coin === 'ETH' ? 5 : 3;
  return n.toFixed(digits);
}

export function quote(mid: number, side: 'buy' | 'sell') {
  return side === 'buy' ? mid * (1 + SPREAD) : mid * (1 - SPREAD);
}

export function dayBill(power: number, overclock: boolean) {
  return Math.round(29 * power * (overclock ? 2.4 : 1));
}

export function pulseQty(power: number, coin: Coin, overclock: boolean, dark: boolean) {
  return power * LOOK[coin].rate * (overclock ? 1.7 : 1) * (dark ? 0.5 : 1);
}

export function dayYield(s: Save) {
  return pulseQty(s.power[s.aim], s.aim, s.overclock, s.dark) * (DAY / 2);
}

/** A crumb per pulse. Continuous hashing lands near a few days to a week. */
export function crumb() {
  return 0.00045 + Math.random() * 0.0007;
}

export function cycleU(phase: Phase, left: number) {
  const total = DAWN + DAY + DUSK;
  const spent = phase === 'dawn' ? DAWN - left : phase === 'day' ? DAWN + (DAY - left) : DAWN + DAY + (DUSK - left);
  return Math.min(1, Math.max(0, spent / total));
}

export function replayPx(anchor: number, tape: Tape, u: number) {
  const t = Math.min(1, Math.max(0, u));
  if (tape === 'slide') return anchor * (1 - 0.16 * t);
  if (tape === 'melt') return anchor * (1 + 0.14 * t);
  return anchor * (1 + Math.sin(t * Math.PI * 4) * 0.045);
}

function pushHist(hist: Save['hist'], prices: Bag) {
  return {
    BTC: [...hist.BTC.slice(-39), prices.BTC],
    ETH: [...hist.ETH.slice(-39), prices.ETH],
    SOL: [...hist.SOL.slice(-39), prices.SOL],
  };
}

function payDrip(drip: number, t3x: number, add: number) {
  let next = drip + add;
  let held = t3x;
  let paid = 0;
  while (next >= 100) {
    next -= 100;
    held += 1;
    paid += 1;
  }
  return { drip: next, t3x: held, paid };
}

function minePulse(s: Save): Save {
  if (s.phase !== 'day' || s.tripped) return s;
  const coin = s.aim;
  const amount = pulseQty(s.power[coin], coin, s.overclock, s.dark);
  const paid = payDrip(s.drip, s.t3x, crumb());
  return {
    ...s,
    bag: { ...s.bag, [coin]: s.bag[coin] + amount },
    mined: { ...s.mined, [coin]: s.mined[coin] + amount },
    drip: paid.drip,
    t3x: paid.t3x,
    pulses: s.pulses + 1,
  };
}

export function tick(s: Save, second: number): Save {
  let next: Save = { ...s };
  if (next.left - 1 <= 0) {
    if (next.phase === 'dawn') {
      next = { ...next, phase: 'day', left: DAY, bill: 0, mined: zeros() };
    } else if (next.phase === 'day') {
      const due = dayBill(next.power[next.aim], next.overclock);
      const covered = next.cash >= due;
      next = {
        ...next,
        phase: 'dusk',
        left: DUSK,
        bill: due,
        cash: covered ? next.cash - due : 0,
        dark: !covered,
      };
    } else {
      next = {
        ...next,
        phase: 'dawn',
        left: DAWN,
        day: next.day + 1,
        tripped: false,
        mined: zeros(),
        bill: 0,
      };
    }
  } else {
    next = { ...next, left: next.left - 1 };
  }

  if (next.phase === 'day' && !next.tripped && second % 2 === 0) {
    if (next.overclock && Math.random() < 0.006) next = { ...next, tripped: true };
    else next = minePulse(next);
  }

  if (next.mode === 'replay') {
    const u = cycleU(next.phase, next.left);
    const prices = {
      BTC: replayPx(next.anchor.BTC, next.tape, u),
      ETH: replayPx(next.anchor.ETH, next.tape, u),
      SOL: replayPx(next.anchor.SOL, next.tape, u),
    };
    next = {
      ...next,
      prices,
      change: {
        BTC: (prices.BTC / next.anchor.BTC - 1) * 100,
        ETH: (prices.ETH / next.anchor.ETH - 1) * 100,
        SOL: (prices.SOL / next.anchor.SOL - 1) * 100,
      },
      hist: second % 4 === 0 ? pushHist(next.hist, prices) : next.hist,
    };
  }
  return next;
}

export function manualMine(s: Save): Save {
  return minePulse(s);
}

export function aimAt(s: Save, coin: Coin): Save {
  if (s.phase !== 'dawn') return s;
  return { ...s, aim: coin };
}

export function setOverclock(s: Save, on: boolean): Save {
  if (s.phase !== 'dawn') return s;
  return { ...s, overclock: on };
}

export function upgrade(s: Save, coin: Coin): { save: Save; error?: string } {
  const cost = 1000 * s.power[coin];
  if (s.cash < cost) return { save: s, error: 'Not enough cash for that rig.' };
  return {
    save: {
      ...s,
      cash: s.cash - cost,
      power: { ...s.power, [coin]: s.power[coin] + 1 },
    },
  };
}

export function buy(s: Save, coin: Coin, usd: number): { save: Save; error?: string } {
  if (!usd || usd <= 0) return { save: s, error: 'Enter cash to buy.' };
  if (usd > s.cash) return { save: s, error: 'Not enough cash.' };
  const price = quote(s.prices[coin], 'buy');
  const amount = usd / price;
  return {
    save: {
      ...s,
      cash: s.cash - usd,
      bag: { ...s.bag, [coin]: s.bag[coin] + amount },
      basis: { ...s.basis, [coin]: s.basis[coin] + usd },
      blotter: [{ id: Date.now(), side: 'buy' as const, coin, qty: amount, px: price }, ...s.blotter].slice(0, 6),
    },
  };
}

export function sell(s: Save, coin: Coin, fraction: number): { save: Save; error?: string } {
  const amount = s.bag[coin] * fraction;
  if (amount <= 0) return { save: s, error: `No ${coin} in the vault.` };
  const price = quote(s.prices[coin], 'sell');
  const proceeds = amount * price;
  const cut = s.bag[coin] === 0 ? 0 : s.basis[coin] * (amount / s.bag[coin]);
  return {
    save: {
      ...s,
      cash: s.cash + proceeds,
      bag: { ...s.bag, [coin]: s.bag[coin] - amount },
      basis: { ...s.basis, [coin]: Math.max(0, s.basis[coin] - cut) },
      blotter: [{ id: Date.now(), side: 'sell' as const, coin, qty: amount, px: price }, ...s.blotter].slice(0, 6),
    },
  };
}

export function applyLive(s: Save, prices: Bag, change: Bag, at: number): Save {
  if (s.mode === 'replay') return { ...s, street: prices, streetChg: change, quoteAt: at };
  return {
    ...s,
    street: prices,
    streetChg: change,
    prices,
    change,
    quoteAt: at,
    hist: pushHist(s.hist, prices),
  };
}

export function goLive(s: Save): Save {
  return { ...s, mode: 'live', prices: s.street, change: s.streetChg };
}

export function goReplay(s: Save, tape: Tape): Save {
  const anchor = s.mode === 'live' ? { ...s.prices } : { ...s.anchor };
  return {
    ...s,
    mode: 'replay',
    tape,
    anchor,
    prices: { ...anchor },
    change: zeros(),
    phase: 'dawn',
    left: DAWN,
  };
}

export function worth(s: Save) {
  return s.cash + COINS.reduce((sum, coin) => sum + s.bag[coin] * s.prices[coin], 0);
}

export function stamp(s: Save, now: number): 'LIVE' | 'FROZEN' | 'REPLAY' {
  if (s.mode === 'replay') return 'REPLAY';
  if (s.quoteAt && now - s.quoteAt < 50000) return 'LIVE';
  return 'FROZEN';
}
