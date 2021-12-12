import './wish-item.component.scss';
import { Avatar, Divider, List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader, SwipeableDrawer, Typography } from "@mui/material";
import { Component, Fragment } from "react";
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

export class WishList extends Component<Props, State> {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    constructor(props: Props) {
        super(props);
        this.state = {
            wishlist: [],
            drawerOpen: true,
        }
    }

    componentDidMount() {
        this.wishListProvider.getAll()
            .then(items => [...items].sort(this.sortItemByDate))
            .then(items => {
                this.setState({ wishlist: items });
            });
    }

    private sortItemByDate(a: WishItem, b: WishItem): number {
        if (a.expectedDate && !b.expectedDate) {
            return -1;
        }
        else if (!a.expectedDate && b.expectedDate) {
            return 1;
        }
        else if (!a.expectedDate && !b.expectedDate) {
            return 0;
        }
        else {
            return new Date(a.expectedDate!).getTime() - new Date(b.expectedDate!).getTime();
        }
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

    get listByMonth(): { title?: string, items: WishItem[] }[] {
        return this.state.wishlist.reduce<{ title?: string, items: WishItem[] }[]>((acc, val) => {
            const date = val.expectedDate ? new Date(val.expectedDate) : null;
            const iMonth: { title?: string, items: WishItem[] } | undefined = acc[acc.length - 1];
            if (date == null) {
                console.log('title', iMonth, iMonth.title != null, val)
                if (iMonth.title != null) {
                    acc.push({ items: [] as WishItem[] });
                }
                iMonth.items.push(val);
                return acc;
            }
            const title = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
            if ((iMonth?.title ?? null) === title) {
                iMonth.items.push(val);
            }
            else {
                acc.push({ title, items: [val] });
            }
            return acc;
        }, []);
    }

    onChange() {
        this.wishListProvider.getAll()
            .then(items => items.sort(this.sortItemByDate))
            .then(items => {
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
                        this.listByMonth.map(month => {
                            return (
                                <Fragment key={month.title ?? 'other'}>
                                    <ListSubheader className="month-header">{month.title ?? 'other'}</ListSubheader>
                                    {
                                        month.items.map(item => {
                                            return (
                                                <Fragment key={item.id}>
                                                    <ListItemButton className="list-item" alignItems="flex-start" selected={this.state.currentItem?.id === item.id}
                                                        onClick={(event) => this.setFocus(item)}>
                                                        <ListItemAvatar>
                                                            <Avatar alt="Remy Sharp" src={item.image} />
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={item.title}
                                                            secondary={
                                                                <Fragment>
                                                                    <Typography
                                                                        sx={{ display: 'inline' }}
                                                                        component="span"
                                                                        variant="body2"
                                                                        color="text.primary"
                                                                    >
                                                                        {item.description}
                                                                    </Typography>

                                                                </Fragment>
                                                            }
                                                        />
                                                        <ListItemText className="price">{item.price && `£${item.price}`}</ListItemText>
                                                    </ListItemButton>
                                                    <Divider variant="fullWidth" component="li" />
                                                </Fragment>
                                            )
                                        })
                                    }
                                </Fragment>
                            );
                        })
                    }
                </List>
                <div className="click-away" onClick={e => this.toggleDrawerState()}></div>
                <SwipeableDrawer className="bottom-drawer" variant="persistent" anchor="bottom" disableBackdropTransition={!iOS} disableDiscovery={iOS} onOpen={() => { }} onClose={() => { }} open={this.state.drawerOpen} >
                    <WishItemComponent requestsClose={() => this.setState({ drawerOpen: false, currentItem: undefined })} item={this.state.currentItem} onChange={() => this.onChange()}></WishItemComponent>
                </SwipeableDrawer>

            </div>
        );
    }
}