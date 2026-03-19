# Install phemex-cli

Copy everything below and paste it into your AI agent (OpenClaw, Claude Code, ChatGPT, etc.). The agent will install and configure phemex-cli for you.

---

## Instructions for AI Agent

I want to set up **phemex-cli** so I can trade on Phemex from the command line and through you.

Please do the following steps:

### Step 1: Install phemex-cli

```bash
npm install -g phemex-cli
```

Verify it installed:

```bash
phemex-cli --help
```

### Step 2: Ask me for my API credentials

Ask me for:
1. **Phemex API Key** — I can create one at https://phemex.com (Account > API Management)
2. **Phemex API Secret**
3. **Environment** — Am I using **testnet** (for practice/testing) or **mainnet** (real trading)?

### Step 3: Save my credentials to ~/.phemexrc

Once I provide my credentials, create the config file:

```bash
cat > ~/.phemexrc << 'EOF'
PHEMEX_API_KEY=<my-api-key>
PHEMEX_API_SECRET=<my-api-secret>
PHEMEX_API_URL=<https://testnet-api.phemex.com or https://api.phemex.com>
EOF
chmod 600 ~/.phemexrc
```

### Step 4: Verify the setup works

Run these commands to confirm everything is working:

```bash
# Should return a list of trading symbols (no auth needed)
phemex-cli list_symbols --contractType linear

# Should return my account balance (requires valid API key)
phemex-cli get_account --currency USDT

# Should return a BTC price ticker
phemex-cli get_ticker --symbol BTCUSDT
```

If `list_symbols` works but `get_account` fails with an API key error, my credentials may be wrong — ask me to double-check.

### Step 5: Show me what I can do

Once setup is verified, show me a quick summary:

- How to check prices: `phemex-cli get_ticker --symbol BTCUSDT`
- How to check my balance: `phemex-cli get_account --currency USDT`
- How to check positions: `phemex-cli get_positions --currency USDT`
- How to place an order: `phemex-cli place_order --symbol BTCUSDT --side Buy --orderQty 0.01 --ordType Market`
- How to get help on any command: `phemex-cli <command> --help`
- How to stream live prices: `phemex-cli subscribe ticker --symbol BTCUSDT`

### Important safety notes

- **Always confirm with me before placing or cancelling orders.**
- **Always show me the order details (symbol, side, quantity, type, price) before executing.**
- **Never auto-trade without my explicit instruction.**
- The CLI defaults to **testnet** if no API URL is set — real trading requires explicitly setting `https://api.phemex.com`.
