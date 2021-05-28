import express from 'express'

const router = express.Router()

import { verifyToken } from '../user/authentication/token'
import { Alert } from '../../database/mongo/alert'
import { startOfMonth, endOfMonth } from '../../utils/date'

router.get('/check', (req, res) => {
  res.json('Alert is ready')
})

router.get('/conditions', (req, res) => {
  const conditions = [{
    id: 1,
    symbol: '>=',
    value: 'gte',
  },{
    id: 2,
    symbol: '<=',
    value: 'lte',
  }]

  res.json(conditions)
})

router.get('/', verifyToken, async (req, res) => {
  const { user } = req
  const alerts = await Alert.findAlert({ createdBy: user.id })
  res.json(alerts)
})

router.get('/count_alert', verifyToken, async (req, res) => {
  const { user } = req
  const from = startOfMonth()
  const to = endOfMonth()

  const countAll = await Alert.count({
    createdBy: user.id,
    isExcludeAlert: false,
    from,
    to,
  })
  const countNotAlert = await Alert.count({
    createdBy: user.id,
    from,
    to,
  })
  const countAlert = countAll - countNotAlert
  res.json({ countAll, countAlert, countNotAlert })
})

router.post('/', verifyToken, async (req, res, next) => {
  const { price, condition, productId } = req.body
  const { user } = req
  try {
    const alert = await Alert.create({ price, condition, productId, createdBy: user.id })
    res.json(alert)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params
    await Alert.delete(id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

export default router
