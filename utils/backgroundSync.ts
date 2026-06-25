// Background Sync utilities for PWA

export interface SyncData {
  id: string
  type: 'post' | 'put' | 'delete' | 'custom'
  url: string
  data?: any
  timestamp: number
}

class BackgroundSyncManager {
  private db: IDBDatabase | null = null
  private dbName = 'backgroundSyncDB'
  private storeName = 'syncQueue'

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async addToSyncQueue(syncData: SyncData): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(syncData)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSyncQueue(): Promise<SyncData[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async registerSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await (registration as any).sync.register('background-sync')
    }
  }
}

export const backgroundSync = new BackgroundSyncManager()

// Example usage for offline data sync
export async function syncWhenOnline(): Promise<void> {
  if (!navigator.onLine) return

  const queue = await backgroundSync.getSyncQueue()
  
  for (const item of queue) {
    try {
      let response: Response
      
      switch (item.type) {
        case 'post':
          response = await fetch(item.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })
          break
        case 'put':
          response = await fetch(item.url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })
          break
        case 'delete':
          response = await fetch(item.url, { method: 'DELETE' })
          break
        default:
          continue
      }
      
      if (response.ok) {
        await backgroundSync.removeFromSyncQueue(item.id)
      }
    } catch {
      // Sync failed; item stays in queue for next attempt
    }
  }
}

