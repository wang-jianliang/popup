// class Database<T> {
//   private db: IDBDatabase | null = null;
//   private storeName: string;
//
//   constructor(storeName: string) {
//     this.storeName = storeName;
//   }
//
//   async open(): Promise<void> {
//     return new Promise<void>((resolve, reject) => {
//       const request = indexedDB.open('myDatabase', 1);
//
//       request.onupgradeneeded = () => {
//         const db = request.result;
//         db.createObjectStore(this.storeName, { keyPath: 'id' });
//       };
//
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve();
//       };
//
//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }
//
//   async saveItem(item: T): Promise<void> {
//     if (!this.db) {
//       throw new Error('Database is not open');
//     }
//
//     return new Promise<void>((resolve, reject) => {
//       const tx = this.db.transaction(this.storeName, 'readwrite');
//       const store = tx.objectStore(this.storeName);
//       const request = store.put(item);
//
//       request.onsuccess = () => {
//         resolve();
//       };
//
//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }
//
//   async loadItem(id: string): Promise<T | undefined> {
//     if (!this.db) {
//       throw new Error('Database is not open');
//     }
//
//     return new Promise<T | undefined>((resolve, reject) => {
//       const tx = this.db.transaction(this.storeName, 'readonly');
//       const store = tx.objectStore(this.storeName);
//       const request = store.get(id);
//
//       request.onsuccess = () => {
//         if (request.result) {
//           const item = request.result as T;
//           resolve(item);
//         } else {
//           resolve(undefined);
//         }
//       };
//
//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }
// }
