export enum CommandType {
  Cancel = "cancel",
  Feedback = "feedback",
}

export enum TwitterEndpoint {
  StatusUpdate = "statuses/update",
}

export enum EngagementCountErrorMsg {
  LessThanOne = "Nice trick, but no one can randomly pick any number of engagements less than 1 😉",
  CannotParse = `😟 I wasn't able to find the number of engagements you want.
  Could you try again with the format '@PickAtRandom N ..'? N being the number of engagements.`,
}

export enum EngagementType {
  Retweet = "retweet",
  Follow = "follow",
}

export enum EngagementTypeErrorMsg {
  CannotParse = `Uh oh 😟! I couldn't decipher the engagement type you provided.
  Could you try again with 'retweets'`,
  CannotHandle = `Uh oh 😟! I can handle only 'retweets' for now. Other engagement types are under construction 🤖🏗`,
}

export enum TimeParserErrorMsg {
  NullValue = `Oh my. 😟 I couldn't decipher the date you submitted.
  Could you please try again with a more specific date? 🙏`,
  PastDate = `Uh oh. I understand the date you submitted as being in the past.
  If this is false, please leave a feedback with a link to the tweet, otherwise, please provide a clearer date 🙂`,
}

export enum SelectionTweetIdErrorMsg {
  NoneFound = `Sorry, I couldn't find the tweet that you want random selections for.
  I will find it if you make your request as a reply to the tweet that you want random selections for.
  Cheers!`,
}

export enum NumericConstant {
  MillisecsInOneMin = 60000,
  MillisecsInOneSec = 1000,
  SecsInOneHour = 3600
}
