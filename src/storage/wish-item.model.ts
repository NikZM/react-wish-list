import { WishItemPeriod } from "./wish-item-period.model";

export interface WishItem {
    id?: number;
    image?: string;
    title?: string;
    description?: string;
    price?: string;
    links?: string[];
    period?: WishItemPeriod;
}

export type WishList = WishItem[];