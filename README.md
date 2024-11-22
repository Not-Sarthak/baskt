# BASKT

BASKT is a decentralized token bucket platform built on the Sui blockchain, leveraging 7k aggregator for optimal swap routing and Pyth Network for reliable price feeds.

## Features

- **Token Buckets**: Predefined collections of tokens for easy portfolio building
- **DEX Bucket Integration**: Purchase multiple tokens (WETH, SUI, DEEP) in a single transaction
- **7k Aggregator**: Optimal swap routing across multiple DEXes
- **Pyth Network Integration**: Real-time, accurate price feeds
- **Sui Blockchain**: Fast, scalable transactions with low fees

## Architecture

- Frontend: Next.js
- Smart Contracts: Sui Move
- Price Oracle: Pyth Network
- DEX Aggregator: 7k Protocol

## Prerequisites

- Node.js 16+
- npm/yarn
- Sui Wallet
- Git

## Installation

```bash
git clone git@github.com:Not-Sarthak/baskt.git
cd baskt
npm install
```

## Running Locally

```bash
yarn
 #or
npm i
 #or
pnpm i
```

```bash
yarn dev
 #or
npm run dev
 #or
pnpm run dev
```

Visit `http://localhost:3000`

### Token Swaps

The platform utilizes 7k aggregator for optimal routing across DEXes.

## Price Feeds

Pyth Network provides price data for:

- Real-time token prices
- Historical price data
- Price confidence intervals
