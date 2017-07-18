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

function handle (dao, provider, route, msg) {
  return route.handler(dao, msg)
    .then(partial(dispatch, [provider]))
}

function subscribe (dao, bot) {
  return Promise.all([
    ...routes.map(route => bot
      .subscribe(route.match)
      .subscribe(partial(handle, [dao, bot, route]))
    )
  ])
}

Promise.all([
  database.connect(),
  bot.start()
])
.then(apply(subscribe))
.catch(e => console.error(e))
