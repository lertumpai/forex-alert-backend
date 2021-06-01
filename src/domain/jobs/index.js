import express from 'express'

const router = express.Router()

import redis from '../../database/redis/connnection'
import { verifyToken, verifyKey } from '../user/authentication/token'
import { subscribeAll, unsubscribeAll, addAlertJobs, deleteJobKeys } from './utils/jobs'

router.get('/check', (req, res) => {
  res.json('Socket is ready')
})

router.post('/subscribe', verifyToken, async (req, res) => {
  const { finnhub } = req
  await subscribeAll(finnhub.socket)
  res.json('Success subscribe')
})

router.post('/unsubscribe', verifyToken, async (req, res) => {
  const { finnhub } = req
  await unsubscribeAll(finnhub.socket)
  res.json('Success unsubscribe')
})

router.post('/addAlertJobs', verifyKey, async (req, res) => {
  await addAlertJobs()
  res.json('Success add alert jobs')
})

router.post('/deleteJobKeys', verifyKey, async (req, res) => {
  await deleteJobKeys()
  res.json('Success delete job keys')
})

router.get('/deleteJobKeys', async (req, res) => {
  await deleteJobKeys()
  res.json('Success delete job keys')
})

export default router
