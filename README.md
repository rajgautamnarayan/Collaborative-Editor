# Draftroom

A real-time collaborative rich-text editor built on React, Tiptap/ProseMirror, Yjs, and Hocuspocus. It includes shared documents, live collaborator cursors, presence, collaborative titles, rich formatting, shareable room links, conflict-free offline edits, and durable Yjs document persistence.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Open the same `?doc=...` URL in a second browser window to verify real-time collaboration.

## Hosting

The frontend and collaboration server deploy separately because the editor uses a long-lived WebSocket connection.

### Frontend: Vercel

1. Import this repository into Vercel.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add `VITE_COLLAB_URL=wss://YOUR-COLLAB-SERVICE.up.railway.app`.
4. Deploy.

### Collaboration server: Railway

1. Create a Railway service from this repository.
2. Set the start command to `npm start`.
3. Add a persistent volume mounted at `/data`.
4. Set `DOCUMENTS_PATH=/data/documents` and `ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN`.
5. Generate a public Railway domain. Use its `wss://` form in Vercel's `VITE_COLLAB_URL`.

File persistence with one server instance is appropriate for a portfolio or small-team deployment. For horizontal scaling, replace it with shared database persistence and Hocuspocus Redis coordination. Add authentication before using private documents; the current share-link model gives document access to anyone who has the URL.
