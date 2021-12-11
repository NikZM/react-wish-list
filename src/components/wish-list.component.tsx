import './wish-item.component.scss';
import { Avatar, Divider, List, ListItemAvatar, ListItemButton, ListItemText, SwipeableDrawer, Typography } from "@mui/material";
import React from "react";
import { container } from "../ioc";
import { WishItem } from "../storage/wish-item.model";
import { IWishListProvider } from "../storage/wish-list.provider";
import { WishItemComponent } from "./wish-item.component";

interface Props { }
interface State {
    wishlist: WishItem[];
    currentItem?: WishItem;
    drawerOpen: boolean;
}

export class WishList extends React.Component<Props, State> {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    constructor(props: Props) {
        super(props);
        this.state = {
            wishlist: [],
            drawerOpen: true,
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
        if (this.state.currentItem === item) {
            this.setState({ drawerOpen: false, currentItem: undefined })
        }
        else {
            this.setState({ currentItem: item, drawerOpen: true });
        }
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

    toggleDrawerState() {
        if (this.state.drawerOpen) {
            if (this.state.currentItem) {
                this.setState({ currentItem: undefined });
            }
            else {
                this.setState({ drawerOpen: false });
            }
        }
        else {
            this.setState({ drawerOpen: true });
        }
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
                <div className="click-away" onClick={e => this.toggleDrawerState()}></div>
                <SwipeableDrawer variant="persistent" anchor="bottom" disableBackdropTransition={!iOS} disableDiscovery={iOS} onOpen={() => { }} onClose={() => { }} open={this.state.drawerOpen}>
                    <WishItemComponent item={this.state.currentItem} onChange={() => this.onChange()}></WishItemComponent>
                </SwipeableDrawer>

            </div>
        );
    }
}