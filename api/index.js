import app, { ensureDatabase } from '../src/app.js'

export default async function handler(req, res) {
  await ensureDatabase()
  return app(req, res)
}
