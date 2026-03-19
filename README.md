# phemex-cli

[![npm version](https://img.shields.io/npm/v/phemex-cli.svg)](https://www.npmjs.com/package/phemex-cli)
[![license](https://img.shields.io/npm/l/phemex-cli.svg)](https://github.com/phemex/phemex-cli/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/phemex-cli.svg)](https://nodejs.org)

Command-line interface for trading on [Phemex](https://phemex.com) — USDT-M futures, Coin-M futures, and Spot markets.

**20 commands** for market data, account management, order placement, position management, fund transfers, and real-time WebSocket streaming — all from your terminal.

### Why phemex-cli?

- **All-in-one** — Market data, trading, positions, transfers, and streaming in a single tool
- **AI-agent ready** — Structured JSON output works with [OpenClaw](https://openclaw.ai), [Claude Code](https://claude.ai/claude-code), and any AI agent that can shell out. Includes an [OpenClaw skill](#ai-agents--openclaw) out of the box
- **Pipe-friendly** — JSON to stdout, logs to stderr. Compose with `jq`, scripts, or trading bots
- **3 contract types** — USDT-M perpetual, Coin-M perpetual, and Spot via a single `--contractType` flag
- **Friendly output** — Automatic field name mapping (`closeRp` becomes `closePrice`). Use `--raw` for original API names
- **Smart errors** — Every error includes a `suggestion` and `tip` field with actionable guidance
- **Built-in help** — `phemex-cli <command> --help` for full parameter docs and examples
- **Testnet safe** — Defaults to testnet URL. Opt in to mainnet explicitly

## Quick Start

```bash
# Install
npm install -g phemex-cli

# Configure (or use ~/.phemexrc — see Setup)
export PHEMEX_API_KEY=your-key
export PHEMEX_API_SECRET=your-secret
export PHEMEX_API_URL=https://api.phemex.com

# Check a price (no API key needed)
phemex-cli get_ticker --symbol BTCUSDT

# Place your first order
phemex-cli place_order --symbol BTCUSDT --side Buy --orderQty 0.01 --ordType Market

# Stream live prices
phemex-cli subscribe ticker --symbol BTCUSDT
```

## CLI Usage

```bash
# Market data (no API key required)
phemex-cli get_ticker --symbol BTCUSDT
phemex-cli get_orderbook --symbol BTCUSDT
phemex-cli get_klines --symbol BTCUSDT --resolution 3600 --limit 24

# Account info
phemex-cli get_positions --currency USDT
phemex-cli get_account --currency USDT
phemex-cli get_open_orders --symbol BTCUSDT

# Trading
phemex-cli place_order --symbol BTCUSDT --side Buy --orderQty 0.01 --ordType Market
phemex-cli place_order --symbol BTCUSDT --side Buy --orderQty 0.01 --ordType Limit --price 95000
phemex-cli amend_order --symbol BTCUSDT --orderID abc123 --price 96000
phemex-cli cancel_order --symbol BTCUSDT --orderID abc123
phemex-cli cancel_all_orders --symbol BTCUSDT

# Transfers
phemex-cli transfer_funds --currency USDT --amount 100 --direction spot_to_futures

# Discover symbols
phemex-cli list_symbols
phemex-cli list_symbols --contractType linear

# Coin-M (inverse) and Spot
phemex-cli get_ticker --symbol BTCUSD --contractType inverse
phemex-cli get_ticker --symbol BTCUSDT --contractType spot

# JSON args also supported
phemex-cli get_ticker '{"symbol":"BTCUSDT"}'

# Help
phemex-cli --help
phemex-cli place_order --help

# Raw output (preserve original API field names)
phemex-cli get_ticker --symbol BTCUSDT --raw

# Pipe to jq
phemex-cli get_ticker --symbol BTCUSDT | jq '.closePrice'
```

## Available Tools

### Market Data (public, no API key required)

| Tool | Description |
|---|---|
| `get_ticker` | 24hr price ticker for a symbol |
| `get_orderbook` | Order book snapshot (30 levels) |
| `get_klines` | Historical candlestick/kline data |
| `get_recent_trades` | Recent market trades |
| `get_funding_rate` | Funding rate history (futures only) |

### Account (read-only)

| Tool | Description |
|---|---|
| `get_account` | Futures account balance and margin info |
| `get_spot_wallet` | Spot wallet balances per currency |
| `get_positions` | Current positions with unrealized PnL (futures only) |
| `get_open_orders` | All open orders for a symbol |
| `get_order_history` | Closed/filled order history |
| `get_trades` | Trade execution history |

### Trading (write)

| Tool | Description |
|---|---|
| `place_order` | Place an order (Market, Limit, Stop, StopLimit) |
| `amend_order` | Modify price or quantity of an open order |
| `cancel_order` | Cancel a single order by orderID or clOrdID |
| `cancel_all_orders` | Cancel all open orders for a symbol |
| `set_leverage` | Set leverage for a perpetual symbol (futures only) |
| `switch_pos_mode` | Switch between OneWay and Hedged mode (USDT-M only) |

### Transfers

| Tool | Description |
|---|---|
| `transfer_funds` | Transfer funds between spot and futures wallets |
| `get_transfer_history` | Query transfer history |

### Utility

| Tool | Description |
|---|---|
| `list_symbols` | List all available trading symbols, grouped by contract type |

### Streaming (WebSocket)

| Channel | Description |
|---|---|
| `subscribe ticker` | Real-time price ticker updates |
| `subscribe trade` | Live trade stream |
| `subscribe orderbook` | Order book depth updates |

## Contract Types

Every tool accepts an optional `--contractType` flag:

- **`linear`** (default) — USDT-M perpetual futures. Symbols end in `USDT` (e.g. `BTCUSDT`).
- **`inverse`** — Coin-M perpetual futures. Symbols end in `USD` (e.g. `BTCUSD`).
- **`spot`** — Spot trading. Symbols end in `USDT` (e.g. `BTCUSDT`). The CLI automatically prepends `s` for the API.

## WebSocket Streaming

Subscribe to real-time market data streams:

```bash
# Subscribe to price ticker (market24h)
phemex-cli subscribe ticker --symbol BTCUSDT

# Subscribe to live trades
phemex-cli subscribe trade --symbol SOLUSDT

# Subscribe to order book updates
phemex-cli subscribe orderbook --symbol ETHUSDT
```

**Output format:**
- JSON to **stdout** (for parsing/piping)
- Logs to **stderr** (connection status, errors)

**Features:**
- Auto-reconnect with exponential backoff (1s -> 30s)
- Supports SIGINT (Ctrl+C) for graceful shutdown
- WebSocket URL: `wss://ws.phemex.com` (configurable via `PHEMEX_WS_URL`)

## Setup

### 1. Get Phemex API credentials

Create an API key at [phemex.com](https://phemex.com) (or [testnet.phemex.com](https://testnet.phemex.com) for testing).

### 2. Configure environment

**Option A: Config file (recommended)** — create `~/.phemexrc`:

```bash
# Phemex API Credentials
PHEMEX_API_KEY=your-api-key
PHEMEX_API_SECRET=your-api-secret
PHEMEX_API_URL=https://api.phemex.com

# Optional: max order value limit (USD)
PHEMEX_MAX_ORDER_VALUE=1000
```

**Option B: Environment variables**:

```bash
export PHEMEX_API_KEY=your-api-key
export PHEMEX_API_SECRET=your-api-secret
export PHEMEX_API_URL=https://api.phemex.com
```

**Priority** (highest to lowest): CLI params > environment variables > `~/.phemexrc` > defaults (testnet).

| Variable | Description |
|---|---|
| `PHEMEX_API_KEY` | Your Phemex API key |
| `PHEMEX_API_SECRET` | Your Phemex API secret |
| `PHEMEX_API_URL` | API base URL. Use `https://testnet-api.phemex.com` for testnet or `https://api.phemex.com` for production |
| `PHEMEX_MAX_ORDER_VALUE` | Optional safety limit — max notional order value (USD). Orders exceeding this are rejected client-side |

### 3. Build from source (optional)

```bash
git clone https://github.com/phemex/phemex-cli.git
cd phemex-cli
npm install
npm run build
```

## AI Agents & OpenClaw

`phemex-cli` is designed to work with AI trading agents. Every command outputs structured JSON to stdout, making it easy for agents to parse and act on results.

**Quick onboarding:** Copy the contents of [`INSTALL.md`](INSTALL.md) and paste it into your AI agent. The agent will install phemex-cli, ask for your API credentials, and set everything up for you.

### OpenClaw

Install the skill from [ClawHub](https://clawhub.ai):

```bash
clawhub install phemex-cli
```

Or manually copy the `skill/phemex-cli/` directory to `~/.openclaw/skills/`.

### Claude Code

Add `phemex-cli` to your agent's tool chain. The CLI's `--help` flags and structured error messages make it self-documenting for AI agents.

### Any AI Agent

Any agent that can execute shell commands can use `phemex-cli`. Output is always JSON to stdout, errors to stderr — no parsing hacks needed.

```bash
# Example: agent checks position, then places a closing order
POSITION=$(phemex-cli get_positions --currency USDT)
phemex-cli place_order --symbol BTCUSDT --side Sell --orderQty 0.01 --ordType Market
```

## Error Handling

Errors return structured JSON with actionable guidance:

```bash
phemex-cli get_ticker --symbol BTCUSD
```

```json
{
  "error": "Invalid symbol: BTCUSD",
  "code": 6001,
  "suggestion": "Did you mean BTCUSDT? For USDT perpetuals, use symbols ending in USDT.",
  "tip": "Run \"phemex-cli list_symbols\" to see all available symbols."
}
```

Common errors covered: invalid symbol, insufficient balance, invalid API key, rate limiting, order not found, quantity too large, invalid leverage — all with `suggestion` and `tip` fields.

## Architecture

```
src/
  cli.ts                # CLI entry point — dispatches to tool handlers
  cli-parser.ts         # CLI argument parser (flag + JSON modes)
  client.ts             # Phemex API client (auth, signing, HTTP)
  config.ts             # Config loading (~/.phemexrc + env vars)
  contract-router.ts    # Routes tools to correct API endpoints per contract type
  errors.ts             # Enhanced error messages with suggestions
  product-info.ts       # Caches product metadata for price/qty scaling
  symbols.ts            # Symbol listing and filtering
  tool-schemas.ts       # Tool parameter schemas and --help formatter
  types.ts              # Shared types
  websocket-client.ts   # WebSocket streaming client
  formatters/
    field-mapper.ts     # Maps API field names to friendly names (--raw to skip)
```

Key design decisions:

- **Contract router** — a single `--contractType` parameter on every tool dispatches to the correct Phemex API endpoint (USDT-M `/g-*`, Coin-M `/orders/*`, Spot `/spot/*`).
- **Automatic scaling** — Coin-M and Spot APIs use integer-scaled values (`priceEp`, `baseQtyEv`). The CLI handles conversion automatically via `ProductInfoCache`, so you always work with human-readable decimals.
- **Symbol resolution** — Spot symbols are auto-prefixed with `s` for the API (e.g. `BTCUSDT` becomes `sBTCUSDT`). You don't need to know this.
- **Field name mapping** — API field suffixes (`closeRp`, `fundingRateRr`, etc.) are mapped to friendly names (`closePrice`, `fundingRate`). Use `--raw` to preserve original names.
- **Pipe-friendly output** — All data goes to stdout as JSON. Logs, connection status, and errors go to stderr. This makes `phemex-cli` composable with `jq`, shell scripts, and other tools.

## Development

```bash
npm run dev       # watch mode — recompiles on file changes
npm run build     # one-time build
npm test          # run tests
```

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes with tests
4. Run `npm test` to ensure all tests pass
5. Submit a pull request

## License

ISC
