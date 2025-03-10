import { Kysely } from "kysely";

export const loadSchema = async () => {
  const schema = process.env.METADATA_DATABASE_SCHEMA || "core";
  if (schema === "extended") {
    const { saveMetadata } = await import("../extended");
    return { saveMetadata };
  } else {
    const { saveMetadata } = await import("../core");
    return { saveMetadata };
  }
};
