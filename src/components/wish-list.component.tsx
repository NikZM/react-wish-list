

import React from "react";
import { container } from "../ioc";
import { IWishListProvider } from "../storage/wish-list.provider";


export class WishList extends React.Component {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    componentDidMount() {
    this.getAll()
    }

    add()
    {
        this.wishListProvider.add({
            title: 'hello',
            links: [],
            period: {
                day: {
                    end: 1
                }
            }
        }).then(item => {
            console.log('comp add', item);
        });
    }

    getAll()
    {
        this.wishListProvider.getAll().then(items => {
            console.log(items);
        })
    }

    delete(index: number)
    {
        this.wishListProvider.delete(index);
    }

    render() {
        return (<div>Howdy</div>);
    }
}