import {
  apply,
  assoc,
  equals,
  has,
  ifElse,
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

function updateGames (r, msg, games) {
  return r.table('chats')
    .get(msg.chat.id)
    .update({ games })
    .run()
}


function respondCurrentGame (r, msg) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(ifElse(
      has('games'),
      group => Promise.resolve({ to: msg.chat.id, text: `Текущая игра: ${group.games[0]}` }),
      () => Promise.resolve({ to: msg.chat.id, text: '⚠️ Игра не задана. Укажите игру командой:\n\n/game <i>&lt;ссылка на игру&gt;</i>' }),
    ))
}

function respondNewGame (r, msg, link) {
  return r.table('chats')
    .get(msg.chat.id)
    .run()
    .then(ifElse(
      has('games'),
      over(lensProp('games'), prepend(link)),
      assoc('games', [link]),
    ))
    .then(prop('games'))
    .then(uniq)
    .then(partial(updateGames, [r, msg]))
    .then(() => ({
      to: msg.chat.id,
      text: '✅ Игра выбрана!',
    }))
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
