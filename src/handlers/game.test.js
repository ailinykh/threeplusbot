import g from './game'

const msg = (text) => ({
  chat: { id: 1 },
  text,
})

const rethinkdbMock = (game, games) => ({
  table: () => ({
    get: () => ({
      run: () => Promise.resolve({ game, games }),
      update: (o) => ({
        /* eslint no-param-reassign: "off" */
        run: () => {
          games = Object.assign(games, o.games)
          game = Object.assign(game, o.game)
          return Promise.resolve({ game, games })
        },
      }),
      replace: (o) => ({
        run: () => {
          if (o.games) {
            games = o.games
          }
          if (o.game) {
            game = o.game
          }
          return Promise.resolve({ game, games })
        },
      }),
    }),
  }),
  game: () => game,
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
    expect.assertions(1)
    const r = rethinkdbMock({}, [])
    return g(r, msg(`/game ${link1}`))
      .then(() => expect(r.game().url).toEqual(link1))
  })

  it('should not save unknown providers game', () => {
    expect.assertions(1)
    const r = rethinkdbMock({}, [])
    return expect(g(r, msg(`/game ${link2}`))).rejects.toBeDefined()
  })

  it('should archive old game with tasks', () => {
    expect.assertions(1)
    const currentGameWithTasks = { title: 'Some game title', tasks: [] }
    const r = rethinkdbMock(currentGameWithTasks, [])
    return g(r, msg(`/game ${link1}`))
      .then(() => expect(r.games()).toEqual([currentGameWithTasks]))
  })

  it('should not archive old game without tasks', () => {
    expect.assertions(1)
    const currentGameWithOutTasks = { title: 'Some game title' }
    const r = rethinkdbMock(currentGameWithOutTasks, [])
    return g(r, msg(`/game ${link1}`))
      .then(() => expect(r.games()).toEqual([]))
  })

  it('should return current game', () => {
    const currentGame = { title: 'Some game title', url: link1 }
    const r = rethinkdbMock(currentGame, [])
    return g(r, msg('/game')).then((m) => expect(m.text).toContain(link1))
  })

  it('should ask to add new game', () => {
    expect.assertions(1)
    const r = {
      table: () => ({
        get: () => ({
          run: () => Promise.resolve({ games: [] }),
        }),
      }),
    }
    return g(r, msg('/game')).then((m) => expect(m.text).toMatch(/⚠️/))
  })
})
