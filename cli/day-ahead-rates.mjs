#!/usr/bin/env node
import * as Epex from '../dist/esm/index.js';

async function requestRates(area, deliveryDate, tradingDate, product, auction) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketData(area, deliveryDate, tradingDate, product, auction);
}

if (process.argv.length < 3) {
    console.log(
        'Usage: node day-ahead-rates.mjs <marketArea> [deliveryDate] [tradingDate] [product] [auctionName].',
        '\nExamples:',
        '\n\t"node day-ahead-rates BE 2025-01-09 2025-11-19 60", for hourly BE data.',
        '\n\t"node day-ahead-rates BE 2025-01-09 2025-11-19 15", for quarter-hourly BE data.'
    );
    process.exit(-1);
} else {
    requestRates(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6])
        .then((result) => {
            console.log(result);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
}
