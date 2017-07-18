import rethinkdb from 'rethinkdb'
import {
  contains,
  ifElse,
  isEmpty,
  partial,
  pipe,
  tap
} from 'ramda'

import dao from './dao'

const createDatabase = connection =>
  rethinkdb.dbCreate('threeplusbot')
    .run(connection)
    .then(() => connection)

const createTables = connection => {
  rethinkdb.db('threeplusbot')
    .tableCreate('chats')
    .run(connection)
    .then(() => connection)
}

const dropDatabase = connection => {
  return rethinkdb.dbList()
    .run(connection)
    .then((list) => {
      if (contains('threeplusbot', list)) {
        return rethinkdb.dbDrop('threeplusbot').run(connection)
      }
    })
    .then(() => connection)
}

function create (connection) {
  return Promise.resolve(connection)
    .then(createDatabase)
    .then(createTables)
    .then(build)
}

function setup (connection) {
  return rethinkdb.dbList()
    .run(connection)
    .then(ifElse(
      contains('threeplusbot'),
      partial(build, [connection]),
      partial(create, [connection])
    ))
}

function build (connection) {
  return {
    chats: dao.build(rethinkdb.db('threeplusbot').table('chats'), connection)
  }
}

function connect () {
  return rethinkdb.connect({ host: 'localhost', port: 28015 })
    // .then(dropDatabase)
    .then(setup)
}

export default {
  connect,
}
