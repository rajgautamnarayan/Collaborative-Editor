import { useEffect, useMemo, useState } from 'react'
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusAwareness,
  useHocuspocusConnectionStatus,
  useHocuspocusProvider,
} from '@hocuspocus/provider-react'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Icon } from './icons.jsx'
import { createRoomId, defaultUser, roomFromLocation, userColor } from './editor-utils.js'

const collabUrl = import.meta.env.VITE_COLLAB_URL || 'ws://localhost:1234'

function ToolbarButton({ active = false, disabled = false, label, icon, onClick }) {
  return (
    <button
      className={`tool-button${active ? ' is-active' : ''}`}
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  )
}

function Toolbar({ editor }) {
  if (!editor) return <div className="toolbar" aria-hidden="true" />

  const command = (callback) => () => callback(editor.chain().focus()).run()
  return (
    <div className="toolbar" role="toolbar" aria-label="Document formatting">
      <div className="tool-group">
        <ToolbarButton label="Undo" icon="undo" disabled={!editor.can().undo()} onClick={() => editor.commands.undo()} />
        <ToolbarButton label="Redo" icon="redo" disabled={!editor.can().redo()} onClick={() => editor.commands.redo()} />
      </div>
      <span className="toolbar-divider" />
      <div className="tool-group">
        <ToolbarButton label="Heading 1" icon="h1" active={editor.isActive('heading', { level: 1 })} onClick={command((chain) => chain.toggleHeading({ level: 1 }))} />
        <ToolbarButton label="Heading 2" icon="h2" active={editor.isActive('heading', { level: 2 })} onClick={command((chain) => chain.toggleHeading({ level: 2 }))} />
      </div>
      <span className="toolbar-divider" />
      <div className="tool-group">
        <ToolbarButton label="Bold" icon="bold" active={editor.isActive('bold')} onClick={command((chain) => chain.toggleBold())} />
        <ToolbarButton label="Italic" icon="italic" active={editor.isActive('italic')} onClick={command((chain) => chain.toggleItalic())} />
        <ToolbarButton label="Strikethrough" icon="strike" active={editor.isActive('strike')} onClick={command((chain) => chain.toggleStrike())} />
        <ToolbarButton label="Highlight" icon="highlight" active={editor.isActive('highlight')} onClick={command((chain) => chain.toggleHighlight())} />
      </div>
      <span className="toolbar-divider" />
      <div className="tool-group">
        <ToolbarButton label="Bullet list" icon="bullet" active={editor.isActive('bulletList')} onClick={command((chain) => chain.toggleBulletList())} />
        <ToolbarButton label="Numbered list" icon="ordered" active={editor.isActive('orderedList')} onClick={command((chain) => chain.toggleOrderedList())} />
        <ToolbarButton label="Block quote" icon="quote" active={editor.isActive('blockquote')} onClick={command((chain) => chain.toggleBlockquote())} />
        <ToolbarButton label="Code block" icon="code" active={editor.isActive('codeBlock')} onClick={command((chain) => chain.toggleCodeBlock())} />
      </div>
    </div>
  )
}

function Presence({ currentUser }) {
  const awareness = useHocuspocusAwareness()
  const people = Array.from(
    new Map(
      awareness
        .filter((state) => state.name)
        .map((state) => [state.clientId, state]),
    ).values(),
  )

  return (
    <div className="presence" aria-label={`${people.length || 1} collaborator${people.length === 1 ? '' : 's'} online`}>
      {(people.length ? people : [{ clientId: 'self', name: currentUser, color: userColor(currentUser) }]).slice(0, 4).map((person) => (
        <span
          className="avatar"
          key={person.clientId}
          style={{ '--avatar-color': person.color || userColor(person.name) }}
          title={person.name}
        >
          {person.name.slice(0, 1).toUpperCase()}
        </span>
      ))}
      <span className="presence-label">{people.length || 1} online</span>
    </div>
  )
}

