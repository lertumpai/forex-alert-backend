import express from 'express'

const router = express.Router()

import { verifyToken } from '../user/authentication/token'
import { subscribeAll, unsubscribeAll, startSocket, job } from './utils/socket'

let isStart = false

router.get('/check', (req, res) => {
  res.json('Socket is ready')
})

router.post('/subscribe', verifyToken, async (req, res) => {
  const { finnhub } = req

  await subscribeAll(finnhub.socket)

  res.json('subscribe success')
})

router.post('/unsubscribe', verifyToken, async (req, res) => {
  const { finnhub } = req

  await unsubscribeAll(finnhub.socket)

  res.json('unsubscribe success')
})

router.post('/start', verifyToken, async (req, res) => {
  if (!isStart) {
    job()
    isStart = true
  }

  res.json('start jobs')
})

export default router
