import { ITweetEntityUrl } from "./ITweetEntityUrl";

export interface IDirectMessageEvent {
  type: string;
  id: string;
  created_timestamp: string;
  message_create: {
    target: {
      /**
       * The id of recipient of the message
       */
      recipient_id: string;
    };
    sender_id: string;
    source_app_id: string;
    message_data: {
      text: string;
      entities: {
        urls: ITweetEntityUrl[];
      };
    };
  };
}
