import { requestUrl } from "obsidian";

export interface WebFetcher {
  fetch(params: RequestParams): Promise<WebResponse>;
}

export type StatusCode = number;

export const StatusCode = {
  isError(code: StatusCode): boolean {
    return code >= StatusCodes.BadRequest;
  },
  isServerError(code: StatusCode): boolean {
    return code >= StatusCodes.InternalServerError;
  },
} as const;

export const StatusCodes = {
  OK: 200,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  InternalServerError: 500,
} as const;

export type RequestParams = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
};

export type WebResponse = {
  statusCode: StatusCode;
  body: string;
};

export class ObsidianFetcher implements WebFetcher {
  public async fetch(params: RequestParams): Promise<WebResponse> {
    const response = await requestUrl({
      url: params.url,
      method: params.method,
      body: params.body,
      headers: params.headers,
      throw: false,
    });

    return {
      statusCode: response.status,
      body: response.text,
    };
  }
}
