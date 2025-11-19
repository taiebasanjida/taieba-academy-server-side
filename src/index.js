import app, { ensureDatabase } from './app.js'

const PORT = process.env.PORT || 3000

ensureDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message)
  process.exit(1)
})
