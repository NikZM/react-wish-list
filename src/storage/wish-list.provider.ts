import { injectable } from "inversify";
import { WishItem, WishList } from "./wish-item.model";

export abstract class IWishListProvider {
    abstract get(index: number): Promise<WishItem>;
    abstract getAll(): Promise<WishList>;
    abstract add(item: Omit<WishItem, 'id'>): Promise<void>;
    abstract update(item: WishItem): Promise<void>;
    abstract delete(index: number): Promise<void>
}

const indexedDB = window.indexedDB;
@injectable()
export class WishListProvider {

    private _database?: IDBDatabase;
    private _error?: Error;

    private get database(): Promise<IDBDatabase> {
        if (this._error)
        {
            return Promise.reject(this._error);
        }
        if (this._database) {
            return Promise.resolve(this._database);
        }
        return new Promise(resolver => setTimeout(resolver, 100)).then(() => this.database);
    }

    constructor() {
        this.openDatabase()
    }

    private openDatabase() {
        const database = indexedDB.open('wishlist', 1);
        database.onsuccess = (ev) => {
            this._database = (ev.target as IDBOpenDBRequest).result;
        }
        database.onerror = () => {
            this._error = new Error('Database could not open');
        }
        database.onupgradeneeded = this.upgrade.bind(this);
    }

    private upgrade(ev: IDBVersionChangeEvent) {
        const db = (ev.target as IDBOpenDBRequest).result;
        switch (ev.oldVersion) {
            case 0:
                const objStore = db.createObjectStore('items', { autoIncrement: true, keyPath: 'id' });
                objStore.createIndex('id', 'id', { unique: true });
                return;
            case 1:
                return;
            case 2:
                return;
        }
    }

    public async get(index: number): Promise<WishItem> {
        const transaction = (await this.database).transaction(['items'], 'readonly');
        const result = transaction.objectStore('items').get(index);

        return new Promise<WishItem>((resolve, reject) => {
            result.onsuccess = (ev => {
                const item = (ev.target as IDBRequest<WishItem>).result;
                resolve(item);
            });
            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
    }

    public async getAll(): Promise<WishList> {
        const transaction = (await this.database).transaction(['items'], 'readonly');
        const result = transaction.objectStore('items').getAll();

        return new Promise<WishList>((resolve, reject) => {
            result.onsuccess = (ev => {
                const resultsList = (ev.target as IDBRequest<WishList>).result;
                resolve(resultsList);
            });

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
    }

    public async add(item: Omit<WishItem, 'id'>) {
        const transaction = (await this.database).transaction(['items'], 'readwrite');
        const result = transaction.objectStore('items').add(item);

        return new Promise<void>((resolve, reject) => {
            result.onsuccess = (ev: Event) => {
                // const id: number = (ev.target as IDBRequest).result;
                resolve();
            }

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            }
        });
    }

    public async update(item: WishItem) {
        const transaction = (await this.database).transaction(['items'], 'readwrite');
        const result = transaction.objectStore('items').put(item);

        return new Promise<void>((resolve, reject) => {
            result.onsuccess = () => {
                resolve();
            }
            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            }
        });
    }

    public async delete(index: number): Promise<void> {
        const transaction = (await this.database).transaction(['items'], 'readwrite');
        const result = transaction.objectStore('items').delete(index);
        transaction.commit();
        return new Promise<void>((resolve, reject) => {
            result.onsuccess = () => {
                resolve();
            };
            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
    }
}
