const palette = ['#2f6fed', '#d14f66', '#8a5bd1', '#17856b', '#c46b16', '#336b87']

export function roomFromLocation(search = window.location.search) {
  const room = new URLSearchParams(search).get('doc')
  return room && /^[a-z0-9-]{3,64}$/i.test(room) ? room : 'welcome-room'
}

export function createRoomId() {
  return `doc-${crypto.randomUUID().slice(0, 8)}`
}

export function userColor(name) {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

export function defaultUser() {
  const stored = localStorage.getItem('draftroom-user')
  if (stored) return stored
  const name = `Guest ${Math.floor(100 + Math.random() * 900)}`
  localStorage.setItem('draftroom-user', name)
  return name
}
