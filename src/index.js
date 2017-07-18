import database from './database'
import bot from './bot'
import routes from './routes'

import { Observable } from 'rx'
import {
  apply,
  partial,
} from 'ramda'

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
}

function subscribe (r, bot) {
  return Promise.all([
    ...routes.map(route => bot
      .subscribe(route.match)
      .subscribe(partial(handle, [r, bot, route]))
    )
  ])
}

Promise.all([
  database.connect(),
  bot.start()
])
.then(apply(subscribe))
.catch(e => console.error(e))
