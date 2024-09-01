import postgres, { type PostgresError } from "postgres";

export function isPostgresError(err: unknown): err is PostgresError {
  return err instanceof Error && err.name === "PostgresError";
}

export const sql = postgres(process.env.PG_URL);
