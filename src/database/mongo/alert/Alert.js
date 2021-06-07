import mongoose from 'mongoose'

import Dao from '../dao'
import { NOT_FOUND_ERROR } from '../../../error'
import { now } from '../../../utils/date'

const AlertSchema = new mongoose.Schema({
  price: String,
  condition: {
    type: String,
    enum: ['gte', 'lte']
  },
  productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
  note: String,
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  createdAt: Date,
  alertedAt: Date,
})

AlertSchema.index({ productId: 1, alertedAt: 1, createdAt: 1 })
AlertSchema.index({ createdBy: 1, alertedAt: 1, createdAt: 1 })
AlertSchema.index({ createdBy: 1, createdAt: 1, alertedAt: 1 })

const Alert = mongoose.model('Alert', AlertSchema)

export default class AlertClass extends Dao {
  constructor() {
    super(Alert)
  }

  count({ createdBy, isExcludeAlert = true, from, to }) {
    let prepareFilter = {}

    if (createdBy) {
      prepareFilter = { ...prepareFilter, createdBy }
    }

    if (isExcludeAlert) {
      prepareFilter = { ...prepareFilter, alertedAt: { $eq: null } }
    }

    if (!!from && !!to) {
      prepareFilter = { ...prepareFilter, createdAt: { $gte: from, $lte: to } }
    }

    return Alert.countDocuments(prepareFilter)
  }

  findAlert({ createdBy, productId, isExcludeAlert = true }) {
    let prepareFilter = {}

    if (createdBy) {
      prepareFilter = { ...prepareFilter, createdBy }
    }

    if (productId) {
      prepareFilter = { ...prepareFilter, productId }
    }

    if (isExcludeAlert) {
      prepareFilter = { ...prepareFilter, alertedAt: { $eq: null } }
    }

    return Alert.find(prepareFilter, null, { createdAt: 1 })
  }

  create({ price, condition, createdBy, productId, note }) {
    const date = now()
    return Alert.create({ price, condition, createdBy, productId, note, createdAt: date })
  }

  async success(id) {
    const alert = await Alert.findById(id)

    if (!alert) {
      throw new NOT_FOUND_ERROR(`alert ${id}`)
    }

    alert.alertedAt = now()

    return alert.save()
  }

  delete(id) {
    return Alert.deleteOne({ _id: id })
  }
}
