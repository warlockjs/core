import type { Casts } from "@warlock.js/cascade";
import { Model } from "@warlock.js/cascade";

export class RequestLog extends Model {
  /**
   * {@inheritdoc}
   */
  public static collection = "requestLogs";

  /**
   * {@inheritdoc}
   */
  protected casts: Casts = {
    statusCode: "integer",
    responseTime: "integer",
    responseSize: "integer",
    responseBody: "object",
    responseHeaders: "object",
    ip: "string",
    method: "string",
    route: "string",
    requestHeaders: "object",
    userAgent: "string",
    referer: "string",
    requestBody: "object",
    requestParams: "object",
    requestQuery: "object",
  };
}
