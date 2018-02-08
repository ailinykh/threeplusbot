import url from 'url'
import rp from 'request-promise'
import cheerio from 'cheerio'

import {
  apply,
  assoc,
  call,
  compose,
  contains,
  evolve,
  filter,
  fromPairs,
  has,
  head,
  ifElse,
  invoker,
  isNil,
  map,
  merge,
  objOf,
  partial,
  path,
  pick,
  pipe,
  prop,
  remove,
  replace,
  split,
  values,
  zip,
} from 'ramda'

import { reject } from '../handlers/errors'

const playGameUrl = (host, gid) => `http://m.${host}/gameengines/encounter/play/${gid}`
const loginUrl = host => `http://m.${host}/login/signin/`
const transformBody = body => cheerio.load(body)

function update (r, msg, obj) {
  return r.table('chats')
    .get(msg.chat.id)
    .update(obj)
    .run()
}

function getPlayGameUrl (link) {
  return Promise.resolve(link)
    .then(pipe(url.parse))
    .then(pick(['host', 'query']))
    .then(evolve({
      host: replace(/^m\./, ''),
      query: compose(prop('gid'), fromPairs, Array, split('=')),
    }))
    .then(values)
    .then(apply(playGameUrl))
}

function getLoginUrl (link) {
  return Promise.resolve(link)
    .then(pipe(url.parse))
    .then(pick(['host']))
    .then(evolve({
      host: replace(/^m\./, ''),
    }))
    .then(values)
    .then(apply(loginUrl))
}

function checkNotAuthorized ($) {
  return $('#Login').length
}

function parseCookies (cookies) {
  return Promise.resolve(cookies)
    .then(filter(contains('token')))
    .then(map(compose(split('='), head, split(';'))))
    .then(fromPairs)
}

function authorize (r, msg, game, Login, Password) {
  // TODO: captcha!
  const params = {
    method: 'POST',
    uri: game.loginUrl,
    resolveWithFullResponse: true,
    formData: { Login, Password },
    simple: false,
  }
  return rp.post(params)
    .then(ifElse(
      compose(contains('Incorrect login or password'), invoker(0, 'text'), cheerio.load, prop('body')),
      partial(reject, [msg, '❌ Ошибка! Неверный логин или пароль.\n/auth <i>&lt;login&gt; &lt;password&gt;</i>']),
      compose(parseCookies, path(['headers', 'set-cookie'])),
    ))
    .then(merge(game))
    .then(objOf('game'))
    .then(partial(update, [r, msg]))
    .then(partial(console.log, ['💥 Authorized successfully!']))
}

function parseLevel (r, msg, game, $) {
  // Not in game yet
  if ($('a.button').text() === 'Start the game') {
    return reject(msg, '❌ Вы не в игре! Зайдите в движок и нажмите кнопку "Начать игру"')
  }
  return console.log('PARSE LEVEL MOTHERFUCKER!', $.html())
}

function level (r, msg, game, login, password) {
  const params = {
    uri: game.playUrl,
    transform: transformBody,
    headers: { Cookie: `stoken=${game.stoken}; atoken=${game.atoken};` },
  }
  return rp.get(params)
    .then(ifElse(
      checkNotAuthorized,
      partial(authorize, [r, msg, game, login, password]),
      partial(parseLevel, [r, msg, game]),
    ))
}

function getGame (link) {
  return Promise.all([
    getPlayGameUrl(link),
    getLoginUrl(link),
  ])
    .then(zip(['playUrl', 'loginUrl']))
    .then(fromPairs)
    .then(assoc('url', link))
    .then(assoc('provider', 'encounter'))
}

export default {
  game: getGame,
  level,
}
