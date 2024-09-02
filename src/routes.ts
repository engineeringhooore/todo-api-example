import type { AppType } from "./app";
import { JWT_AUTH_PUBLIC_KEY } from "./constants";

import { ULID } from "./lib/identifer";
import { JWT } from "./lib/jwt";

import { jws } from "./middlewares/jws";

import { initTodoHttpHandler } from "./features/todo/http.handler";
import { TodoRepository } from "./features/todo/repository";
import { TodoService } from "./features/todo/service";

export function initRoute(honoApp: AppType) {
  const ulid = new ULID();

  const authzJWT = new JWT(process.env.JWT_ISSUER, process.env.JWT_AUDIENCE);

  const jwsMiddleware = jws({
    headerPublicKey: JWT_AUTH_PUBLIC_KEY,
    verifier: async (token, publicKey) => {
      return authzJWT.AccessTokenVerify(token, publicKey);
    },
  });

  const todoRepository = new TodoRepository();
  const todoService = new TodoService(ulid, todoRepository);
  const todoHttpHandler = initTodoHttpHandler(
    {
      todoService,
    },
    jwsMiddleware,
  );
  honoApp.route("/api/v1/todo", todoHttpHandler.apiRoute);
}
