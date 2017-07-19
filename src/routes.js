import handlers from './handlers'

export default [
  {
    match: /\/about/,
    handler: handlers.about
  },
  {
    match: /\/auth/,
    handler: handlers.auth
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
