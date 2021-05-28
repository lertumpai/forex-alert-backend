import mongoose from 'mongoose'

import Dao from '../dao'
import { NOT_FOUND_ERROR } from '../../../error'
import { now } from '../../../utils/date'

const ProfileSchema = new mongoose.Schema({
  name: String,
  birthday: Date,
  status: String,
  image: { type: mongoose.Types.ObjectId, ref: 'UploadProfile' },
}, { _id: false })

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  active: { type: Boolean, default: true },
  line_access_token: String,
  line_user_id: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
})

const Alert = mongoose.model('User', UserSchema)

export default class UserClass extends Dao {
  constructor() {
    super(Alert)
  }

  findByUsername(username) {
    return Alert.findOne({ username })
  }

  create({ username, password }) {
    const date = now()
    return Alert.create({ username, password, createdAt: date, updatedAt: date })
  }

  async updateProfile(id, { line_access_token, line_user_id }) {
    const user = await Alert.findById(id)

    if (!user) {
      throw new NOT_FOUND_ERROR('user')
    }

    user.line_user_id = line_user_id || user.line_user_id
    user.line_access_token = line_access_token || user.line_access_token
    user.updated_time = now()

    return user.save()
  }
}
