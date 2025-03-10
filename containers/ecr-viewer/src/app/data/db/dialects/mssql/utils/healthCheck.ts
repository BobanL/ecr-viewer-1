// TODO: Implement an MSSQL-specific health check

import { Kysely } from "kysely";

export const healthCheck = async (db: Kysely<Core> | Kysely<Extended>) => {
  return db.query("SELECT 1");
}
