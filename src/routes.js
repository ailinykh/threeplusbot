import handlers from './handlers'

export default [
  {
    match: /\/about/,
    handler: handlers.about,
  },
  {
    match: /\/auth/,
    handler: handlers.auth,
  },
  {
    match: /\/game/,
    handler: handlers.game,
  },
  {
    match: /\/help/,
    handler: handlers.help,
  },
  {
    match: /\/start/,
    handler: handlers.start,
  },
]
