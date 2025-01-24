// noinspection JSUnusedGlobalSymbols

import { MarketData } from './MarketData';
import { today } from './DateUtils';

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

export class Client {
    constructor(private readonly config: ClientConfig) {}

    async getDayAheadMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        auction: DayAheadAuction = DayAheadAuction.SDAC
    ) {
        return this.getMarketData(area, deliveryDate, tradingDate, MarketSegment.DayAhead, auction);
    }

    async getIntradayMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        auction: IntradayAuction = IntradayAuction.SIDC_IDA1
    ) {
        return this.getMarketData(area, deliveryDate, tradingDate, MarketSegment.Intraday, auction);
    }

    async getMarketData(
        area: MarketArea,
        deliveryDate: string = today(),
        tradingDate: string = today(),
        segment = MarketSegment.DayAhead,
        auction?: DayAheadAuction | IntradayAuction
    ): Promise<MarketData> {
        // disable certificate issues
        if (process?.env) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        const url = this.buildUrl(area, deliveryDate, tradingDate, segment, auction);
        this.debug('fetching url', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error reading market result: ${response.status}`);
        }
        const text = await response.text();

        return {
            area,
            deliveryDate: this.extractDate(text, 'delivery_date', deliveryDate),
            tradingDate: this.extractDate(text, 'trading_date', tradingDate),
            modality: TradingModality.Auction,
            segment,
            baseloadPrice: 0,
            peakloadPrice: 0,
            entries: [],
            ...this.parseTable(text)
        };
    }

    private parseTable(data: string): Partial<MarketData> {
        const table = data.match(/<table data-head(.*?)<\/table>/s);
        if (!table) {
            throw new Error('Something is wrong: could not find table data');
        }
        const tableContent = table[1];
        const baseloadMatch = tableContent.match(/<div class="flex day-1">[\s\S]*?<span>([\d.]+)<\/span>/);
        const peakloadMatch = tableContent.match(/<div class="flex day-2">[\s\S]*?<span>([\d.]+)<\/span>/);
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
        marketSegment: MarketSegment,
        auction?: DayAheadAuction | IntradayAuction
    ): string {
        return (
            `${this.maybeUseProxy('https://www.epexspot.com/en/market-results')}` +
            `?market_area=${area}` +
            `&delivery_date=${deliveryDate}` +
            `&trading_date=${tradingDate}` +
            `&modality=${TradingModality.Auction}` +
            `&sub_modality=${marketSegment}` +
            `&auction=${auction ?? ''}` +
            `&data_mode=table`
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
