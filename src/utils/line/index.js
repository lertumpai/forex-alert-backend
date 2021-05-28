import { Client } from '@line/bot-sdk'

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
  const { line_access_token, line_user_id } = user
  const { price, condition } = alert
  const { name } = product

  const client = new Client({ channelAccessToken: line_access_token })
  const text = `${name} ${conditionConverter(condition)} ${price}`

  const message = {
    type: 'text',
    text,
  }

  await client.pushMessage(line_user_id, message)
  console.log(`Finish alert to ${line_user_id}`)
}
