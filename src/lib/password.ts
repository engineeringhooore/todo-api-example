import { Argon2id as Argon2idPass } from "oslo/password";

export interface IHasher {
  Hash(plainPassword: string): Promise<string>;
  Verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class Argon2id implements IHasher {
  #argon2id: Argon2idPass;
  constructor() {
    this.#argon2id = new Argon2idPass();
  }

  Hash(plainPassword: string): Promise<string> {
    return this.#argon2id.hash(plainPassword);
  }

  Verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.#argon2id.verify(hashedPassword, plainPassword);
  }
}
