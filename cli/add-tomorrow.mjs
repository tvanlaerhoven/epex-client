#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';
import * as fs from 'node:fs';
import * as readline from 'node:readline';
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
    const newLine = `${d.deliveryDate},${d.entries.map((entry) => entry.price).join(',')},${d.baseloadPrice},${d.peakloadPrice}`;
    if (fs.existsSync(filePath)) {
        // Read last line of the file
        const lastLine = await getLastLine(filePath);
        if (lastLine.substring(0, 10) === newLine.substring(0, 10)) {
            console.log(`Skipping duplicate entry for ${marketArea}.`);
            return;
        }
    }
    fs.appendFileSync(filePath, `${newLine}\n`, 'utf8');
}

async function getLastLine(filePath) {
    return new Promise((resolve, reject) => {
        let lastLine = '';
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });
        rl.on('line', (line) => {
            lastLine = line;
        });
        rl.on('close', () => resolve(lastLine));
        rl.on('error', reject);
    });
}

async function storeAllAreas() {
    let hasErrors = false;
    try {
        await Promise.all(
            Object.values(Epex.MarketArea).map(async (area) => {
                try {
                    await storeTomorrow(area);
                } catch (error) {
                    console.error(`Error storing new data for area ${area} - the data probably doesn't exist yet.`);
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

void storeAllAreas();
