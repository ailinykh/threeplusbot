import TelegramBot from 'node-telegram-bot-api'
import { Observable } from 'rx'

import {
  always,
  partial,
} from 'ramda'

function buildFilter (stream, regex) {
  const match = new RegExp(regex)
  return stream.filter(msg => match.test(msg.text))
}

function sendMessage (bot, chat, message, options) {
  bot.sendMessage(chat, message, options)
}

function start () {
  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })
  const stream = Observable.fromEvent(bot, 'message')

  if (process.env.NODE_ENV !== 'production') {
    stream.subscribe(console.log)
  }

  console.log(`Worker ${process.pid} started`)

  return bot.getMe()
    .then(always({
      send: partial(sendMessage, [bot]), // => Stream
      subscribe: partial(buildFilter, [stream]), // => Stream
    }))
}

export default {
  start,
}
