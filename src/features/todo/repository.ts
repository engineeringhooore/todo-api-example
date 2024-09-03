import { NotFoundError } from "@/exceptions/not-found.error";
import { sql } from "@/lib/db";
import { Todo } from "./model";
import type { TodoTable } from "@/types/todo-table";

export interface ITodoRepository {
  Insert(todo: Todo): Promise<void>;
  Update(todoId: string, todo: Todo): Promise<void>;
  GetById(todoId: string): Promise<Todo>;
  GetAll(): Promise<Todo[]>;
  DeleteById(todoId: string): Promise<void>;
}

export class TodoRepository implements ITodoRepository {
  async Insert(todo: Todo): Promise<void> {
    await sql`INSERT INTO todo (id, note, attachment) VALUES (${todo.GetId()}, ${todo.GetNote()}, ${todo.GetAttachment()})`;
  }

  async Update(todoId: string, todo: Todo): Promise<void> {
    const result =
      await sql`UPDATE todo SET (note, attachment) = (${todo.GetNote()}, ${todo.GetAttachment()}) WHERE id = ${todoId} RETURNING id`;
    if (result.count === 0) {
      throw new NotFoundError(`todo with ${todoId} id not found.`);
    }
  }

  async GetById(todoId: string): Promise<Todo> {
    const [todo]: [Pick<TodoTable, "id" | "note" | "attachment">?] =
      await sql`SELECT id, note, attachment FROM todo WHERE id = ${todoId}`;

    if (!todo) {
      throw new NotFoundError(`todo with ${todoId} id not found.`);
    }

    return new Todo(todo.id, todo.note, todo.attachment);
  }

  async GetAll(): Promise<Todo[]> {
    const todos: Pick<TodoTable, "id" | "note" | "attachment">[] =
      await sql`SELECT id, note, attachment FROM todo`;

    return todos.map((todo) => {
      return new Todo(todo.id, todo.note, todo.attachment);
    });
  }

  async DeleteById(todoId: string): Promise<void> {
    const result =
      await sql`DELETE FROM todo WHERE id = ${todoId} RETURNING id`;
    if (result.count === 0) {
      throw new NotFoundError(`todo with ${todoId} id not found.`);
    }
  }
}
