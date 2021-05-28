import mongoose from 'mongoose'

import Dao from '../dao'
import { now } from '../../../utils/date'

const ProductSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  symbol: { type: String, unique: true },
  createdAt: Date,
  updatedAt: Date,
})

const Product = mongoose.model('Product', ProductSchema)

export default class ProductClass extends Dao {
  constructor() {
    super(Product)
  }

  findAll() {
    return Product.find()
  }

  create({ name, symbol }) {
    const date = now()
    return Product.create({ name, symbol, createdAt: date, updatedAt: date })
  }

  async delete(id) {
    return Product.deleteOne({ _id: id })
  }
}
