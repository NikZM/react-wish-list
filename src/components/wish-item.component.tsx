import './wish-list.component.scss'
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControl, Input, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Component, Fragment, useState } from "react";
import { WishItem } from "../storage/wish-item.model";
import { container } from '../ioc';
import { IWishListProvider } from '../storage/wish-list.provider';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import Dropzone from 'react-dropzone';
import Clear from '@mui/icons-material/Clear';
import { LinkPreview } from '@dhaiwat10/react-link-preview';

interface Props {
    item?: WishItem,
    onChange?: () => void;
    requestsClose?: () => void;
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
        this.setState({ price });
    }

    imageDrop(file: File[]) {
        const reader = new FileReader();
        reader.readAsDataURL(file[0]);
        reader.onload = (e) => {
            this.setState({ image: e.target?.result as string });
        };
    }

    addLink(value: string) {
        if (!value) return;
        this.setState(s => {
            const links = s.links ? [...s.links] : [];
            links.push(value);
            return { links };
        })
    }

    removeLink(index: number) {
        if ((this.state.links ?? [])[index] == null) return;
        this.setState(s => {
            const links: string[] = [...s.links!];
            links.splice(index, 1);
            return { links };
        });
    }

    render() {
        return (
            <div className="wish-item-form" > { /* onClick={e => this.props.requestsClose?.call(this)}> */}
                <div className="image-block">
                    <Dropzone onDrop={acceptedFiles => this.imageDrop(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section className={'drag-zone' + (this.state.image ? ' has-image' : '')}>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {this.state.image ?
                                        <img src={this.state.image} alt={this.state.description} className="item-pic"></img>
                                        :
                                        <p>Drag & Drop files here or click to upload</p>}
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    {/* {this.state.image && <Button variant="outlined" onClick={e => this.setState({ image: undefined })}>Delete</Button>} */}
                </div>

                <form className="form-block" onSubmit={e => this.save(e)}>
                    <div className="field-block">
                        <TextField id="title" required label="Title" variant="outlined" value={this.state.title ?? ""} onChange={e => this.setState({ title: e.target.value })} />
                        <FormControl>
                            <InputLabel htmlFor="outlined-adornment-amount">Price</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-amount"
                                label="Price"
                                inputMode="decimal"
                                value={this.state.price ?? ""}
                                onChange={e => this.onPriceUpdate(e.target.value)}
                                startAdornment={<InputAdornment position="start">£</InputAdornment>}
                            />
                        </FormControl>
                        <TextField id="outlined-textarea" label="Description" multiline value={this.state.description ?? ""} onChange={e => this.setState({ description: e.target.value })} />
                        <LinkAccordian className="link-accordian" links={this.state.links} onConfirm={val => this.addLink(val)} onRemove={index => this.removeLink(index)}></LinkAccordian>
                    </div>

                    <div className="form-button">
                        {this.state.id != null && <Button variant="contained" color="error" onClick={e => this.remove()}>Delete</Button>}
                        <Button variant="contained" type="submit" disabled={!this.state.title}>Save</Button>
                    </div>
                </form>
            </div >

        )
    }
}

function LinkAccordian(props: { className?: string, links?: string[], onConfirm: (value: string) => void, onRemove: (index: number) => void }) {
    const [newLink, setNewLink] = useState("");
    return (
        <Accordion className={props.className}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>Links ({props.links?.length ?? 0})</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {props.links?.map((link, index) => {
                    return (<Fragment key={`link-${index}`} >
                        <LinkPreview className="link-preview" imageHeight="100px" url={link} fallback={
                            <Fragment>
                                <a href={link}>{link}</a>
                            </Fragment>

                        }></LinkPreview>
                        <Button onClick={e => props.onRemove(index)}><Clear></Clear></Button>
                    </Fragment>)
                })}
                <Fragment>
                    <TextField variant="outlined" value={newLink} onChange={e => setNewLink(e.target.value)} />
                    <Button onClick={e => {
                        setNewLink("");
                        props.onConfirm(newLink);
                    }}><DoneIcon></DoneIcon></Button>
                </Fragment>
            </AccordionDetails>
        </Accordion>
    )

}

