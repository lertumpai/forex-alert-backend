import express from 'express'
const router = express.Router()

import { register, login } from './authentication'
import { UNAUTHORIZED_ERROR, TOKEN_INVALID_ERROR } from '../../error'
import { getToken, verifyToken } from './authentication/token'
import { User } from '../../database/mongo/user'

router.get('/check', (req, res) => {
  res.json('User is ready')
})

// get user
router.get('/', verifyToken, async (req, res) => {
  const { id } = req.user
  const user = await User.findById(id)
  res.json(user)
})

// update user
router.patch('/', verifyToken, async (req, res, next) => {
  const { id } = req.user
  const { line_access_token, line_user_id } = req.body

  try {
    const user = await User.updateProfile(id, { line_access_token, line_user_id })
    res.json(user)
  } catch (e) {
    next(e)
  }
})

// register user
router.post('/', async (req, res, next) => {
  const { username, password, key } = req.body
  try {
    if (key !== process.env.PRIVATE_KEY) {
      throw new UNAUTHORIZED_ERROR()
    }

    const user = await register({ username, password })
    res.json(user)
  } catch (e) {
    next(e)
  }
})

// login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    const user = await login({ username, password })
    const token = await getToken(user)
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== 'development' ? 'none' : false,
      secure: process.env.COOKIE_SECURE === 'true' && process.env.NODE_ENV !== 'development',
    })
    res.json(user)
  } catch (e) {
    next(e)
  }
})

export default router
