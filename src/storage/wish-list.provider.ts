import { injectable } from "inversify";

export abstract class IWishListProvider {
    abstract thing: string;
}

@injectable()
export class WishListProvider {
    thing = "hello";
}
