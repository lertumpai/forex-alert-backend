import Redis from 'redis'

const redis = new Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

export default redis
