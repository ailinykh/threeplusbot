export default function call (r, msg) {
  console.log('HANDLERS ABOUT CALLED!', msg);
  const params = {
    to: msg.chat.id,
    text: [
      '🌐 ThreePlusBot version %s',
      '',
      'Telegram: @threeplusbot',
    ].join('\n'),
  }

  return Promise.resolve(params)
}