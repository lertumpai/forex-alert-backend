import cron from 'node-cron'
import Queue from 'bee-queue'

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

async function checkAndPushMessage(productResultSymbol) {
  const nowPrice = await redis.hget('products', productResultSymbol)
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

  const jobsCount = await redis.llen('bq:alertJob:waiting')
  if (Number(jobsCount) <= 0) {
    task.start()
  }
}

const alertJob = new Queue('alertJob', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
})

export async function addAlertJob(data) {
  const jobsCount = await redis.llen('bq:alertJob:waiting')
  if (Number(jobsCount) >= Number(process.env.LIMIT_ALERT_QUEUE)) {
    task.stop()
  }

  return alertJob.createJob({ productResultSymbol: data[0] }).save()
}

export function startQueueProcess() {
  console.log('Start Alert Queue')
  alertJob.process(async (job, done) => {
    const { productResultSymbol } = job.data
    await checkAndPushMessage(productResultSymbol)
    return done()
  })
}

export const task = cron.schedule(`*/${Number(process.env.JOB_TIME)/1000} * * * * *`, async () =>  {
  const products = await redis.hgetall('products')
  await Promise.all(Object.entries(products).map(addAlertJob))
}, {
  scheduled: false
})

export const delKeyTask = cron.schedule(`*/10 * * * *`, async () =>  {
  const keys = await redis.keys('bq:alertJob*')
  await redis.del(keys)
}, {
  scheduled: false
})

export function startSocketProductPrice(socket) {
  socket.on('message', async payload => {
    const data = JSON.parse(payload).data
    if (data) {
      await Promise.all(data.map(({ s, p }) => redis.hset('products', s, p)))
    }
  })
}
