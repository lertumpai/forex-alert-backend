import Queue from 'bee-queue'
require('events').EventEmitter.defaultMaxListeners = 0

import redis from '../../../database/redis/connnection'

import { Product } from '../../../database/mongo/product'
import { Alert } from '../../../database/mongo/alert'
import { User } from '../../../database/mongo/user'

import { pushMessage } from '../../../utils/line'

function log({ nowPrice, productResultSymbol }) {
  console.log(`${new Date().toISOString()}: ${productResultSymbol} = ${nowPrice}`)
}

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

async function checkAndPushMessage({ productResultSymbol, nowPrice }) {
  log({ nowPrice, productResultSymbol })
  const product = await Product.findByResultSymbol(productResultSymbol)
  const alerts = await Alert.findAlert({ productId: product.id })
  await Promise.all(alerts.map(async alert => {
    const { price, condition, createdBy } = alert
    if (comparePrice(nowPrice, condition, price)) {
      const user = await User.findById(createdBy)
      await pushMessage({ user, product, alert })
      await Alert.success(alert.id)
    }
  }))
}

const alertJobs = {}

export async function createAlertJobs() {
  const products = await Product.findAll()
  return products.map(product => {
    const { resultSymbol } = product
    const jobName = `alertJob:${resultSymbol}`
    alertJobs[resultSymbol] = new Queue(jobName, {
      redis,
    })
    return jobName
  })
}

export function startQueueProcess() {
  console.log('Start AlertJobs Queue')
  Object
    .values(alertJobs)
    .forEach(alertJob => {
      alertJob.process(async (job, done) => {
        await checkAndPushMessage(job.data)
        return done()
      })
    })
}

export async function addAlertJob(data) {
  const [productResultSymbol, nowPrice] = data
  return alertJobs[productResultSymbol].createJob({ productResultSymbol, nowPrice }).save()
}

export async function addAlertJobs() {
  const products = await redis.hgetall('products')
  return Promise.all(Object.entries(products).map(addAlertJob))
}

export async function deleteJobKeys() {
  const keys = await redis.keys('bq:alertJob*')
  return redis.del(keys)
}

export function startSocketProductPrice(socket) {
  socket.on('message', async payload => {
    const data = payload ? JSON.parse(payload).data : null
    if (data) {
      await Promise.all(data.map(({ s, p }) => redis.hset('products', s, p)))
    }
  })
}
