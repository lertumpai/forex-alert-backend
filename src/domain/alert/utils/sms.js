import redis from '../../../database/redis/connnection'

const SMS_CREDIT = 'sms_credit'
export function updateCredit(credit) {
  return redis.incrby(SMS_CREDIT, credit)
}

export function getCredit() {
  return redis.get(SMS_CREDIT)
}
