# Epex Client

The *Epex Client* package enables querying of the latest European Power Exchange (EPEX) market data. 
It is intended primarily for hobbyist solutions, as the data is sourced directly from the official 
[EPEX website](https://www.epex.com).

## Overview

The **European Power Exchange (EPEX SPOT)** is a [market platform](https://www.epexspot.com/) for 
the trading of electricity in Europe. 
It provides a marketplace for electricity producers, consumers, and traders to buy and sell electricity, 
aiming to create a transparent and efficient market for power trading. 

## Installation

```sh
npm i @tvanlaerhoven/epex-client
```

or

```sh
yarn @tvanlaerhoven/epex-client
```

## Usage

First create an Epex client, with optional configuration.
The `debug` property allows for extra logging during usage of the client.

```typescript
import * as Epex from '@tvanlaerhoven/epex-client';

const client = new Epex.Client({ debug: true });
```

Then request the market data:

```typescript
try {
    // Get today's hourly market data
    const data = await client.getDayAheadMarketData(Epex.MarketArea.Belgium, Epex.today());
    console.log(`Today's electricity price from 9h-10h is €${data.entries[9].price}`);
} catch(error) {
    console.error(error.message);
}
```

## Rendering market data in a browser

The Epex website does not allow browser requests from any other location than its own host 
([CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)). To solve this, run a local
proxy server that drops any CORS headers from the http request.

```typescript
import * as Epex from '@tvanlaerhoven/epex-client';

const client = new Epex.Client({ proxyServer: 'http://localhost:8088', debug: true });
```

The [example](https://github.com/tvanlaerhoven/epex-client/tree/main/example) demonstrates this. Try it by running:

```sh
npm run example
```

The output is a table with today's market prices:

<img src="./docs/table.png" alt="Market Prices" width="500"/>



