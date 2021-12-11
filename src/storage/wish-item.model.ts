export interface WishItem {
    id?: number;
    image?: string;
    title?: string;
    description?: string;
    price?: string;
    links?: string[];
    expectedDate?: string;
    purchaseDate?: string;
    hidden?: boolean;
}

export type WishList = WishItem[];