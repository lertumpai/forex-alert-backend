import mongoose from 'mongoose'

import Dao from '../dao'
import { now } from '../../../utils/date'

const ProductSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  symbol: { type: String, unique: true },
  resultSymbol: { type: String, unique: true },
  createdAt: Date,
})

const Product = mongoose.model('Product', ProductSchema)

export default class ProductClass extends Dao {
  constructor() {
    super(Product)
  }

  findByResultSymbol(resultSymbol) {
    return Product.findOne({ resultSymbol })
  }

  create({ name, symbol, resultSymbol }) {
    const date = now()
    return Product.create({ name, symbol, resultSymbol, createdAt: date })
  }

  async delete(id) {
    return Product.deleteOne({ _id: id })
  }
}
