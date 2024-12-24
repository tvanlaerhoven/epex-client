export const today = () => {
    return new Date().toISOString().slice(0, 10);
};

export const tomorrow = () => {
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
};

export const toQuarterlyString = (period: number): string => {
    const hours = Math.floor(period / 4)
        .toString()
        .padStart(2, '0');
    const minutes = ((period % 4) * 15).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const toHourlyString = (period: number): string => {
    return String(period).padStart(2, '0');
};
