import mongoose from 'mongoose'

import Dao from '../dao'
import { now } from '../../../utils/date'

const ProductSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  symbol: { type: String, unique: true },
  createdAt: Date,
})

const Product = mongoose.model('Product', ProductSchema)

export default class ProductClass extends Dao {
  constructor() {
    super(Product)
  }

  create({ name, symbol }) {
    const date = now()
    return Product.create({ name, symbol, createdAt: date })
  }

  async delete(id) {
    return Product.deleteOne({ _id: id })
  }
}
