import {
  partial,
  always,
  identity,
  ifElse,
  isNil,
  merge,
  assoc,
  prop,
  pipe,
  omit,
  map,
} from 'ramda'

const queries = {
  notDeleted: { deletedAt: { $exists: false } },
}

const renameId = obj =>
  assoc('id', prop('_id', obj), omit('_id', obj))

const retry = func =>
  retryPromise(func, { max_tries: 4, interval: 500 })

function retryPromise (func, options) {
  options = merge({ max_tries: 3, interval: 400 }, options)
  return func()
    .catch(e => {
      if (options.max_tries > 0) {
        options.max_tries--
        return retryPromise(func, options)
      }
    })
}

function find (table, connection, query) {
  return retry(() =>
    table.getAll(merge(queries.notDeleted, query))
      .toArray()
      .then(map(renameId))
  )
}

function update (collection, query, document, options) {
  const sealed = merge({}, document)
  const opts = merge({ returnOriginal: false }, options || {})

  return retry(() =>
    collection.findOneAndUpdate(query, sealed, opts)
      .then(prop('value'))
      .then(ifElse(
        isNil,
        identity,
        renameId,
      ))
  )
}

function create (collection, document) {
  const now = new Date()
  const timestamps = {
    createdAt: now,
    updatedAt: now,
  }

  const sealed = merge(document, timestamps)

  return retry(() =>
    collection.insertOne(sealed)
      .then(pipe(always(sealed), renameId))
  )
}

function destroy (collection, query, options) {
  if (options.hard) {
    return retry(() => collection.remove(query))
  }

  return retry(() => collection.findOneAndUpdate(
    query, { $set: { deletedAt: new Date() } }))
}

function aggregate (collection, pipeline) {
  return retry(() => collection.aggregate(pipeline).toArray())
}

function build (table, connection) {
  console.log('DAO BUILD CALLED', table);
  return {
    find: partial(find, [table, connection]),
  //   update: partial(update, [table]),
  //   create: partial(create, [table]),
  //   destroy: partial(destroy, [table]),
  //   aggregate: partial(aggregate, [table]),
  }
}

export default {
  build
}
