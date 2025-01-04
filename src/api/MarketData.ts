import { MarketArea, MarketSegment, TradingModality } from './EpexClient';

export interface MarketEntry {
    /**
     * Start hour of this period.
     */
    startPeriod: number;

    /**
     * End hour of this period.
     */
    endPeriod: number;

    /**
     * The total amount of electricity (in MWh) that market participants wanted to buy at or below the market
     * clearing price.
     * It indicates the level of demand during the trading session.
     */
    buyVolume: number;

    /**
     * The total amount of electricity (in MWh) that market participants were willing to sell at or above the market
     * clearing price.
     * It shows the level of supply during the trading session.
     */
    sellVolume: number;

    /**
     * The total traded volume of electricity (in MWh) that was successfully matched between buyers and sellers
     * at the market-clearing price.
     * It represents the actual electricity that changed hands during the trading session.
     */
    volume: number;

    /**
     * Price of the electricity during this period, in €/MWh.
     */
    price: number;
}

export interface MarketData {
    /**
     * The market area for which data was requested.
     */
    area: MarketArea;

    /**
     * The delivery date for which data was requested.
     */
    deliveryDate: string;

    /**
     * The trading date at which the requested data was established.
     */
    tradingDate: string;

    /**
     * The trading modality of the requested data, which currently is always 'Auction'.
     */
    modality: TradingModality;

    /**
     * The market segment for which data was requested, either Day-Ahead or Intraday.
     */
    segment: MarketSegment;

    /**
     * The average of hourly prices over the entire requested delivery day.
     */
    baseloadPrice: number;

    /**
     * The peakload price is calculated as an average of hourly prices during
     * the peak delivery hours: 08:00–20:00 (local time), excluding weekends and public holidays.
     */
    peakloadPrice: number;

    /**
     * A list of all market entries for the requested data.
     */
    entries: MarketEntry[];
}
