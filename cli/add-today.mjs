#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';
import * as fs from 'node:fs';
import path from 'node:path';

const today = new Date().toISOString().split('T')[0];

async function requestRates(area, deliveryDate, tradingDate, auction) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketData(area, deliveryDate, tradingDate, auction);
}

async function storeToday(marketArea) {
    const currentYear = new Date().getFullYear().toString();
    const filePath = `../data/${currentYear}/${marketArea}.csv`;
    let auctionName = Epex.DayAheadAuction.SDAC;
    if (marketArea === Epex.MarketArea.GreatBritain) {
        auctionName = Epex.DayAheadAuction.GB_DAA1;
    }
    if (marketArea === Epex.MarketArea.Switzerland) {
        auctionName = Epex.DayAheadAuction.CH;
    }
    const d = await requestRates(marketArea, today, today, auctionName);
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
                    await storeToday(area);
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
