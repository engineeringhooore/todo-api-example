import { NotFoundError } from "@/exceptions/not-found.error";
import { sql } from "@/lib/db";
import { Auth, type IAuth } from "@/types/auth";
import type { AuthTable } from "@/types/auth-table";

export interface IAuthRepository {
  Insert(auth: IAuth): Promise<void>;
  GetByUsername(username: string): Promise<IAuth>;
}

export class AuthRepository implements IAuthRepository {
  async Insert(auth: IAuth): Promise<void> {
    await sql`INSERT INTO auth (id, username, password) VALUES (${auth.GetId()}, ${auth.GetUsername()}, ${auth.GetPassword()})`;
  }

  async GetByUsername(username: string): Promise<IAuth> {
    const [auth]: [AuthTable?] =
      await sql`SELECT id, username, password FROM auth WHERE username = ${username}`;

    if (!auth) {
      throw new NotFoundError(`${username} not found.`);
    }

    return new Auth(auth.id, auth.username, auth.password);
  }
}
