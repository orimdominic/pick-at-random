import {customChronoParser as timeparser} from "../time-parser"

describe("time parser", () => {

  const refDate = new Date("Sat May 01 12:00 +0000 2021")

  it("returns null for an invalid selection date", () => {
    const vals = [
      '3 retweets in whenever',
      '3 retweets on my birthday',
    ]
    for (const val of vals) {
      const parsedDate = timeparser.parseDate(val,refDate) as Date
      expect(parsedDate).toBe(null)
    }
  })

  it("returns a correct selection date from a text", ()=> {
    const vals = [
      {text: '3 retweets three months from now', date: 1, month: 7, year: 2021},
      {text: '3 retweets in three months', date: 1, month: 7, year: 2021}
    ]
    for (const val of vals) {
      const parsedDate = timeparser.parseDate(val.text,refDate) as Date
      expect(parsedDate.getDate()).toBe(val.date)
      expect(parsedDate.getMonth()).toBe(val.month)
      expect(parsedDate.getFullYear()).toBe(val.year)
    }
  })

  it("rolls over the year for a selection date with a past month", ()=> {
    const vals = [
      {text: '3 retweets in january', date: 1, month: 0, year: 2022},
      {text: '3 retweets on february 4', date: 4, month: 1, year: 2022},
      {text: '3 retweets in mar', date: 1, month: 2, year: 2022},
    ]
    for (const val of vals) {
      const parsedDate = timeparser.parseDate(val.text,refDate) as Date
      expect(parsedDate.getDate()).toBe(val.date)
      expect(parsedDate.getMonth()).toBe(val.month)
      expect(parsedDate.getFullYear()).toBe(val.year)
    }
  })
})