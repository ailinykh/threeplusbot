import handlers from './handlers'

export default [
  {
    match: /\/about/,
    handler: handlers.about
  },
  {
    match: /\/start/,
    handler: handlers.start
  }
]