function DocumentTitle({ provider }) {
  const sharedTitle = useMemo(() => provider.document.getText('document-title'), [provider])
  const [title, setTitle] = useState(sharedTitle.toString() || 'Untitled document')

  useEffect(() => {
    if (sharedTitle.length === 0) sharedTitle.insert(0, 'Untitled document')
    const update = () => setTitle(sharedTitle.toString())
    sharedTitle.observe(update)
    update()
    return () => sharedTitle.unobserve(update)
  }, [sharedTitle])

  const updateTitle = (nextTitle) => {
    provider.document.transact(() => {
      sharedTitle.delete(0, sharedTitle.length)
      sharedTitle.insert(0, nextTitle)
    })
  }

  return <input className="document-title" value={title} onChange={(event) => updateTitle(event.target.value)} aria-label="Document title" />
}

function CollaborativeDocument({ user, roomId }) {
  const provider = useHocuspocusProvider()
  const connectionStatus = useHocuspocusConnectionStatus()
  const [copied, setCopied] = useState(false)
  const [, forceToolbarUpdate] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Highlight,
      Placeholder.configure({ placeholder: 'Start writing. Everyone with this link can join you…' }),
      Collaboration.configure({ document: provider.document }),
      CollaborationCaret.configure({ provider, user: { name: user, color: userColor(user) } }),
    ],
    editorProps: {
      attributes: {
        class: 'editor-content',
        spellcheck: 'true',
        'aria-label': 'Collaborative document editor',
      },
    },
    onSelectionUpdate: () => forceToolbarUpdate((value) => value + 1),
    onTransaction: () => forceToolbarUpdate((value) => value + 1),
  }, [provider, user])

  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('doc', roomId)
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const status = String(connectionStatus).toLowerCase()
  const connected = status.includes('connected') && !status.includes('disconnected')

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Draftroom home"><span className="brand-mark">D</span><span>Draftroom</span></a>
        <div className="topbar-document">
          <DocumentTitle provider={provider} />
          <span className={`sync-state${connected ? ' is-online' : ''}`}><span className="status-dot" />{connected ? 'All changes saved' : 'Reconnecting…'}</span>
        </div>
        <div className="topbar-actions">
          <Presence currentUser={user} />
          <button className="share-button" type="button" onClick={share}><Icon name={copied ? 'check' : 'share'} />{copied ? 'Copied' : 'Share'}</button>
        </div>
      </header>

      <Toolbar editor={editor} />

      <main className="workspace">
        <div className="page-wrap">
          <div className="page-ruler" aria-hidden="true"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
          <article className="paper"><EditorContent editor={editor} /></article>
        </div>
      </main>

      <footer className="statusbar">
        <span>Room <strong>{roomId}</strong></span>
        <span>{editor?.storage.characterCount?.words?.() || editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0} words</span>
      </footer>
    </div>
  )
}

function App() {
  const [roomId] = useState(() => roomFromLocation())
  const [user, setUser] = useState(() => defaultUser())
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('doc')) {
      url.searchParams.set('doc', roomId)
      window.history.replaceState({}, '', url)
    }
  }, [roomId])

  const newDocument = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('doc', createRoomId())
    window.location.assign(url)
  }

  const rename = () => {
    const nextName = window.prompt('Your display name', user)?.trim()
    if (!nextName) return
    localStorage.setItem('draftroom-user', nextName.slice(0, 40))
    setUser(nextName.slice(0, 40))
  }

  return (
    <>
      <div className="utility-actions">
        <button type="button" onClick={newDocument}>New document</button>
        <button type="button" onClick={rename}>{user}</button>
      </div>
      <HocuspocusProviderWebsocketComponent url={collabUrl}>
        <HocuspocusRoom name={roomId} key={roomId} onSynced={() => setSynced(true)}>
          {synced ? <CollaborativeDocument user={user} roomId={roomId} /> : <div className="loading-screen">Opening your document…</div>}
        </HocuspocusRoom>
      </HocuspocusProviderWebsocketComponent>
    </>
  )
}

export default App
