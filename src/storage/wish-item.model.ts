import { WishItemPeriod } from "./wish-item-period.model";

export interface WishItem {
    id: number;
    image?: Blob;
    title: string;
    links: string[];
    period: WishItemPeriod;
}

export type WishList = WishItem[];