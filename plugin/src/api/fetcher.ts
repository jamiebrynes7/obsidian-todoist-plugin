import { requestUrl } from "obsidian";

export interface WebFetcher {
  fetch(params: RequestParams): Promise<WebResponse>;
}

export type RequestParams = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
};

export type WebResponse = {
  statusCode: number;
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
