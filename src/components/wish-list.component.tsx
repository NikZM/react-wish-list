

import React from "react";
import { container } from "../ioc";
import { IWishListProvider } from "../storage/wish-list.provider";


export class WishList extends React.Component {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    componentDidMount() {

    }

    render() {
        return (<div>Howdy</div>);
    }
}