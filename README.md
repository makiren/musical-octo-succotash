# Trading Analysis Dashboard

A pro-grade market analysis terminal in the spirit of **TradingView Plus** /
**Investing.com Pro** — advanced charts, a stock screener, watchlists,
portfolio tracking with live P&L, price alerts, market news and an economic
calendar.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, charts by
[lightweight-charts](https://github.com/tradingview/lightweight-charts), data
via the **Finnhub** API.

> No API key? The app ships with a deterministic mock-data layer, so every
> feature is fully explorable out of the box. A "Demo data" badge appears in
> the top bar whenever mock data is being served.

## Features

- **Advanced charts** — candlesticks + volume, eight timeframes (1m → 1M),
  overlay indicators (SMA 20/50/200, EMA 12/26, Bollinger Bands) and synced
  oscillator panes (RSI, MACD).
- **Screener** — filter the universe by sector, market cap, P/E, dividend
  yield and day direction; sort by any column.
- **Watchlist** — persisted locally, live quotes with 30-day sparklines.
- **Portfolio** — lot-based holdings with cost basis, market value, daily and
  unrealized P&L, and position weights.
- **Alerts** — above/below price alerts evaluated against live quotes with
  in-app toast notifications.
- **News & economic calendar** — market headlines and upcoming macro events
  with impact tags.

## Getting started

```bash
npm install

# optional — without it the app serves mock data
cp .env.example .env.local   # then set FINNHUB_API_KEY

npm run dev                  # http://localhost:3000
```

Get a free API key at <https://finnhub.io/dashboard>.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm run start`     | Serve the production build           |
| `npm run typecheck` | Type-check without emitting          |
| `npm run lint`      | Lint                                 |

## Architecture

```
src/
  app/
    api/            Route handlers proxying Finnhub (keeps the key server-side)
    chart/[symbol]/ Advanced chart workspace
    screener|watchlist|portfolio|alerts|news/
  components/       UI: charts, tables, dialogs, layout
  lib/
    finnhub/        Server client + mock fallback + symbol universe
    indicators.ts   Pure TS: SMA, EMA, RSI, MACD, Bollinger Bands
    store/          Zustand stores (watchlist, portfolio, alerts, toasts)
    api.ts          Typed client-side fetchers (TanStack Query)
```

The data layer is provider-agnostic at the boundary: `lib/finnhub/client.ts`
returns normalized types and transparently falls back to `lib/finnhub/mock.ts`
when `FINNHUB_API_KEY` is unset. Swapping in another provider only requires
re-implementing that client.
