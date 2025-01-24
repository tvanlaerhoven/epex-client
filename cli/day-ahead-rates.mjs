#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';

async function requestRates(area, deliveryDate, tradingDate, auction) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketData(area, deliveryDate, tradingDate, auction);
}

if (process.argv.length < 3) {
    console.log(
        'Usage: node day-ahead-rates.mjs <marketArea> [deliveryDate] [tradingDate] [auctionName].',
        '\nExample: "node day-ahead-rates BE 2025-01-09"'
    );
    process.exit(-1);
} else {
    requestRates(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
        .then((result) => {
            console.log(result);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
}
