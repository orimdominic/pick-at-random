import { SelectionRequest } from "./SelectionRequest";

export class POTOFactory {
  constructor() {}

  /**
   * Builds a SelectionRequest from a json response
   * @param {any} jsonSelReq
   * @return {SelectionRequest}
   */
  static buildSelectionRequest(jsonSelReq: any): SelectionRequest {
    return new SelectionRequest(
      {
        authorId: jsonSelReq.authorId,
        authorName: jsonSelReq.authorId,
        refTweetId: jsonSelReq.refTweetId,
        id: jsonSelReq.id,
        createdAt: "",
        text: "",
      },
      jsonSelReq.count,
      jsonSelReq.engagement,
      jsonSelReq.selectionTime
    );
  }
}
