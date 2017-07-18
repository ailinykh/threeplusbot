import database from './database'
import bot from './bot'
import routes from './routes'

import { Observable } from 'rx'
import {
  apply,
  partial,
} from 'ramda'

function dispatch (provider, reply) {
  const { to, text, options } = reply
  let telegramOptions = {
    parse_mode: 'HTML',
  }

  return provider.send(to, text, telegramOptions)
}

function handle (r, provider, route, msg) {
  return route.handler(r, msg)
    .then(partial(dispatch, [provider]))
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
