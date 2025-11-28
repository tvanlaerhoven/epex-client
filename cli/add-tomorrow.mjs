#!/usr/bin/env node
import * as Epex from '../dist/esm/index.js';
import * as fs from 'node:fs';
import * as readline from 'node:readline';
import path from 'node:path';

const today = Epex.today();
const tomorrow = Epex.tomorrow();

async function requestRates(marketAreas, deliveryDate, product) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketDataList(marketAreas, deliveryDate, today, product, undefined, {
        maxRetries: 1,
        requestDelayMs: 25000,
        requestSpreadDelayMs: 10000,
        retryDelayMs: 3000
    });
}

async function storeTomorrow(marketAreas, product) {
    const results = await requestRates(marketAreas, tomorrow, product);

    await Promise.all(
        marketAreas.map(async (marketArea) => {
            const filePath = product === Epex.Product.HOURLY ? `../data/${marketArea}.csv` : `../data/${marketArea}-q.csv`;
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`Directory created: ${dir}`);
            }
            const result = results.find((r) => r.area === marketArea);
            if (result) {
                const newLine = `${result.deliveryDate},${result.entries.map((entry) => entry.price).join(',')},${result.baseloadPrice},${result.peakloadPrice}`;
                if (fs.existsSync(filePath)) {
                    // Read last line of the file
                    const lastLine = await getLastLine(filePath);
                    const newDate = newLine.substring(0, 10);
                    const lastDate = lastLine.substring(0, 10);

                    // We already have data for the last day
                    if (new Date(newDate) <= new Date(lastDate)) {
                        console.log(`Skipping earlier entry for ${marketArea}: new date ${newDate} <= old date ${lastDate}.`);
                        return;
                    }
                }
                fs.appendFileSync(filePath, `${newLine}\n`, 'utf8');
            }
        })
    );
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

async function filterAreas(marketAreas, product) {
    const filteredAreas = [];
    const tomorrowDate = new Date(tomorrow);
    await Promise.all(
        marketAreas.map(async (marketArea) => {
            const filePath = product === Epex.Product.HOURLY ? `../data/${marketArea}.csv` : `../data/${marketArea}-q.csv`;
            if (fs.existsSync(filePath)) {
                // Read last line of the file
                const lastLine = await getLastLine(filePath);
                const lastDate = lastLine.substring(0, 10);

                // We don't have data for tomorrow yet
                if (tomorrowDate > new Date(lastDate)) {
                    filteredAreas.push(marketArea);
                }
            }
        })
    );

    return filteredAreas;
}

async function storeAreas(product, areas) {
    let hasErrors = false;
    try {
        const filteredAreas = await filterAreas(areas, product);
        console.log('New data will be fetched for areas:', filteredAreas);
        await storeTomorrow(filteredAreas, product);
    } catch (error) {
        console.error('Error in storing areas:', error);
        hasErrors = true;
    }
    return hasErrors;
}

let areas = Object.values(Epex.MarketArea);
if (process.argv.length > 2) {
    areas = process.argv[2].split(',');
}

await storeAreas(Epex.Product.QUARTER_HOURLY, areas);
await storeAreas(Epex.Product.HOURLY, areas);
