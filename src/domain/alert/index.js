import express from 'express'

const router = express.Router()

import { verifyToken } from '../user/authentication/token'
import { startOfMonth, endOfMonth } from '../../utils/date'
import * as sms from './utils/sms'

import { Product } from '../../database/mongo/product'
import { Alert } from '../../database/mongo/alert'

router.get('/check', (req, res) => {
  res.json('Alert is ready')
})

const conditions = [{
  id: 1,
  symbol: '>=',
  value: 'gte',
},{
  id: 2,
  symbol: '<=',
  value: 'lte',
}]
router.get('/conditions', (req, res) => {
  res.json(conditions)
})

router.get('/', verifyToken, async (req, res) => {
  const { user } = req
  const alerts = await Alert.findAlert({ createdBy: user.id })
  const alertWithProducts = await Promise.all(alerts.map(async alert => {
    const product = await Product.findById(alert.productId)
    return {
      id: alert.id,
      price: alert.price,
      condition: conditions.filter(condition => condition.value === alert.condition)[0]['symbol'],
      productName: product.name,
    }
  }))
  res.json(alertWithProducts)
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

router.patch('/sms_credit', verifyToken, async (req, res, next) => {
  try {
    const { credit } = req.body
    await sms.updateCredit(credit)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

router.get('/sms_credit', verifyToken, async (req, res, next) => {
  try {
    const credit = await sms.getCredit()
    res.json({ credit })
  } catch (e) {
    next(e)
  }
})

export default router
