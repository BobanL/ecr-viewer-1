import { Kysely } from "kysely";
import { Core } from "./core_types";
import { Extended } from "./extended_types";
import { dialect } from "./dialects/postgres";

export const pgConstructor = (schema: "core" | "extended") => {
    if (schema === "core") {
        return new Kysely<Core>(dialect);
    } else if (schema === "extended") {
        return new Kysely<Extended>(dialect);
    } else {
        throw new Error("Invalid schema type.");
    }
}