import game from './game'

const msg = text => ({
  chat: { id: 1 },
  text,
})

const rethinkdbMock = games => ({
  table: () => ({
    get: () => ({
      run: () => (games ? Promise.resolve({ games }) : Promise.resolve({})),
      update: o => ({
        /* eslint no-param-reassign: "off" */
        run: () => (games = o.games),
      }),
    }),
  }),
  games: () => games,
})

describe('Setting game tests', () => {
  let link1
  let link2

  beforeEach(() => {
    link1 = 'http://demo.en.cx/GameDetails.aspx?gid=25701'
    link2 = 'http://classic.dzzzr.ru/demo/?section=anons&league=2'
  })

  it('should save game', () => {
    const r = rethinkdbMock([])
    game(r, msg(`/game ${link1}`))
      .then(() => expect(r.games()).toEqual([link1]))
  })

  it('should prepend new game', () => {
    const r = rethinkdbMock([link1])
    game(r, msg(`/game ${link2}`))
      .then(() => expect(r.games()).toEqual([link2, link1]))
  })

  it('should remove duplicated games', () => {
    const r = rethinkdbMock([link1, link2])
    game(r, msg(`/game ${link2}`))
      .then(() => expect(r.games()).toEqual([link2, link1]))
  })

  it('should return last added game', () => {
    const r = rethinkdbMock([link1, link2])
    game(r, msg('/game')).then(m => expect(m.text).toMatch(`${link1}`))
  })

  it('should ask to add new game', () => {
    const r = rethinkdbMock()
    game(r, msg('/game')).then(m => expect(m.text).toMatch(/⚠️/))
  })
})
