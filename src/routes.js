import handlers from './handlers'

export default [
  {
    match: /\/about/,
    handler: handlers.about
  },
  {
    match: /\/help/,
    handler: handlers.help
  },
  {
    match: /\/start/,
    handler: handlers.start
  }
]
