import 'dotenv/config'
import { createHandler } from './_lib/http.js'

export default createHandler(async (_req, res) => {
  res.status(200).json({
    ok: true,
    name: 'Taieba Academy API',
    message: 'API is running',
  })
})
