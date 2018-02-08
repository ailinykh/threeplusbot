export default function call(r, msg) {
  const params = {
    to: msg.chat.id,
    text: [
      'Print list of help commands!',
    ].join('\n'),
  }

  return Promise.resolve(params)
}
