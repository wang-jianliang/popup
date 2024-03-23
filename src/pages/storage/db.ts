import { DATABASE_NAME } from '@src/constants';

const storeNames = ['message', 'session', 'global', 'agent'];

class ObjectStore<T> {
  static db: IDBDatabase | null = null;
  private readonly storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  get db(): IDBDatabase | null {
    return ObjectStore.db;
  }

  async open(): Promise<ObjectStore<T>> {
    return new Promise<ObjectStore<T>>((resolve, reject) => {
      if (ObjectStore.db) {
        console.log('db already open');
        resolve(this);
        return;
      }
      console.log(`try open db ${DATABASE_NAME}`);

      const request = indexedDB.open(DATABASE_NAME, 1);

      request.onsuccess = e => {
        console.log('onsuccess');
        ObjectStore.db = (e.target as IDBOpenDBRequest).result;
        resolve(this);
      };

      request.onupgradeneeded = function (e) {
        console.log('onupgradeneeded');
        const db = (e.target as IDBOpenDBRequest).result;
        for (const storeName of storeNames) {
          if (!db.objectStoreNames.contains(storeName)) {
            // if the object store doesn't exist, upgrade the version to trigger creating
            db.createObjectStore(storeName, { autoIncrement: true });
          }
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveItems(items: T[]): Promise<number[]> {
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<number[]>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const msgIds = [];
      tx.oncomplete = () => {
        resolve(msgIds);
      };
      const store = tx.objectStore(this.storeName);

      for (const item of items) {
        const request = store.put(item);
        request.onsuccess = event => {
          const id: number = (event.target as IDBRequest).result;
          msgIds.push(id);
          console.log('save item:', item, 'id:', id);
          if (msgIds.length === items.length) {
            tx.commit();
          }
        };
        request.onerror = () => {
          reject(request.error);
        };
      }
    });
  }

  async saveItemWithKey(item: T, key: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<number>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(item, key);

      request.onsuccess = event => {
        const id: number = (event.target as IDBRequest).result;
        resolve(id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveItem(item: T): Promise<number> {
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<number>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = event => {
        const id: number = (event.target as IDBRequest).result;
        resolve(id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async queryItems(query: string): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<T[]>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.openCursor();
      const items: T[] = [];

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;
        if (cursor) {
          if (cursor.value.toString().includes(query)) {
            items.push(cursor.value as T);
          }
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async loadItem(id: number | string): Promise<T | undefined> {
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<T | undefined>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const item = request.result as T;
          resolve(item);
        } else {
          resolve(undefined);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Load items from the object store, return the maxCount items at most
  async loadItems(maxCount: number): Promise<Map<number | string, T>> {
    if (!this.db) {
      throw new Error('Database is not open');
    }
    console.log('load items:', maxCount, this.storeName);

    return new Promise<Map<number | string, T>>((resolve, reject) => {
      // check if the object store exists

      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.openCursor();
      // const request = store.getAll(null, maxCount);
      const items: Map<number | string, T> = new Map<number | string, T>();

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;
        if (cursor && items.size < maxCount) {
          items.set(cursor.primaryKey as number, cursor.value as T);
          cursor.continue();
        } else {
          console.log('load items done:', items.size, maxCount, items);
          resolve(items);
        }
      };

      request.onerror = () => {
        console.log('load items error:', request.error);
        reject(request.error);
      };
    });
  }

  // Update the item in the object store

  async updateItem(id: number, item: T): Promise<void> {
    console.log('update item:', id, item);
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(item, id);

      request.onsuccess = () => {
        console.log('item updated:', id, item);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Delete the item in the object store
  async deleteItem(id: number | string): Promise<void> {
    console.log('delete item:', id);
    if (!this.db) {
      throw new Error('Database is not open');
    }

    return new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('item deleted:', id);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export default ObjectStore;
