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
  Could you try again with any of 'retweets'/'followers'`,
  CannotHandle = `Uh oh 😟! I cannot handle picks for that engagement type for now. Can you try again with 'retweets'/'follows'?`,
}
