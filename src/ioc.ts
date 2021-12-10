import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";
import { IWishListProvider, WishListProvider } from "./storage/wish-list.provider";


const container = new Container();

container.bind<IWishListProvider>(IWishListProvider).to(WishListProvider);
const inject = getDecorators(container).lazyInject;

export { inject, container };