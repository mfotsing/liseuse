const DB_NAME = 'liseuse-db'
const DB_VERSION = 1
const STORE_LIBRARY = 'library'
const STORE_BOOKMARKS = 'bookmarks'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
        const store = db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' })
        store.createIndex('lastOpenedAt', 'lastOpenedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
        db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function withStore(storeName, mode = 'readonly') {
  return openDB().then(db => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    return { store, tx, db }
  })
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Generate a stable ID from document name + first 100 chars of text
export function docId(name, text) {
  const key = `${name}::${(text || '').slice(0, 100)}`
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
  }
  return `doc-${Math.abs(hash).toString(36)}`
}

// ─── Library ───

export async function saveToLibrary(doc) {
  const { store } = await withStore(STORE_LIBRARY, 'readwrite')
  return promisify(store.put({
    id: doc.id,
    name: doc.name,
    text: doc.text,
    pages: doc.pages,
    lastOpenedAt: Date.now(),
    sentenceIndex: doc.sentenceIndex || 0,
    currentPage: doc.currentPage || 0,
    rate: doc.rate,
    voiceName: doc.voiceName,
  }))
}

export async function getFromLibrary(id) {
  const { store } = await withStore(STORE_LIBRARY)
  return promisify(store.get(id))
}

export async function getAllFromLibrary() {
  const { store } = await withStore(STORE_LIBRARY)
  return promisify(store.getAll()).then(docs =>
    docs.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
  )
}

export async function removeFromLibrary(id) {
  const { store } = await withStore(STORE_LIBRARY, 'readwrite')
  return promisify(store.delete(id))
}

export async function updateReadingPosition(id, sentenceIndex, currentPage) {
  const doc = await getFromLibrary(id)
  if (!doc) return
  doc.sentenceIndex = sentenceIndex
  doc.currentPage = currentPage
  doc.lastOpenedAt = Date.now()
  const { store } = await withStore(STORE_LIBRARY, 'readwrite')
  return promisify(store.put(doc))
}

// ─── Bookmarks ───

export async function getBookmarks(docId) {
  const { store } = await withStore(STORE_BOOKMARKS)
  const record = await promisify(store.get(docId))
  return record?.bookmarks || []
}

export async function addBookmark(documentId, bookmark) {
  const existing = await getBookmarks(documentId)
  existing.push({
    sentenceIndex: bookmark.sentenceIndex,
    label: bookmark.label || '',
    preview: bookmark.preview || '',
    createdAt: Date.now(),
  })
  const { store } = await withStore(STORE_BOOKMARKS, 'readwrite')
  return promisify(store.put({ id: documentId, bookmarks: existing }))
}

export async function removeBookmark(documentId, sentenceIndex) {
  const existing = await getBookmarks(documentId)
  const filtered = existing.filter(b => b.sentenceIndex !== sentenceIndex)
  const { store } = await withStore(STORE_BOOKMARKS, 'readwrite')
  return promisify(store.put({ id: documentId, bookmarks: filtered }))
}
