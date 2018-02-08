import encounter from './encounter'

jest.unmock('cheerio')

describe('encounter provider test', () => {
  const link = 'http://demo.en.cx/GameDetails.aspx?gid=25701'

  it('should provide game from link', () => {
    expect.assertions(2)
    return encounter.game(link)
      .then((p) => {
        expect(p.provider).toEqual('encounter')
        expect(p.url).toEqual(link)
      })
  })

  it('should validate login and password', () => {
    // expect.assertions(1)
    jest.mock('request-promise')
    return encounter.level(null, null, {}).then(msg => console.log(msg))
  })
})
