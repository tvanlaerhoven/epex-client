export const today = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

export const tomorrow = (): string => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

export const toQuarterHourlyString = (period: number): string => {
    const hours = Math.floor(period / 4)
        .toString()
        .padStart(2, '0');
    const minutes = ((period % 4) * 15).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const toHourlyString = (period: number): string => {
    return String(period).padStart(2, '0');
};
