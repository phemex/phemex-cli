export interface SymbolsOutput {
  linear?: string[];
  inverse?: string[];
  spot?: string[];
}

export async function fetchSymbols(baseUrl: string): Promise<SymbolsOutput> {
  const res = await fetch(`${baseUrl}/public/products`);
  const data = (await res.json()) as {
    code: number;
    data: {
      products?: Array<{ symbol: string; type: string; status: string }>;
      perpProductsV2?: Array<{ symbol: string; type: string; status: string }>;
    };
  };

  if (data.code !== 0) throw new Error(`API error (code: ${data.code})`);

  const result: Required<SymbolsOutput> = { linear: [], inverse: [], spot: [] };

  for (const p of data.data.products ?? []) {
    if (p.status !== "Listed") continue;
    if (p.type === "Perpetual") result.inverse.push(p.symbol);
    else if (p.type === "Spot") {
      // Remove the "s" prefix for display (sBTCUSDT → BTCUSDT)
      const display = p.symbol.startsWith("s") ? p.symbol.slice(1) : p.symbol;
      result.spot.push(display);
    }
  }

  for (const p of data.data.perpProductsV2 ?? []) {
    if (p.status === "Listed") result.linear.push(p.symbol);
  }

  result.linear.sort();
  result.inverse.sort();
  result.spot.sort();

  return result;
}

export function filterByContractType(symbols: SymbolsOutput, contractType?: string): SymbolsOutput {
  if (!contractType) return symbols;
  if (contractType === "linear") return { linear: symbols.linear };
  if (contractType === "inverse") return { inverse: symbols.inverse };
  if (contractType === "spot") return { spot: symbols.spot };
  return symbols;
}
