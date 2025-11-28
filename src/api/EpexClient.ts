// noinspection JSUnusedGlobalSymbols

import { MarketData } from './MarketData';
import { today } from './DateUtils';
import puppeteer, { Page } from 'puppeteer';
import { Browser } from 'puppeteer';

export enum MarketArea {
    Austria = 'AT',
    Belgium = 'BE',
    Denmark1 = 'DK1',
    Denmark2 = 'DK2',
    Finland = 'FI',
    France = 'FR',
    Germany = 'DE-LU',
    GreatBritain = 'GB',
    Netherlands = 'NL',
    Norway1 = 'NO1',
    Norway2 = 'NO2',
    Norway3 = 'NO3',
    Norway4 = 'NO4',
    Norway5 = 'NO5',
    Poland = 'PL',
    Sweden1 = 'SE1',
    Sweden2 = 'SE2',
    Sweden3 = 'SE3',
    Sweden4 = 'SE4',
    Switzerland = 'CH'
}

const marketAreaDescriptions: Record<MarketArea, string> = {
    [MarketArea.Austria]: 'Austria',
    [MarketArea.Belgium]: 'Belgium',
    [MarketArea.Denmark1]: 'Denmark (Zone 1)',
    [MarketArea.Denmark2]: 'Denmark (Zone 2)',
    [MarketArea.Finland]: 'Finland',
    [MarketArea.France]: 'France',
    [MarketArea.Germany]: 'Germany',
    [MarketArea.GreatBritain]: 'Great Britain',
    [MarketArea.Netherlands]: 'Netherlands',
    [MarketArea.Norway1]: 'Norway (Zone 1)',
    [MarketArea.Norway2]: 'Norway (Zone 2)',
    [MarketArea.Norway3]: 'Norway (Zone 3)',
    [MarketArea.Norway4]: 'Norway (Zone 4)',
    [MarketArea.Norway5]: 'Norway (Zone 5)',
    [MarketArea.Poland]: 'Poland',
    [MarketArea.Sweden1]: 'Sweden (Zone 1)',
    [MarketArea.Sweden2]: 'Sweden (Zone 2)',
    [MarketArea.Sweden3]: 'Sweden (Zone 3)',
    [MarketArea.Sweden4]: 'Sweden (Zone 4)',
    [MarketArea.Switzerland]: 'Switzerland'
};

export function getMarketAreaDescription(marketArea: MarketArea): string {
    return marketAreaDescriptions[marketArea];
}

export enum TradingModality {
    Auction = 'Auction'
}

export enum MarketSegment {
    DayAhead = 'DayAhead',
    Intraday = 'Intraday'
}

export enum Product {
    /**
     * Request quarter-hourly data.
     */
    QUARTER_HOURLY = '15',

    /**
     * Request hourly data.
     */
    HOURLY = '60'
}

export enum DayAheadAuction {
    /**
     * Single Day-Ahead Coupling (formerly Multi-Regional Coupling or MRC).
     *
     * A pan-European market coupling mechanism that integrates electricity markets across Europe.
     * Facilitates cross-border electricity trading by matching supply and demand across regions, optimizing network
     * usage.
     */
    SDAC = 'MRC',

    /**
     * First Day-Ahead Auction specifically for Great Britain (GB).
     *
     * Ensures price formation and market operations specific to Great Britain.
     */
    GB_DAA1 = 'GB',

    /**
     * Second Day-Ahead Auction for Great Britain.
     */
    GB_DAA2 = '30-call-GB',

    /**
     * Day-Ahead Auction for Switzerland.
     *
     * A standalone auction process specific to the Swiss electricity market, which operates differently due to
     * Switzerland's non-EU status but maintains connections with neighboring markets.
     */
    CH = 'CH'
}

export enum IntradayAuction {
    /**
     * First Intraday Auction under the Single Intraday Coupling (SIDC) framework.
     *
     * The SIDC mechanism enables cross-border intraday electricity trading between participating European countries.
     * IDA1 is the first auction in the intraday trading process, which allows market participants to adjust their
     * positions closer to real-time trading.
     */
    SIDC_IDA1 = 'IDA1',

    /**
     * Second Intraday Auction under the SIDC framework.
     *
     * Similar to IDA1, but it is typically scheduled later in the day to allow for additional adjustments to
     * electricity positions. This auction provides flexibility for market participants to buy or sell electricity
     * closer to the delivery time.
     */
    SIDC_IDA2 = 'IDA2',

    /**
     * Third Intraday Auction under the SIDC framework.
     *
     * It provides a final opportunity for market participants to make last-minute adjustments before the electricity
     * delivery time, optimizing cross-border trading and balancing of electricity supply and demand.
     */
    SIDC_IDA3 = 'IDA3',

