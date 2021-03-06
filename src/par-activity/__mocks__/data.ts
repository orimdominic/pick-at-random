/* eslint-disable */

import { VercelResponse } from "@vercel/node";
import { EngagementType, SelectionRequest } from "..";

export const nonCommandTweetEvent = {
  for_user_id: "1364541567894224902",
  user_has_blocked: false,
  tweet_create_events: [
    {
      created_at: "Thu Apr 29 14:30:22 +0000 2021",
      id: 1387776277638258700,
      id_str: "1387776277638258689",
      text: "@PickAtRandom xoxo",
      source:
        '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>',
      truncated: false,
      in_reply_to_status_id: null,
      in_reply_to_status_id_str: null,
      in_reply_to_user_id: 1364541567894225000,
      in_reply_to_user_id_str: "1364541567894224902",
      in_reply_to_screen_name: "PickAtRandom",
      user: {
        id: 165069614,
        id_str: "165069614",
        name: "Dominic Adah ✨",
        screen_name: "sudo_kaizen",
        location: "God's Hands",
        url: "https://github.com/sudo-kaizen",
        description:
          "Playfully serious\nSeriously playful\nRetired biochemist who never practised.\nService-driven web developer.\nSanity advocate\n\nhttp://curiouscat.qa/sudo_kaizen",
        translator_type: "none",
        protected: false,
        verified: false,
        followers_count: 241,
        friends_count: 357,
        listed_count: 0,
        favourites_count: 4752,
        statuses_count: 4833,
        created_at: "Sat Jul 10 14:19:26 +0000 2010",
        utc_offset: null,
        time_zone: null,
        geo_enabled: false,
        lang: null,
        contributors_enabled: false,
        is_translator: false,
        profile_background_color: "C0DEED",
        profile_background_image_url:
          "http://abs.twimg.com/images/themes/theme1/bg.png",
        profile_background_image_url_https:
          "https://abs.twimg.com/images/themes/theme1/bg.png",
        profile_background_tile: false,
        profile_link_color: "1DA1F2",
        profile_sidebar_border_color: "C0DEED",
        profile_sidebar_fill_color: "DDEEF6",
        profile_text_color: "333333",
        profile_use_background_image: true,
        profile_image_url:
          "http://pbs.twimg.com/profile_images/1331917448803721216/AH8dKudx_normal.jpg",
        profile_image_url_https:
          "https://pbs.twimg.com/profile_images/1331917448803721216/AH8dKudx_normal.jpg",
        profile_banner_url:
          "https://pbs.twimg.com/profile_banners/165069614/1540113173",
        default_profile: true,
        default_profile_image: false,
        following: null,
      },
      geo: null,
      coordinates: null,
      place: null,
      contributors: null,
      is_quote_status: false,
      quote_count: 0,
      reply_count: 0,
      retweet_count: 0,
      favorite_count: 0,
      entities: {
        hashtags: [],
        urls: [],
        user_mentions: [
          {
            screen_name: "PickAtRandom",
            name: "Pick At Random",
            id: 1364541567894225000,
            id_str: "1364541567894224902",
            indices: [0, 13],
          },
        ],
        symbols: [],
      },
      favorited: false,
      retweeted: false,
      filter_level: "low",
      lang: "en",
      timestamp_ms: "1619706622882",
    },
  ],
};

