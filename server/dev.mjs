import { spawn } from 'node:child_process'

const children = [
  spawn('npm', ['exec', 'vite'], { stdio: 'inherit' }),
  spawn(process.execPath, ['--watch', 'server/index.mjs'], { stdio: 'inherit' }),
]

const shutdown = () => {
  children.forEach((child) => child.kill('SIGTERM'))
}

children.forEach((child) => child.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code
}))

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
