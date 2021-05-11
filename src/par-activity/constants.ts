export enum CommandType {
  Cancel = "cancel",
  Feedback = "feedback",
}

export enum TwitterEndpoint {
  StatusUpdate = "statuses/update",
}

export enum EngagementCountErrorMsg {
  LessThanOne = "Nice trick, but no one can randomly pick any number of engagements less than 1 😉",
  CannotParseToNumber = `😟 I wasn't able to find the number of engagements you want.
  Could you try again with the format '@PickAtRandom N ..'? N being the number of engagements.`,
}
