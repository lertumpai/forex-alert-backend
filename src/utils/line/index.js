import thaibulksmsApi from 'thaibulksms-api'

import { setCredit, getCredit } from '../../domain/alert/utils/sms'

function conditionConverter(condition) {
  switch (condition) {
    case 'gte':
      return '>='
    case 'lte':
      return '<='
    default:
      throw new Error('Condition invalid')
  }
}

export async function pushMessage({ user, product, alert }) {
  const { mobileNo } = user
  const { price, condition, note } = alert
  const { name } = product

  // const client = new Client({ channelAccessToken: line_access_token })
  // const text = `${name} ${conditionConverter(condition)} ${price}`
  //
  // const message = {
  //   type: 'text',
  //   text,
  // }
  //
  // await client.pushMessage(line_user_id, message)
  const options = {
    apiKey: process.env.THAI_BULK_KEY,
    apiSecret: process.env.THAI_BULK_SECRET,
  }

  const sms = thaibulksmsApi.sms(options)
  const credit = await getCredit()

  let message = `${name} ${conditionConverter(condition)} ${price}`
  if (credit - 1 < 100) {
    message += ` (credit remaining: ${credit - 1})`
  }
  if (note) {
    message += ` (Note: ${note})`
  }

  const body = {
    msisdn: mobileNo,
    message,
    sender: 'MySMS',
  }
  try {
    const { remaining_credit } = await sms.sendSMS(body)
    await setCredit(remaining_credit)
  } catch (e) {
    console.log(e)
  }
  console.log(`Finish alert to ${mobileNo}`)
}
