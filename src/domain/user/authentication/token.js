import jwt from 'jsonwebtoken'

import { TOKEN_INVALID_ERROR, UNAUTHORIZED_ERROR } from '../../../error'

const key = process.env.PRIVATE_KEY

export async function getToken(user) {
  const { id, username } = user

  const payload = {
    id,
    username,
  }
  return user ? jwt.sign(payload, key, { expiresIn: '1h' }) : null
}

export async function verifyToken(req, res, next) {
  const { token } = req.cookies
  try {
    if (!token) {
      throw new Error()
    }

    const user = await jwt.verify(token, key)
    req.user = user
    next()
  } catch (e) {
    next(new TOKEN_INVALID_ERROR())
  }
}

export async function verifyKey(req, res, next) {
  const { key } = req.body
  try {
    if (!key) {
      throw new Error()
    }

    if (key !== process.env.PRIVATE_KEY) {
      throw new Error()
    }

    next()
  } catch (e) {
    next(new UNAUTHORIZED_ERROR())
  }
}
