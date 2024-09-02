declare namespace NodeJS {
  interface ProcessEnv {
    HOSTNAME: string;
    PORT: string;
    PG_URL: string;
    CORS_ORIGIN_DOMAIN: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
  }
}
