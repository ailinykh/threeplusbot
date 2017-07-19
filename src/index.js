import database from './database'
import bot from './bot'
import routes from './routes'

import { Observable } from 'rx'
import {
  apply,
  partial,
} from 'ramda'

function handleError (bot, error) {
  if (error.msg) {
    return bot.send(error.msg.chat.id, error.text, { parse_mode: 'HTML' })
  }

  console.error('An error returned something not sendable')
  console.error(error)
}

function dispatch (bot, reply) {
  const { to, text, options } = reply
  let telegramOptions = {
    parse_mode: 'HTML',
  }

  return bot.send(to, text, telegramOptions)
}

function handle (r, bot, route, msg) {
  return route.handler(r, msg)
    .then(partial(dispatch, [bot]))
    .catch(partial(handleError, [bot]))
    .catch(partial(console.error, [`${msg.chat} ERR "${msg.text}":`]))
}

function subscribe (r, bot) {
  return Promise.all([
    ...routes.map(route => bot
      .subscribe(route.match)
      .subscribe(partial(handle, [r, bot, route]),
        (err) => console.error('Unhandled error:', err),
      )
    )
  ])
}

Promise.all([
  database.connect(),
  bot.start()
])
.then(apply(subscribe))
.catch(e => console.error(e))
