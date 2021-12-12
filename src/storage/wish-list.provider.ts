import { injectable } from "inversify";
import { WishItem, WishList } from "./wish-item.model";

export abstract class IWishListProvider {
    abstract get(index: number): Promise<WishItem>;
    abstract getAll(): Promise<WishList>;
    abstract add(item: Omit<WishItem, 'id'>): Promise<void>;
    abstract update(item: WishItem): Promise<void>;
    abstract delete(index: number): Promise<void>;
    abstract getAllTags(): Promise<Set<string>>;
}

const indexedDB = window.indexedDB;
@injectable()
export class WishListProvider {

    private _database?: IDBDatabase;
    private _error?: Error;

    private get database(): Promise<IDBDatabase> {
        if (this._error) {
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
        const database = indexedDB.open('wishlist', 4);
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

        if (ev.oldVersion < 1) {
            const objStore = db.createObjectStore('items', { autoIncrement: true, keyPath: 'id' });
            objStore.createIndex('id', 'id', { unique: true });
        }
        if (ev.oldVersion < 3) {
            const tagStore = db.createObjectStore('tags', { autoIncrement: true, keyPath: 'itemFK' });
            tagStore.createIndex('itemFK', 'itemFK', { unique: true });
        }

    }

    public async get(index: number): Promise<WishItem> {
        const transaction = (await this.database).transaction(['items'], 'readonly');
        const result = transaction.objectStore('items').get(index);

        const data = await new Promise<WishItem>((resolve, reject) => {
            result.onsuccess = (ev => {
                const item = (ev.target as IDBRequest<WishItem>).result;
                resolve(item);
            });
            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
        data.tags = await this.getTags(index);
        return data;
    }

    public async getAll(): Promise<WishList> {
        const transaction = (await this.database).transaction(['items'], 'readonly');
        const result = transaction.objectStore('items').getAll();

        const results = await new Promise<WishList>((resolve, reject) => {
            result.onsuccess = (ev => {
                const resultsList = (ev.target as IDBRequest<WishList>).result;
                resolve(resultsList);
            });

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });

        return await Promise.all(results.map(async o => {
            o.tags = await this.getTags(o.id!)
            return o;
        }))
    }

    private async getTags(index: number): Promise<Set<string>> {
        const transaction = (await this.database).transaction(['tags'], 'readonly');
        const result = transaction.objectStore('tags').get(index);
        return new Promise<Set<string>>((resolve, reject) => {
            result.onsuccess = (ev => {
                const resultsList = (ev.target as IDBRequest<{ itemFK: number, tags: string[] }>).result;
                const resultSet = new Set(resultsList?.tags);
                resolve(resultSet);
            });

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
    }

    public async getAllTags() {
        const transaction = (await this.database).transaction(['tags'], 'readonly');
        const result = transaction.objectStore('tags').getAll();
        return new Promise<Set<string>>((resolve, reject) => {
            result.onsuccess = (ev => {
                const resultsList = (ev.target as IDBRequest<{ itemFK: number, tags: string[] }[]>).result;
                const tagList = new Set<string>();
                resultsList.forEach(data => {
                    data.tags.forEach(tag => {
                        tagList.add(tag);
                    });
                });
                resolve(tagList);
            });

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            };
        });
    }

    public async add(item: Omit<WishItem, 'id'>) {
        const transaction = (await this.database).transaction(['items'], 'readwrite');
        const result = transaction.objectStore('items').add(item);

        const id = await new Promise<number>((resolve, reject) => {
            result.onsuccess = (ev: Event) => {
                resolve((ev.target as IDBRequest).result);
            }

            result.onerror = () => {
                reject(new Error('Transaction Failed'));
            }
        });
        await this.setTags({ tags: item.tags, id });
    }

    private async setTags(item: Pick<WishItem, 'id' | 'tags'>) {
        const transaction = (await this.database).transaction(['tags'], 'readwrite');
        const result = transaction.objectStore('tags').put({ itemFK: item.id, tags: item.tags && Array.from(item.tags) });
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
        await this.setTags(item);
        const transaction = (await this.database).transaction(['items'], 'readwrite');
        delete item.tags;

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
        await this.setTags({ id: index, tags: undefined });
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
