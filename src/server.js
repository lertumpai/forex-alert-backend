import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import User from './domain/user'

import { onError } from './error'
import './database/mongo/connection'


const app = express()
const port = 5000

const corsOptions = {
  credentials: true,
}
app.use(
  cors(corsOptions),
  bodyParser.json({ limit: '5mb' }),
  bodyParser.urlencoded({ extended: true }),
  cookieParser(),
)

app.get('/check', (req, res) => {
  res.json('Server is ready')
})

app.use('/users', User)

app.use(onError)

app.listen(port, () => {
  console.log('Server is start')
})
