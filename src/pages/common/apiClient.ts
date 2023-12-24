interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: any;
  auth?: any;
  responseType?: ResponseType;
}

type FetchMethod = 'GET' | 'POST';

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  public async fetch(method: FetchMethod, path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${this.config.baseURL}/${path.replace(/^\//, '')}`, {
      ...init,
      headers: {
        ...this.config.headers,
        ...(init && init.headers),
      },
      method: method,
    });
  }
}

export default ApiClient;
