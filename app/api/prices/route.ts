import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Quotes = { prices: { BTC: number; ETH: number; SOL: number }; change: { BTC: number; ETH: number; SOL: number } };

async function coingecko(): Promise<Quotes> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('coingecko');
  const data = await res.json();
  if (!data?.bitcoin?.usd || !data?.ethereum?.usd || !data?.solana?.usd) throw new Error('shape');
  return {
    prices: { BTC: data.bitcoin.usd, ETH: data.ethereum.usd, SOL: data.solana.usd },
    change: {
      BTC: data.bitcoin.usd_24h_change ?? 0,
      ETH: data.ethereum.usd_24h_change ?? 0,
      SOL: data.solana.usd_24h_change ?? 0,
    },
  };
}

async function coinbase(): Promise<Quotes> {
  const pairs = [
    ['BTC', 'BTC-USD'],
    ['ETH', 'ETH-USD'],
    ['SOL', 'SOL-USD'],
  ] as const;
  const prices = { BTC: 0, ETH: 0, SOL: 0 };
  for (const [coin, pair] of pairs) {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, { cache: 'no-store' });
    if (!res.ok) throw new Error('coinbase');
    const data = await res.json();
    prices[coin] = Number(data?.data?.amount);
    if (!prices[coin]) throw new Error('coinbase-shape');
  }
  return { prices, change: { BTC: 0, ETH: 0, SOL: 0 } };
}

export async function GET() {
  try {
    const book = await coingecko();
    return NextResponse.json({ live: true, at: Date.now(), source: 'coingecko', ...book });
  } catch {
    try {
      const book = await coinbase();
      return NextResponse.json({ live: true, at: Date.now(), source: 'coinbase', ...book });
    } catch {
      return NextResponse.json({ live: false, at: Date.now() });
    }
  }
}
