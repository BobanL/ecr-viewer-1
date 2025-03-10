import type { CoreSchema } from '../schemas/core';
import type { ExtendedSchema } from '../schemas/extended';

export type SchemaRegistry = {
  core: CoreSchema;
  extended: ExtendedSchema;
};

export async function loadSchema<T extends keyof SchemaRegistry>(
  schemaName: T
): Promise<SchemaRegistry[T]> {
  const schemaModule = await import(`../schemas/${schemaName}`);
  return schemaModule.default || (schemaModule as SchemaRegistry[T]);
}
