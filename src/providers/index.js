import url from 'url'

import {
  always,
  endsWith,
  ifElse,
  pipe,
  prop,
} from 'ramda'

import encounter from './encounter'

function resolve(link) {
  return Promise.resolve(link)
    .then(pipe(url.parse))
    .then(prop('host'))
    .then(ifElse(
      endsWith('en.cx'),
      always(encounter),
      () => Promise.reject('❌ Unknown provider'),
    ))
}

export default {
  encounter,
  resolve,
}
