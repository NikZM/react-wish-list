

import { Avatar, Divider, List, ListItemAvatar, ListItemButton, ListItemText, SwipeableDrawer, Typography } from "@mui/material";
import React from "react";
import { container } from "../ioc";
import { WishItem } from "../storage/wish-item.model";
import { IWishListProvider } from "../storage/wish-list.provider";
import { WishItemComponent } from "./wish-item.component";
import './wish-item.component.scss';

interface Props { }
interface State {
    wishlist: WishItem[];
    currentItem?: WishItem;
}

export class WishList extends React.Component<Props, State> {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    constructor(props: Props) {
        super(props);
        this.state = {
            wishlist: [],
        }
    }

    componentDidMount() {
        this.wishListProvider.getAll().then(items => {
            this.setState({ wishlist: items });
        });
    }

    delete(index: number) {
        this.wishListProvider.delete(index);
    }

    setFocus(item?: WishItem) {
        this.setState({ currentItem: item });
    }

    onChange() {
        this.wishListProvider.getAll().then(items => {
            // Delete
            if (this.state.currentItem?.id && items.findIndex(item => item.id === this.state.currentItem?.id) < 0) {
                this.setState({ currentItem: undefined });
            }
            // Add
            else if (!this.state.currentItem) {
                const newItems = items.filter(item => !this.state.wishlist.find(ii => ii.id === item.id));
                if (newItems.length === 1) {
                    this.setState({
                        currentItem: newItems[0]
                    });
                }
            }
            this.setState({ wishlist: items });
        });
    }



    render() {
        const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
        return (
            <div className="wishlist">
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {
                        this.state.wishlist.map(item => {
                            return (
                                <React.Fragment key={item.id}>
                                    <ListItemButton alignItems="flex-start" selected={this.state.currentItem?.id === item.id}
                                        onClick={(event) => this.setFocus(item)}>
                                        <ListItemAvatar>
                                            <Avatar alt="Remy Sharp" src={item.image} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.title}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {item.description}
                                                    </Typography>

                                                </React.Fragment>
                                            }
                                        />
                                    </ListItemButton>
                                    <Divider variant="fullWidth" component="li" />
                                </React.Fragment>
                            );
                        })
                    }
                </List>
                <div className="click-away" onClick={e => this.setFocus(undefined)}></div>
                <SwipeableDrawer variant="persistent" anchor="bottom" disableBackdropTransition={!iOS} disableDiscovery={iOS} onOpen={() => { }} onClose={() => { }} open={true} >
                    <WishItemComponent item={this.state.currentItem} onChange={() => this.onChange()}></WishItemComponent>
                </SwipeableDrawer>

            </div>
        );
    }
}