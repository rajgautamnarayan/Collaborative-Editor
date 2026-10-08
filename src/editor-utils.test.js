import { describe, expect, it, vi } from 'vitest'
import { createRoomId, roomFromLocation, userColor } from './editor-utils.js'

describe('document identity helpers', () => {
  it('accepts safe document ids and rejects unsafe ones', () => {
    expect(roomFromLocation('?doc=team-notes')).toBe('team-notes')
    expect(roomFromLocation('?doc=../../private')).toBe('welcome-room')
  })

  it('creates shareable document ids', () => {
    vi.stubGlobal('crypto', { randomUUID: () => '12345678-abcd-1234-abcd-123456789012' })
    expect(createRoomId()).toBe('doc-12345678')
    vi.unstubAllGlobals()
  })

  it('assigns the same presence color to the same name', () => {
    expect(userColor('Abhay')).toBe(userColor('Abhay'))
  })
})
