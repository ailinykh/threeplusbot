import fs from 'fs'

const request = {
  get: (params) => {
 console.log(params); return new Promise((resolve, reject) => {
    fs.readFile('./__mockData__/incorrect_login_or_password.html', 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
  },
}

export default {
  'request-promise': request,
}
