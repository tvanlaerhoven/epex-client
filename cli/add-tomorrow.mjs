#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';
import * as fs from 'node:fs';
import path from 'node:path';

const tomorrow = Epex.tomorrow();

async function requestRates(area, deliveryDate, tradingDate, auction) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketData(area, deliveryDate, tradingDate, auction);
}

async function storeTomorrow(marketArea) {
    const filePath = `../data/${marketArea}.csv`;
    const d = await requestRates(marketArea, tomorrow);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
    }
    fs.appendFileSync(
        filePath,
        `${d.deliveryDate},${d.entries.map((entry) => entry.price).join(',')},${d.baseloadPrice},${d.peakloadPrice}\n`,
        'utf8'
    );
}

async function storeAllAreas() {
    let hasErrors = false;
    try {
        await Promise.all(
            Object.values(Epex.MarketArea).map(async (area) => {
                try {
                    await storeTomorrow(area);
                } catch (error) {
                    console.error(`Error storing area ${area}:`, error);
                    hasErrors = true;
                }
            })
        );
    } catch (error) {
        console.error('Error in storing areas:', error);
        hasErrors = true;
    }
    return hasErrors;
}

storeAllAreas();
