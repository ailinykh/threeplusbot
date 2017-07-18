import rethinkdbdash from 'rethinkdbdash'
import {
  contains,
  ifElse,
  partial,
} from 'ramda'

const r = rethinkdbdash({
  db: 'threeplusbot'
})

const createDatabase = () =>
  r.dbCreate('threeplusbot')
    .run()

const createTables = () =>
  r.db('threeplusbot')
    .tableCreate('chats')
    .run()

const dropDatabase = () =>
  r.dbList()
    .run()
    .then((list) => {
      if (contains('threeplusbot', list)) {
        return r.dbDrop('threeplusbot').run()
      }
    })

function create () {
  return Promise.resolve()
    .then(createDatabase)
    .then(createTables)
    .then(build)
}

function setup () {
  return r.dbList()
    .run()
    .then(ifElse(
      contains('threeplusbot'),
      partial(build, []),
      partial(create, [])
    ))
}

function build () {
  return r
}

function connect () {
  return setup()
}

export default {
  connect,
}
