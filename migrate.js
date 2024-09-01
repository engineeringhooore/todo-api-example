import shift from "postgres-shift";
import postgres from "postgres";
import { fileURLToPath } from "url";

export const sql = postgres(process.env.PG_URL);

shift({
  sql,
  path: fileURLToPath(new URL("migrations", import.meta.url)),
  before: ({ migration_id, name }) => {
    console.log("Migrating", migration_id, name);
  },
})
  .then(() => {
    console.log("All good");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed", err);
    process.exit(1);
  });
