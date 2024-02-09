export interface WebFetcher {
  fetch(params: RequestParams): Promise<WebResponse>,
}

export type RequestParams = {
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string,
};

export type WebResponse = {
  statusCode: number,
  body: string,
}