    /**
     * First Intraday Auction for Switzerland (CH) under the intraday coupling mechanism.
     *
     * Switzerland has a separate intraday auction process, which is integrated with the European SIDC mechanism,
     * allowing cross-border trading between Switzerland and neighboring countries.
     */
    CH_IDA1 = 'CH-IDA1',

    /**
     * Second Intraday Auction for Switzerland.
     *
     * As with IDA1, but scheduled later in the day, this auction allows Swiss market participants to make additional
     * adjustments for electricity trading with neighboring countries.
     */
    CH_IDA2 = 'CH-IDA2',

    /**
     * First Intraday Auction for Great Britain (GB).
     *
     * Great Britain has its own intraday auction process, which is also integrated into the SIDC mechanism, enabling
     * cross-border electricity trading with neighboring countries.
     */
    GB_IDA1 = 'GB-IDA1',

    /**
     * Second Intraday Auction for Great Britain.
     *
     * Similar to the other auctions, GB-IDA2 allows for further adjustments to positions, allowing market participants
     * in Great Britain to buy or sell electricity closer to delivery time.
     */
    GB_IDA2 = 'GB-IDA2'
}

export interface ClientConfig {
    /**
     * Optionally use a proxy server. This could be useful to by-pass CORS restrictions.
     */
    proxyServer?: string;

    /**
     * Optionally output some debug logging.
     */
    debug?: boolean;
}

export interface RequestOptions {
    /**
     * Optionally provide an existing browser instance to reuse across multiple requests.
     */
    withBrowser?: Browser;

    /**
     * Optionally add a delay (in milliseconds) before making the request.
     */
    requestDelayMs?: number;

    /**
     * Optionally add a random spread delay (in milliseconds) before making the request.
     */
    requestSpreadDelayMs?: number;

    /**
     * Optionally set the delay (in milliseconds) between retries when parsing fails.
     */
    retryDelayMs?: number;

    /**
     * Optionally set the maximum number of retries when parsing fails.
     */
    maxRetries?: number;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_REQUEST_DELAY_MS = 1000;
const DEFAULT_RETRY_DELAY_MS = 2000;
const NO_DATA_ERROR = 'No data for this combination';
const BROWSER_LAUNCH_OPTS = {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-minimized']
};

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5341f Safari/604.1'
];

export class Client {
    constructor(private readonly config: ClientConfig) {}

