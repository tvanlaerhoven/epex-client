import { MarketArea, MarketSegment, TradingModality } from './EpexClient';

export interface MarketEntry {
    startPeriod: number;
    endPeriod: number;
    buyVolume: number;
    sellVolume: number;
    volume: number;
    price: number;
}

export interface MarketData {
    area: MarketArea;
    deliveryDate: string;
    tradingDate: string;
    modality: TradingModality;
    segment: MarketSegment;
    baseloadPrice: number;
    peakloadPrice: number;
    entries: MarketEntry[];
}
