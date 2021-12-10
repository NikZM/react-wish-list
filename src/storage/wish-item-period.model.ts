export interface WishItemPeriod {
    year?: DateRange;
    month?: DateRange;
    day?: DateRange;
}

interface DateRange {
    start?: number;
    end: number;
}