import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Server } from '@hocuspocus/server'
import * as Y from 'yjs'

const port = Number(process.env.PORT || 1234)
const documentsPath = resolve(process.env.DOCUMENTS_PATH || './data/documents')
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

await mkdir(documentsPath, { recursive: true })

const documentPath = (documentName) => {
  const key = createHash('sha256').update(documentName).digest('hex')
  return resolve(documentsPath, `${key}.yjs`)
}

const server = new Server({
  port,
  debounce: 1500,
  maxDebounce: 10000,
  async onLoadDocument({ documentName }) {
    try {
      return new Uint8Array(await readFile(documentPath(documentName)))
    } catch (error) {
      if (error.code === 'ENOENT') return new Y.Doc()
      throw error
    }
  },
  async onStoreDocument({ document, documentName }) {
    const target = documentPath(documentName)
    const temporary = `${target}.${process.pid}.tmp`
    await writeFile(temporary, Y.encodeStateAsUpdate(document))
    await rename(temporary, target)
  },
  async onConnect({ requestHeaders }) {
    const origin = requestHeaders.get('origin')
    if (origin && !allowedOrigins.includes(origin)) {
      throw new Error('Origin is not allowed')
    }
  },
})

await server.listen()
console.log(`Collaboration server listening on ws://0.0.0.0:${port}`)
console.log(`Persisting documents to ${documentsPath}`)

const shutdown = async () => {
  await server.destroy()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
