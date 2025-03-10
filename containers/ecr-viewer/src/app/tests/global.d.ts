// src/app/tests/global.d.ts
import { Kysely } from 'kysely';
import { CoreSchema } from '@/app/data/db/schemas/core'; // Adjust path as needed
import { ExtendedSchema } from '@/app/data/db/schemas/extended'; // Adjust path as needed

declare global {
  var testDb: Kysely<CoreSchema> | Kysely<ExtendedSchema>;
}
