/**
 * @fileoverview
 * Custom date-time parser functions to convert date and time
 * statements in human language to understandable computer
 * format, using chrono-node
 *
 * Borrows heavily from shalvah/RemindMeOfThisTweet timeparser.js
 * at https://github.com/shalvah/RemindMeOfThisTweet/blob/master/src/timeparser.js
 */
import { casual, Refiner, Parser, Meridiem } from "chrono-node";
const customChronoParser = casual.clone();

/**
 * By default, when chrono is passed a string such as "in March" of
 * a year, say, 2018, and the reference date is April 2018, chrono
 * returns march of the same year as the result date, even when
 * `forwardDate` is true.
 * This custom refiner corrects that
 */
const rollOverYearRefiner: Refiner = {
  refine: (_, results) => {
    results.forEach(({ start, refDate }) => {
      if (
        start.isCertain("month") &&
        !start.isCertain("year") &&
        start.date().getTime() < refDate.getTime()
      ) {
        start.imply("year", start.date().getFullYear() + 1);
      }
    });
    return results;
  },
};

const rollOverDayRefiner: Refiner = {
  refine: (_, results) => {
    results.forEach(({ start, refDate }) => {
      if (
        start.isCertain("hour") &&
        !start.isCertain("day") &&
        start.date().getTime() < refDate.getTime()
      ) {
        start.imply("day", start.date().getDate() + 1);
      }
    });
    return results;
  },
};

// Examples: "Tuesday, 9th of July 2019. 19:00 GMT" and "tomorrow by 9pm"
// Both produce two results each: one with the date and one with the time
const combineDateAndTime: Refiner = {
  refine: (_, results) => {
    if (results.length < 2) {
      // Our current data suggests this scenario only yields two results
      return results;
    }
    const resultWithDate = results.find(({ start }) => {
      return start.isCertain("day") || start.isCertain("weekday");
    });
    const resultWithTime = results.find(({ start }) => {
      return start.isCertain("hour");
    });
    if (resultWithDate == undefined || resultWithTime == undefined) {
      // Faulty thesis; bail.
      return results;
    }

    resultWithDate.start.imply("hour", resultWithTime.start.date().getHours());
    resultWithDate.start.imply(
      "minute",
      resultWithTime.start.date().getMinutes()
    );
    const meridiem =
      resultWithTime.start.date().getHours() < 12 ? Meridiem.AM : Meridiem.PM;
    resultWithDate.start.imply("meridiem", meridiem);
    resultWithDate.start.imply(
      "timezoneOffset",
      resultWithTime.start.date().getTimezoneOffset()
    );

    resultWithTime.start.imply(
      "weekday",
      resultWithDate.start.get("weekday") as number
    );
    resultWithTime.start.imply(
      "day",
      resultWithDate.start.get("day") as number
    );
    resultWithTime.start.imply(
      "month",
      resultWithDate.start.get("month") as number
    );
    resultWithTime.start.imply(
      "year",
      resultWithDate.start.get("year") as number
    );

    return results;
  },
};

const hrsMinsParser: Parser = {
  pattern: () => /(\d+)\s*hrs?(\s+(\d+)\s*min(s|ute|utes)?)?/i, // Match a pattern like "in 22hrs (30 mins)"
  extract: ({ refDate, createParsingResult }, match) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let dateMoment = require("moment")(refDate);
    dateMoment = dateMoment.add(match[1], "hours");
    dateMoment = dateMoment.add(match[3], "minutes");
    return createParsingResult(match.index as number, match[0], {
      hour: dateMoment.hour(),
      minute: dateMoment.minute(),
      second: dateMoment.second(),
      day: dateMoment.date(),
      month: dateMoment.month() + 1,
      year: dateMoment.year(),
    });
  },
};

customChronoParser.parsers.push(hrsMinsParser);
customChronoParser.refiners.push(rollOverYearRefiner);
customChronoParser.refiners.push(rollOverDayRefiner);
customChronoParser.refiners.push(combineDateAndTime);

export { customChronoParser };
