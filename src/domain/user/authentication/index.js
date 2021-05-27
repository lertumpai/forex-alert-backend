import bcrypt from 'bcrypt'

import { User } from '../../../database/mongo/user'
import { DUPLICATED_VALUE_ERROR, LOGIN_FAIL_ERROR, REGISTER_FAIL_ERROR, NOT_FOUND_ERROR } from '../../../error'

export async function register({ username, password }) {
  const checks = []
  if (!username) checks.push('username')
  if (!password) checks.push('password')
  if (checks.length !== 0) throw new REGISTER_FAIL_ERROR(checks)

  const user = await User.findByUsername(username)

  if (user) {
    throw new DUPLICATED_VALUE_ERROR('username')
  }

  const hash = bcrypt.hashSync(password, 10)
  return User.create({ username, password: hash, active: true })
}

export async function login({ username, password }) {
  const checks = []
  if (!username) checks.push('username')
  if (!password) checks.push('password')
  if (checks.length !== 0) throw new LOGIN_FAIL_ERROR(checks)

  const user = await User.findByUsername(username)

  if (!user) throw new NOT_FOUND_ERROR('username')
  if (!password || !bcrypt.compareSync(password, user.password)) throw new LOGIN_FAIL_ERROR(['password'])

  return user
}
