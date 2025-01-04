#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';

function requestRates(area, deliveryDate, tradingDate, auction) {
    const client = new Epex.Client({ debug: true });
    client
        .getDayAheadMarketData(area, deliveryDate, tradingDate, auction)
        .then((result) => {
            console.log(result);
        })
        .catch((err) => {
            console.error(err);
        });
}

if (process.argv.length < 3) {
    console.log(
        'Usage: node day-ahead-rates.mjs <marketArea> [deliveryDate] [tradingDate] [auctionName].',
        '\nExample: "node day-ahead-rates BE 2025-01-09"'
    );
} else {
    requestRates(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
}
