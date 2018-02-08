import {
  always,
  apply,
  assoc,
  equals,
  has,
  identity,
  ifElse,
  length,
  lensProp,
  over,
  partial,
  pipe,
  prepend,
  set,
  split,
  takeLast,
} from 'ramda'

import providers from '../providers'

function validateGame (r, msg, link) {
  return Promise.resolve(link)
    .then(providers.resolve)
    .then(p => p.game(link))
}

function replace (r, msg, obj) {
  return r.table('chats')
    .get(msg.chat.id)
    .replace(obj)
    .run()
    .then(always(obj))
}

function archiveGame (r, msg, chat) {
  const game = chat.game
  if (!game.tasks) {
    return chat
  }

  return Promise.resolve(chat)
    .then(ifElse(
      has('games'),
      over(lensProp('games'), prepend(game)),
      assoc('games', [game]),
    ))
    .then(partial(replace, [r, msg]))
}

function createGame (r, msg, game) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(ifElse(
      has('game'),
      partial(archiveGame, [r, msg]),
      identity(),
    ))
    .then(set(lensProp('game'), game))
    .then(partial(replace, [r, msg]))
    .then(always({
      to: msg.chat.id,
      text: '✅ Игра выбрана!',
    }))
}

function respondCurrentGame (r, msg) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(ifElse(
      has('game'),
      chat => Promise.resolve({ to: msg.chat.id, text: `Текущая игра: ${chat.game.url}` }),
      () => Promise.resolve({ to: msg.chat.id, text: '⚠️ Игра не задана. Укажите игру командой:\n/game <i>&lt;ссылка на игру&gt;</i>' }),
    ))
}

function respondNewGame (r, msg, link) {
  return validateGame(r, msg, link)
    .then(partial(createGame, [r, msg]))
}

export default function call (r, msg) {
  return Promise.resolve(msg.text)
    .then(split(' '))
    .then(ifElse(
      pipe(length, equals(2)),
      pipe(takeLast(1), apply(partial(respondNewGame, [r, msg]))),
      partial(respondCurrentGame, [r, msg]),
    ))
}