    async getDayAheadMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        product: Product = Product.HOURLY,
        auction?: DayAheadAuction,
        requestOptions?: RequestOptions
    ) {
        if (!auction) {
            auction = DayAheadAuction.SDAC;
            if (area === MarketArea.GreatBritain) {
                auction = DayAheadAuction.GB_DAA1;
            }
            if (area === MarketArea.Switzerland) {
                auction = DayAheadAuction.CH;
            }
        }
        return this.getMarketData(area, deliveryDate, tradingDate, product, MarketSegment.DayAhead, auction, requestOptions);
    }

    async getDayAheadMarketDataList(
        areas: MarketArea[],
        deliveryDate: string = today(),
        tradingDate: string = today(),
        product: Product = Product.HOURLY,
        auction?: DayAheadAuction,
        requestOptions?: RequestOptions
    ): Promise<MarketData[]> {
        const browser = requestOptions?.withBrowser ?? (await puppeteer.launch(BROWSER_LAUNCH_OPTS));
        const result: MarketData[] = [];
        for (const area of areas) {
            try {
                const data = await this.getDayAheadMarketData(area, deliveryDate, tradingDate, product, auction, {
                    ...requestOptions,
                    withBrowser: browser
                });
                result.push(data);
            } catch (error) {
                this.debug(`Error fetching data for area ${area}:`, (error as Error).message);
            }
        }
        await browser?.close();
        return result;
    }

    async getIntradayMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        product: Product = Product.HOURLY,
        auction: IntradayAuction = IntradayAuction.SIDC_IDA1
    ) {
        return this.getMarketData(area, deliveryDate, tradingDate, product, MarketSegment.Intraday, auction);
    }

    async getMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        product: Product = Product.HOURLY,
        segment = MarketSegment.DayAhead,
        auction?: DayAheadAuction | IntradayAuction,
        requestOptions?: RequestOptions
    ): Promise<MarketData> {
        // disable certificate issues
        if (typeof process !== 'undefined' && process.env) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        const url = this.buildUrl(area, deliveryDate, tradingDate, product, segment, auction);
        this.debug('fetching url', url);
        const browser = requestOptions?.withBrowser ?? (await puppeteer.launch(BROWSER_LAUNCH_OPTS));

        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            });
        });
        await page.setJavaScriptEnabled(true);
        await setRandomUserAgent(page);

        await page.goto(url, { waitUntil: 'networkidle2' });
        await sleep(
            (requestOptions?.requestDelayMs ?? DEFAULT_REQUEST_DELAY_MS) + Math.floor(Math.random() * (requestOptions?.requestSpreadDelayMs ?? 0))
        );

        let html = await page.content();
        let tableData;
        let attempts = 0;
        const couldHaveData = !html.includes(NO_DATA_ERROR);

        if (!couldHaveData) {
            await page.close();
            if (!requestOptions?.withBrowser) {
                await browser.close();
            }
            throw new Error(`Failed to fetch market data: ${NO_DATA_ERROR}`);
        }

        while (!tableData && attempts < (requestOptions?.maxRetries ?? DEFAULT_MAX_ATTEMPTS)) {
            try {
                tableData = this.parseTable(html);
            } catch (error) {
                this.debug(`Error parsing data for area ${area}, retrying ...`);
                attempts += 1;
                await sleep(requestOptions?.requestDelayMs ?? DEFAULT_RETRY_DELAY_MS);
                await setRandomUserAgent(page);
                await page.reload({
                    ignoreCache: true,
                    waitUntil: 'networkidle2'
                });
                html = await page.content();
            }
        }
        await page.close();

        if (!tableData) {
            throw new Error(`Failed to fetch market data after ${DEFAULT_MAX_ATTEMPTS} attempts`);
        }

        if (!requestOptions?.withBrowser) {
            await browser.close();
        }

        return {
            area,
            deliveryDate: this.extractDate(html, 'delivery_date', deliveryDate),
            tradingDate: this.extractDate(html, 'trading_date', tradingDate),
            modality: TradingModality.Auction,
            segment,
            baseloadPrice: 0,
            peakloadPrice: 0,
            entries: [],
            ...tableData
        };
    }

    private parseTable(data: string): Partial<MarketData> {
        const table = data.match(/<table data-head(.*?)<\/table>/s);
        if (!table) {
            throw new Error(`Something is wrong: could not find table data!`);
        }
        const tableContent = table[1];
        const baseloadMatch = tableContent.match(/<div class="flex day-1">[\s\S]*?<span>(-?[\d.]+)<\/span>/);
        const peakloadMatch = tableContent.match(/<div class="flex day-2">[\s\S]*?<span>(-?[\d.]+)<\/span>/);
        const baseloadPrice = baseloadMatch ? parseFloat(baseloadMatch[1]) : 0;
        const peakloadPrice = peakloadMatch ? parseFloat(peakloadMatch[1]) : 0;
        const rowMatches = [...tableContent.matchAll(/<tr class="child.*?">(.*?)<\/tr>/gs)];
        const entries = rowMatches.map((match, index) => {
            const cells = [...match[1].matchAll(/<td>(-?[\d.,]+)<\/td>/g)];
            return {
                startPeriod: index,
                endPeriod: index + 1,
                buyVolume: this.parseExpectedCellFloatData(cells[0]?.[1]),
                sellVolume: this.parseExpectedCellFloatData(cells[1]?.[1]),
                volume: this.parseExpectedCellFloatData(cells[2]?.[1]),
                price: this.parseExpectedCellFloatData(cells[3]?.[1])
            };
        });
        return {
            baseloadPrice,
            peakloadPrice,
            entries
        };
    }

    private buildUrl(
        area: MarketArea,
        deliveryDate: string,
        tradingDate: string,
        product: Product,
        marketSegment: MarketSegment,
        auction?: DayAheadAuction | IntradayAuction
    ): string {
        return (
            `${this.maybeUseProxy('https://www.epexspot.com/en/market-results')}` +
            `?market_area=${area}` +
            `&auction=${auction ?? ''}` +
            `&delivery_date=${deliveryDate}` +
            `&underlying_year=` +
            `&modality=${TradingModality.Auction}` +
            `&sub_modality=${marketSegment}` +
            `&technology=` +
            `&data_mode=table` +
            `&period=` +
            `&trading_date=${tradingDate}` +
            `&product=${product}`
        );
    }

    private maybeUseProxy(url: string): string {
        if (this.config.proxyServer) {
            const proxyUrl = `${this.config.proxyServer}/${url}`;
            this.debug('Using proxy url', proxyUrl);
            return proxyUrl;
        }
        return url;
    }

    private extractDate(text: string, key: string, fallback: string): string {
        const regex = new RegExp(`${key}=(\\d{4}-\\d{2}-\\d{2})`);
        const match = text.match(regex);
        return match ? match[1] : fallback;
    }

    private parseExpectedCellFloatData(value?: string): number {
        if (!value) {
            throw new Error('Failed to find expected table data');
        }
        return parseFloat(value.replace(/,/g, ''));
    }

    private debug(message: string, ...other: string[]) {
        if (this.config.debug) {
            console.debug('EPEX', message, ...other);
        }
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function setRandomUserAgent(page: Page) {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    return page.setUserAgent({ userAgent });
}
