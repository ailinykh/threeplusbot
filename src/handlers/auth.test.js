import auth from './auth'

const getMessage = text => ({
  chat: { id: 1 },
  text,
})

const rethinkdbMock = credentials => ({
  table: () => ({
    get: () => ({
      run: () => Promise.resolve({ credentials }),
      update: o => ({
        /* eslint no-param-reassign: "off" */
        run: () => (credentials = o.credentials),
      }),
    }),
  }),
  credentials: () => credentials, // TODO: find another good way to get credentials
})

describe('Setting credentials tests', () => {
  it('should save credentials', () => {
    const r = rethinkdbMock([])
    auth(r, getMessage('/auth login password'))
      .then(() => expect(r.credentials()).toEqual([['login', 'password']]))
  })

  it('should prepend new credentials', () => {
    const r = rethinkdbMock([['login', 'password']])
    auth(r, getMessage('/auth newLogin newPassword'))
      .then(() => expect(r.credentials()).toEqual([['newLogin', 'newPassword'], ['login', 'password']]))
  })

  it('should remove duplicated credentials', () => {
    const r = rethinkdbMock([['123', '321'], ['login', 'password']])
    auth(r, getMessage('/auth login password'))
      .then(() => expect(r.credentials()).toEqual([['login', 'password'], ['123', '321']]))
  })

  it('should reject if not enough parameters', () => {
    const r = rethinkdbMock([])
    auth(r, getMessage('/auth loginonly')).catch(e => expect(e.text).toMatch(/❌/))
  })
})
