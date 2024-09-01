import type { IHasher } from "@/lib/password";
import type { IAuthRepository } from "./repository";
import type { LoginSchema } from "./request.schema";
import { UnprocessableError } from "@/exceptions/unprocessable.error";
import { Auth } from "@/types/auth";
import type { IIdentifer } from "@/lib/identifer";

export interface IAuthService {
  Login(request: LoginSchema): Promise<string>;
  Register(request: LoginSchema): Promise<string>;
}

export class AuthService implements IAuthService {
  #identifier: IIdentifer;
  #hasher: IHasher;
  #authRepository: IAuthRepository;

  constructor(
    identifier: IIdentifer,
    hasher: IHasher,
    authRepository: IAuthRepository,
  ) {
    this.#identifier = identifier;
    this.#hasher = hasher;
    this.#authRepository = authRepository;
  }

  async Login({ username, password }: LoginSchema): Promise<string> {
    const auth = await this.#authRepository.GetByUsername(username);
    const isPasswordMatch = await this.#hasher.Verify(
      password,
      auth.GetPassword(),
    );
    if (!isPasswordMatch) {
      throw new UnprocessableError("Password not match.");
    }

    return auth.GetId();
  }

  async Register({ username, password }: LoginSchema): Promise<string> {
    const authID = this.#identifier.Generate();
    const hashedPassword = await this.#hasher.Hash(password);
    const auth = new Auth(authID, username, hashedPassword);
    await this.#authRepository.Insert(auth);

    return authID;
  }
}
