
import handlers from './index'

export default function call (dao, msg) {
  const params = {
    to: msg.chat.id,
    text: [
      'Welcome to @threeplusbot!',
    ].join('\n'),
  }

  return Promise.resolve(params)
}
