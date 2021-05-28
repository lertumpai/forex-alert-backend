import { Product } from '../../../database/mongo/product'
import { Alert } from '../../../database/mongo/alert'
import { User } from '../../../database/mongo/user'

import { pushMessage } from '../../../utils/line'

export async function subscribeAll(socket) {
  const products = await Product.findAll()
  return products.forEach(product => {
    const { symbol } = product
    socket.send(JSON.stringify({ type: 'subscribe', symbol }))
  })
}

export async function unsubscribeAll(socket) {
  const products = await Product.findAll()
  return products.forEach(product => {
    const { symbol } = product
    socket.send(JSON.stringify({ type: 'unsubscribe', symbol }))
  })
}

function comparePrice(nowPrice, condition, alertPrice) {
  switch (condition) {
    case 'gte':
      return Number(nowPrice) >= Number(alertPrice)
    case 'lte':
      return Number(nowPrice) <= Number(alertPrice)
  }
}

async function checkAndPushMessage(data) {
  const { s, p } = data
  const product = await Product.findByResultSymbol(s)
  const alerts = await Alert.findAlert({ productId: product.id })
  await Promise.all(alerts.map(async alert => {
    const { price, condition, createdBy } = alert
    if (comparePrice(p, condition, price)) {
      const user = await User.findById(createdBy)
      await pushMessage({ user, product, alert })
      await Alert.success(alert.id)
    }
  }))
}

export function startSocket(socket) {
  socket.on('message', async payload => {
    const data = JSON.parse(payload).data
    if (data) {
      await Promise.all(data.map(checkAndPushMessage))
    }
  })
}
