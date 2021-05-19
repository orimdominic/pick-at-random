import { customChronoParser as timeparser } from "../time-parser";

describe("time parser", () => {
  const refDate = new Date("Sat May 01 12:00 +0000 2021");

  it("returns null for an invalid selection date", () => {
    const vals = ["3 retweets in whenever", "3 retweets on my birthday"];
    for (const val of vals) {
      const parsedDate = timeparser.parseDate(val, refDate) as Date;
      expect(parsedDate).toBe(null);
    }
  });

  it("rolls over the year for a selection date with a past month", () => {
    const vals = [
      { text: "3 retweets in january", month: 0, year: 2022 },
      { text: "3 retweets on february 4", month: 1, year: 2022 },
      { text: "3 retweets in mar", month: 2, year: 2022 },
    ];
    for (const val of vals) {
      const parsedDate = timeparser.parseDate(val.text, refDate, {
        forwardDate: true,
      }) as Date;
      expect(parsedDate.getMonth()).toBe(val.month);
      expect(parsedDate.getFullYear()).toBe(val.year);
    }
  });

  it("rolls over the day for a selection date with a past day", () => {
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = new Date().getDay();
    const [theDayBeforeYesterday, yesterday] = [
      weekdays[(today + 1) % weekdays.length],
      weekdays[today % weekdays.length],
    ];
    const vals = [
      {
        text: `3 retweets on ${theDayBeforeYesterday}`,
        day: `${theDayBeforeYesterday}`,
      },
      { text: `3 retweets on ${yesterday}`, day: `${yesterday}` },
    ];
    for (const v of vals) {
      const parsedDate = timeparser.parseDate(v.text, new Date(), {
        forwardDate: true,
      }) as Date;
      expect(weekdays[parsedDate.getDay()]).toBe(v.day);
      expect(parsedDate.getTime()).toBeGreaterThan(new Date().getTime());
    }
  });
});
