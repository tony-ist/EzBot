import fs from 'fs'

export function getVersion(): string {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  const gitCommitSha = process.env.COMMIT_SHA !== undefined ? process.env.COMMIT_SHA : ''
  return `${packageJson.version}.${gitCommitSha.slice(0, 5)}`
}
