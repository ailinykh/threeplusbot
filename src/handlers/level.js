import {
  always,
  apply,
  call as calll,
  compose,
  endsWith,
  flatten,
  gt,
  head,
  ifElse,
  invoker,
  match,
  partial,
  pipe,
  prop,
  slice,
  take,
  tap,
} from 'ramda'

import { reject } from './errors'
import providers from '../providers'

function getCredentials (r, msg) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(prop('credentials'))
    .then(head)
    .catch(partial(reject, [msg, '❌ Логин и пароль от движка не заданы!\n/auth <i>&lt;login&gt; &lt;password&gt;</i>']))
}

function getGame (r, msg) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(prop('game'))
    .catch(partial(reject, [msg, '❌ Игра не выбрана!\n/game <i>&lt;ссылка на игру&gt;</i>']))
}

function getLevel (r, msg, game, credentials) {
  return providers.resolve(game.url)
    .then(p => p.level(r, msg, game, credentials[0], credentials[1]))
    .then(text => ({
      to: msg.chat.id,
      text: JSON.stringify(text, null, 2),
    }))
}

export default function call (r, msg) {
  return Promise.all([
    getGame(r, msg),
    getCredentials(r, msg),
  ])
    .then(apply(partial(getLevel, [r, msg])))
}