export const commandTweetEvent = {
  for_user_id: "1364541567894224902",
  user_has_blocked: false,
  tweet_create_events: [
    {
      created_at: "Thu Apr 29 14:30:22 +0000 2021",
      id: 1387776277638258700,
      id_str: "1387776277638258689",
      text: "@PickAtRandom 2 retweets in 3 days",
      source:
        '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>',
      truncated: false,
      in_reply_to_status_id: null,
      in_reply_to_status_id_str: null,
      in_reply_to_user_id: 1364541567894225000,
      in_reply_to_user_id_str: "1364541567894224902",
      in_reply_to_screen_name: "PickAtRandom",
      user: {
        id: 165069614,
        id_str: "165069614",
        name: "Dominic Adah ✨",
        screen_name: "sudo_kaizen",
        location: "God's Hands",
        url: "https://github.com/sudo-kaizen",
        description:
          "Playfully serious\nSeriously playful\nRetired biochemist who never practised.\nService-driven web developer.\nSanity advocate\n\nhttp://curiouscat.qa/sudo_kaizen",
        translator_type: "none",
        protected: false,
        verified: false,
        followers_count: 241,
        friends_count: 357,
        listed_count: 0,
        favourites_count: 4752,
        statuses_count: 4833,
        created_at: "Sat Jul 10 14:19:26 +0000 2010",
        utc_offset: null,
        time_zone: null,
        geo_enabled: false,
        lang: null,
        contributors_enabled: false,
        is_translator: false,
        profile_background_color: "C0DEED",
        profile_background_image_url:
          "http://abs.twimg.com/images/themes/theme1/bg.png",
        profile_background_image_url_https:
          "https://abs.twimg.com/images/themes/theme1/bg.png",
        profile_background_tile: false,
        profile_link_color: "1DA1F2",
        profile_sidebar_border_color: "C0DEED",
        profile_sidebar_fill_color: "DDEEF6",
        profile_text_color: "333333",
        profile_use_background_image: true,
        profile_image_url:
          "http://pbs.twimg.com/profile_images/1331917448803721216/AH8dKudx_normal.jpg",
        profile_image_url_https:
          "https://pbs.twimg.com/profile_images/1331917448803721216/AH8dKudx_normal.jpg",
        profile_banner_url:
          "https://pbs.twimg.com/profile_banners/165069614/1540113173",
        default_profile: true,
        default_profile_image: false,
        following: null,
      },
      geo: null,
      coordinates: null,
      place: null,
      contributors: null,
      is_quote_status: false,
      quote_count: 0,
      reply_count: 0,
      retweet_count: 0,
      favorite_count: 0,
      entities: {
        hashtags: [],
        urls: [],
        user_mentions: [
          {
            screen_name: "PickAtRandom",
            name: "Pick At Random",
            id: 1364541567894225000,
            id_str: "1364541567894224902",
            indices: [0, 13],
          },
        ],
        symbols: [],
      },
      favorited: false,
      retweeted: false,
      filter_level: "low",
      lang: "en",
      timestamp_ms: "1619706622882",
    },
  ],
};

export const mockVercelResponse = {
  send: (body: any) => mockVercelResponse as VercelResponse,
  json: (jsonBody: any) => mockVercelResponse as VercelResponse,
  status: (statusCode: number) => mockVercelResponse as VercelResponse,
} as VercelResponse;

export const mockTweet = {
  created_at: "date",
  id_str: "string",
  text: "string",
  truncated: false,
  in_reply_to_status_id_str: "string",
  in_reply_to_user_id_str: "string",
  retweeted_status: {
    text: "string",
  },
  is_quote_status: { text: "string" },
  user: {
    id_str: "string",
    screen_name: "string",
  },
};

export const mockRealMention = {
  createdAt: "created_at",
  id: "tweet_id",
  refTweetId: "ref_tweet_id",
  authorName: "author_name",
  authorId: "author_id",
  text: "text",
};

export const mockCancelMention = {
  createdAt: "created_at",
  id: "tweet_id",
  refTweetId: "ref_tweet_id",
  authorName: "author_name",
  authorId: "author_id",
  text: "text",
  cmdText: "cancel",
};

export const mockSelReq: SelectionRequest = {
  authorId: "author_id",
  authorName: "author_name",
  count: 1,
  engagement: EngagementType.Retweet,
  id: "tweet_id",
  refTweetId: "ref_tweet_id",
  selectionTime: new Date().toISOString(),
  stringify: () => "",
};
