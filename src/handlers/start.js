import {
  ifElse,
  isNil,
  partial,
} from 'ramda'

function welcome(r, msg) {
  const params = {
    to: msg.chat.id,
    text: [
      '⭐️ Привет! Я помогу вам получать задания и вбивать коды в играх на движках дозора и энкаунтера.',
      '☝🏻 Для начала мне нужен доступ к заданиям на сайте. Подойдет любая учётная запись от движка, задать её можно командой:',
      '',
      '/auth <i>login password</i>',
      '',
      '🔑 После этого я смогу зайти в движок и получить задание.',
      '❓ Полный список команд можно увидеть, нажав на /help',
    ].join('\n'),
  }

  return Promise.resolve(params)
}

function createChat(r, msg) {
  return r.table('chats')
    .insert(msg.chat)
    .run()
    .then(partial(welcome, [r, msg]))
}

export default function call(r, msg) {
  return r.table('chats').get(msg.chat.id).run()
    .then(ifElse(
      isNil,
      partial(createChat, [r, msg]),
      partial(welcome, [r, msg]),
    ))
}
