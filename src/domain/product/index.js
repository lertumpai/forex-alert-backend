import express from 'express'
import request from 'request'

const router = express.Router()

import { verifyToken } from '../user/authentication/token'
import { Product } from '../../database/mongo/product'

router.get('/check', (req, res) => {
  res.json('Product is ready')
})

router.get('/', verifyToken, async (req, res) => {
  const products = await Product.findAll()
  res.json(products)
})

router.post('/', verifyToken, async (req, res, next) => {
  const { name, symbol } = req.body
  try {
    const product = await Product.create({ name, symbol })
    res.json(product)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params
    await Product.delete(id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

router.get('/search', verifyToken, async (req, res, next) => {
  const { query } = req.query
  request(`https://finnhub.io/api/v1/search?q=${query}&token=c2nkbtaad3i8g7sr9tcg`, { json: true },  (err, r, body) => {
    if (err) {
      next(err)
    }
    res.json(body)
  })
})

export default router
