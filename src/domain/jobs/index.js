import express from 'express'

const router = express.Router()

import { verifyToken } from '../user/authentication/token'
import { subscribeAll, unsubscribeAll, task } from './utils/jobs'

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
  task.start()
  res.json('start jobs')
})

router.post('/stop', verifyToken, async (req, res) => {
  task.stop()
  res.json('stop jobs')
})

export default router
