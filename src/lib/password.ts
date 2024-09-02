import { Argon2id as Argon2idPass } from "oslo/password";

export interface IHasher {
  Hash(plainPassword: string): Promise<string>;
  Verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class Argon2id extends Argon2idPass implements IHasher {
  constructor() {
    super();
  }

  Hash(plainPassword: string): Promise<string> {
    return this.hash(plainPassword);
  }

  Verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.verify(hashedPassword, plainPassword);
  }
}
