import thaibulksmsApi from 'thaibulksms-api'

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
  const { price, condition } = alert
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

  const message = `${name} ${conditionConverter(condition)} ${price}`
  const body = {
    msisdn: mobileNo,
    message,
    sender: 'MySMS',
  }
  try {
    await sms.sendSMS(body)
  } catch (e) {
    console.log(e)
  }
  console.log(`Finish alert to ${mobileNo}`)
}
