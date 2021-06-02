import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import User from './domain/user'
import Product from './domain/product'
import Alert from './domain/alert'
import Jobs from './domain/jobs'

import pkg from '../package'
import { onError } from './error'
import { startSocketProductPrice, subscribeAll, startQueueProcess, createAlertJobs } from './domain/jobs/utils/jobs'
import './database/mongo/connection'

const WebSocket = require('ws')
const socket = new WebSocket('wss://ws.finnhub.io?token=c2nkbtaad3i8g7sr9tcg')

import Arena from 'bull-arena'
import Bee from 'bee-queue'

const app = express()
const port = 5000

const corsOptions = {
  credentials: true,
  origin: function(origin, callback){
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true)
    return callback(null, true)
  },
}
app.use(
  cors(corsOptions),
  bodyParser.json({ limit: '5mb' }),
  bodyParser.urlencoded({ extended: true }),
  cookieParser(),
)

app.get('/check', (req, res) => {
  res.json(`Server is ready ${pkg.version}`)
})

app.use('/users', User)
app.use('/products', Product)
app.use('/alerts', Alert)
app.use('/jobs', Jobs)

socket.on('open', async () => {
  console.log('Open Socket')
  await subscribeAll(socket)
  startSocketProductPrice(socket)
  const jobNames = await createAlertJobs()

  const arena = Arena({
    Bee,
    queues: jobNames.map(jobName => {
      return {
        name: jobName,
        hostId: `Queue for check and alert ${jobName} price`,
        type: 'bee',
        prefix: 'bq',
        redis: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      }
    })
  }, {
    basePath: '/arena',
    disableListen: true,
  })
  app.use('/', arena)
  startQueueProcess()
})

app.use(onError)

app.listen(port, () => {
  console.log('Server is start')
})
