import {
  apply,
  partial,
} from 'ramda'

import database from './database'
import bot from './bot'
import routes from './routes'

function handleError(b, error) {
  if (error.msg) {
    return b.send(error.msg.chat.id, error.text, { parse_mode: 'HTML' })
  }

  console.error('An error returned something not sendable')
  console.error(error)
  return null
}

function dispatch(b, reply) {
  const { to, text } = reply
  const telegramOptions = {
    parse_mode: 'HTML',
  }

  return b.send(to, text, telegramOptions)
}

function handle(r, b, route, msg) {
  return route.handler(r, msg)
    .then(partial(dispatch, [b]))
    .catch(partial(handleError, [b]))
    .catch(partial(console.error, [`${msg.chat.id} ERR "${msg.text}":`]))
}

function subscribe(r, b) {
  return Promise.all([
    ...routes.map((route) => b
      .subscribe(route.match)
      .subscribe(partial(handle, [r, b, route]),
        (err) => console.error('Unhandled error:', err),
      ),
    ),
  ])
}

Promise.all([
  database.connect(),
  bot.start(),
])
  .then(apply(subscribe))
  .catch((e) => console.error(e))
