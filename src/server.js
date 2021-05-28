import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import User from './domain/user'
import Product from './domain/product'
import Alert from './domain/alert'
import Socket from './domain/socket'

import { onError } from './error'
import './database/mongo/connection'

const WebSocket = require('ws')
const socket = new WebSocket('wss://ws.finnhub.io?token=c2nkbtaad3i8g7sr9tcg')

socket.on('open', () => {
  console.log('Open Socket')
})

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

app.use((req, res, next) => {
  req.finnhub = { socket }
  next()
})

app.get('/check', (req, res) => {
  res.json('Server is ready')
})

app.use('/users', User)
app.use('/products', Product)
app.use('/alerts', Alert)
app.use('/socket', Socket)

app.use(onError)

app.listen(port, () => {
  console.log('Server is start')
})
