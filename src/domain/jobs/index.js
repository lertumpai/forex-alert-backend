import express from 'express'

const router = express.Router()

import redis from '../../database/redis/connnection'
import { verifyToken, verifyKey } from '../user/authentication/token'
import { subscribeAll, unsubscribeAll, addAlertJobs, deleteJobKeys, startSocketProductPrice } from './utils/jobs'

const WebSocket = require('ws')

router.get('/check', (req, res) => {
  res.json('Socket is ready')
})

router.post('/subscribe', verifyToken, async (req, res) => {
  const socket = new WebSocket('wss://ws.finnhub.io?token=c2nkbtaad3i8g7sr9tcg')
  await subscribeAll(socket)
  res.json('Success subscribe')
})

router.post('/unsubscribe', verifyToken, async (req, res) => {
  const socket = new WebSocket('wss://ws.finnhub.io?token=c2nkbtaad3i8g7sr9tcg')
  await unsubscribeAll(socket)
  res.json('Success unsubscribe')
})

router.post('/startSocketProductPrice', verifyKey, async (req, res) => {
  try {
    console.log('Add socket')
    const socket = new WebSocket('wss://ws.finnhub.io?token=c2nkbtaad3i8g7sr9tcg')
    console.log('subscribeAll')
    await subscribeAll(socket)
    console.log('Start socket')
    await startSocketProductPrice(socket)
    res.json('Success start socket')
  } catch (e) {
    console.log(e)
  }
})

router.post('/addAlertJobs', verifyKey, async (req, res) => {
  await addAlertJobs()
  res.json('Success add alert jobs')
})

router.post('/deleteJobKeys', verifyKey, async (req, res) => {
  await deleteJobKeys()
  res.json('Success delete job keys')
})

router.get('/test', async (req, res) => {
  await redis.set('date', new Date().toUTCString())
  res.json('Success delete job keys')
})

export default router
