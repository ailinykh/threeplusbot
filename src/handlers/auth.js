import {
  apply,
  assoc,
  equals,
  has,
  ifElse,
  isNil,
  length,
  lensProp,
  over,
  partial,
  pipe,
  prepend,
  prop,
  split,
  takeLast,
  uniq,
} from 'ramda'

import { reject } from './errors'

function updateCredentials (r, msg, credentials) {
    return r.table('chats')
            .get(msg.chat.id)
            .update({ 'credentials': credentials })
            .run()
}

function setAuth (r, msg, login, password) {
  return r.table('chats')
          .get(msg.chat.id)
          .run()
          .then(ifElse(
            has('credentials'),
            over(lensProp('credentials'), prepend([login, password])),
            assoc('credentials', [[login, password]]),
          ))
          .then(prop('credentials'))
          .then(uniq)
          .then(partial(updateCredentials, [r, msg]))
          .then(() => ({
            to: msg.chat.id,
            text: '✅ Данные записаны!'
          }))
}

export default function call (r, msg) {
  return Promise.resolve(msg.text)
    .then(split(' '))
    .then(ifElse(
      pipe(length, equals(3)),
      pipe(takeLast(2), apply(partial(setAuth, [r, msg]))),
      partial(reject, [msg, '❌ Ошибка! Недостаточно аргументов.\n\n/auth <i>&lt;login&gt; &lt;password&gt;</i>'])
    ))
}
