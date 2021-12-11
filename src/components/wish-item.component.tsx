import './wish-list.component.scss'
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Component, Fragment, useState } from "react";
import { WishItem } from "../storage/wish-item.model";
import { container } from '../ioc';
import { IWishListProvider } from '../storage/wish-list.provider';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import Dropzone from 'react-dropzone';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

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

    private async save(ev: any) {
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

    private remove() {
        if (this.state.id == null) return;
        this.wishListProvider.delete(this.state.id).then(() => {
            this.props.onChange?.call(this);
        });
    }

    private imageDrop(file: File[]) {
        const reader = new FileReader();
        reader.readAsDataURL(file[0]);
        reader.onload = (e) => {
            this.setState({ image: e.target?.result as string });
        };
    }

    private addLink(value: string) {
        if (!value) return;
        this.setState(s => {
            const links = s.links ? [...s.links] : [];
            links.push(value);
            return { links };
        })
    }

    private removeLink(index: number) {
        if ((this.state.links ?? [])[index] == null) return;
        this.setState(s => {
            const links: string[] = [...s.links!];
            links.splice(index, 1);
            return { links };
        });
    }

    render() {
        return (
            <Fragment>
                <div className="drawer-top" onClick={e => this.props.requestsClose?.call(this)}>
                </div>
                <div className="wish-item-form" >
                    <form className="form-block" onSubmit={e => this.save(e)}>
                        <div className="form-body">
                            <div className="form-section form-top">
                                <div className="form-column form-top-left">
                                    <ImageDropper image={this.state.image} description={this.state.description} onDrop={acceptedFiles => this.imageDrop(acceptedFiles)}></ImageDropper>
                                    {/* {this.state.image && <Button variant="outlined" onClick={e => this.setState({ image: undefined })}>Delete</Button>} */}
                                </div>
                                <div className="form-column form-top-right">
                                    <TextField className="form-input" id="title" required label="Title" variant="outlined" value={this.state.title ?? ""} onChange={e => this.setState({ title: e.target.value })} />
                                    <FormControl className="form-input">
                                        <InputLabel htmlFor="outlined-adornment-amount">Price</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-amount"
                                            label="Price"
                                            inputMode="decimal"
                                            value={this.state.price ?? ""}
                                            onChange={e => this.setState({ price: e.target.value })}
                                            startAdornment={<InputAdornment position="start">£</InputAdornment>}
                                        />
                                    </FormControl>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Due Date"
                                            inputFormat="dd/MM/yyyy"
                                            onChange={date => {
                                                this.setState({ expectedDate: date?.toISOString() })
                                            }}
                                            value={this.state.expectedDate ? new Date(this.state.expectedDate) : null}
                                            renderInput={(params) => <TextField className="form-input" {...params} />}></DatePicker>
                                    </LocalizationProvider>
                                    <LinkAccordian className="form-input link-accordian" links={this.state.links} onConfirm={val => this.addLink(val)} onRemove={index => this.removeLink(index)}></LinkAccordian>
                                </div>
                            </div>
                            <div className="form-section form-middle">
                                <TextField className="form-input" label="Description" multiline value={this.state.description ?? ""} onChange={e => this.setState({ description: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-section form-bottom">
                            <div className="form-button">
                                {this.state.id != null && <Button variant="contained" color="error" onClick={e => this.remove()}>Delete</Button>}
                                <Button variant="contained" type="submit" disabled={!this.state.title}>Save</Button>
                            </div>
                        </div>
                    </form>
                </div >
            </Fragment>
        )
    }
}

function ImageDropper(props: { image?: string, description?: string, onDrop: (files: File[]) => void }) {
    return (<Dropzone onDrop={props.onDrop}>
        {({ getRootProps, getInputProps }) => (
            <section className={'drag-zone' + (props.image ? ' has-image' : '')}>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {props.image ?
                        <img src={props.image} alt={props.description} className="item-pic"></img>
                        :
                        <p>Drag & Drop files here or click to upload</p>}
                </div>
            </section>
        )}
    </Dropzone>)
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
                    return (<div className="existing-link-input" key={`link-${index}`} >
                        <LinkPreview className="link-preview" imageHeight="100px" url={link} fallback={
                            <Fragment>
                                <a href={link}>{link}</a>
                            </Fragment>

                        }></LinkPreview>
                        <Button onClick={e => props.onRemove(index)}><ClearIcon></ClearIcon></Button>
                    </div>)
                })}
                <div className="new-link-input">
                    <TextField className="form-input" size="small" variant="outlined" value={newLink} onChange={e => setNewLink(e.target.value)} />
                    <Button onClick={e => {
                        setNewLink("");
                        props.onConfirm(newLink);
                    }}><DoneIcon></DoneIcon></Button>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}
