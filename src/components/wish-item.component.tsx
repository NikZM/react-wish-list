import './wish-list.component.scss'
import { Button, TextField } from "@mui/material";
import { Component } from "react";
import { WishItem } from "../storage/wish-item.model";
import { container } from '../ioc';
import { IWishListProvider } from '../storage/wish-list.provider';
import Dropzone from 'react-dropzone';

interface Props {
    item?: WishItem,
    onChange?: () => void;
}

type State = Partial<WishItem>;

export class WishItemComponent extends Component<Props, State> {

    private readonly wishListProvider: IWishListProvider = container.get(IWishListProvider);

    constructor(props: Props) {
        super(props);
        this.state = props.item ?? {};
    }

    componentDidUpdate(prevProps: Props) {

        if (this.props.item !== prevProps.item) {
            if (this.props.item == null) {
                this.setState(prevState => {
                    return Object.keys(prevState).reduce((acc, key) => {
                        acc[key] = undefined;
                        return acc;
                    }, {} as any);
                });
            }
            else {
                this.setState(prevState => {
                    const resetState = Object.keys(prevState).reduce((acc, key) => {
                        acc[key] = undefined;
                        return acc;
                    }, {} as any);
                    return { ...resetState, ...this.props.item };
                });
            }
        }
    }

    async save(ev: any) {
        ev.preventDefault();
        if (this.state.id != null) {
            await this.wishListProvider.update(this.state);
        }
        else {
            let copy = { ...this.state };
            if ((this.state as Object).hasOwnProperty('id')) {
                delete copy.id;
            }
            await this.wishListProvider.add(copy);
        }
        this.props.onChange?.call(this);
    }

    remove() {
        if (this.state.id == null) return;
        this.wishListProvider.delete(this.state.id).then(() => {
            this.props.onChange?.call(this);
        });
    }

    onPriceUpdate(price: string) {
        let priceString = price.replace('£', '');
        const decimalIndex = priceString.lastIndexOf('.');
        if (decimalIndex < 0) {
            priceString = `0.${priceString}`;
        }

        const p = parseFloat(price);
        const i = Math.floor(p * 100);

        this.setState({ price });
    }

    imageDrop(file: File[]) {
        const reader = new FileReader();
        reader.readAsDataURL(file[0]);
        reader.onload = (e) => {
            this.setState({ image: e.target?.result as string });
        };
    }

    render() {
        return (
            <div className="wish-item-form">
                <div className="image-block">
                    <Dropzone onDrop={acceptedFiles => this.imageDrop(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {this.state.image ?
                                        <img src={this.state.image} alt={this.state.description} className="item-pic"></img>
                                        :
                                        <p>Drag 'n' drop some files here, or click to select files</p>}
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    {/* {this.state.image && <Button variant="outlined" onClick={e => this.setState({ image: undefined })}>Delete</Button>} */}
                </div>
                <div className="form-block">
                    <form onSubmit={e => this.save(e)}>
                        <TextField id="title" label="Title" variant="outlined" value={this.state.title ?? ""} onChange={e => this.setState({ title: e.target.value })} />
                        <TextField id="outlined-textarea" label="Description" multiline value={this.state.description ?? ""} onChange={e => this.setState({ description: e.target.value })} />
                        <TextField id="price" label="Price" variant="outlined" value={this.state.price ?? ""} onChange={e => this.onPriceUpdate(e.target.value)} />
                        <Button variant="outlined" type="submit">Save</Button>
                        {this.state.id != null && <Button variant="outlined" onClick={e => this.remove()}>Delete</Button>}
                    </form>
                </div>

            </div >

        )
    }
}
