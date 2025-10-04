#!/usr/bin/env node
import * as Epex from '../dist/bundle.cjs.js';
import * as fs from 'node:fs';
import * as readline from 'node:readline';
import path from 'node:path';

const today = Epex.today();
const tomorrow = Epex.tomorrow();

async function requestRates(area, deliveryDate, product) {
    const client = new Epex.Client({ debug: true });
    return client.getDayAheadMarketData(area, deliveryDate, today, product);
}

async function storeTomorrow(marketArea, product) {
    const filePath = product === Epex.Product.HOURLY ? `../data/${marketArea}.csv` : `../data/${marketArea}-q.csv`;
    const d = await requestRates(marketArea, tomorrow, product);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
    }
    const newLine = `${d.deliveryDate},${d.entries.map((entry) => entry.price).join(',')},${d.baseloadPrice},${d.peakloadPrice}`;
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

async function storeAreas(product, areas) {
    let hasErrors = false;
    try {
        await Promise.all(
            areas.map(async (area) => {
                try {
                    await storeTomorrow(area, product);
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

void storeAreas(Epex.Product.HOURLY, Object.values(Epex.MarketArea));
void storeAreas(Epex.Product.QUARTER_HOURLY, Object.values(Epex.MarketArea));
