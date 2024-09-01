export interface IJWT {
  Sign(userId: string): Promise<[string, string]>;
  VerifyAccessToken(token: string): Promise<string>;
  VerifyRefreshToken(token: string): Promise<string>;
}

export class JWT implements IJWT {
  constructor() {}

  async Sign(userId: string): Promise<[string, string]> {
    return [userId, userId];
  }

  async VerifyAccessToken(_: string): Promise<string> {
    return "";
  }

  async VerifyRefreshToken(_: string): Promise<string> {
    return "";
  }
}
