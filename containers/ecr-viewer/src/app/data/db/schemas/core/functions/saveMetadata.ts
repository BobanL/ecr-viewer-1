import { Kysely } from "kysely";
import { db } from "@/app/data/db/factory"; // Kysely instance
import { BundleCoreMetadata, SaveResponse } from "@/app/api/save-fhir-data/types";

export const saveMetadata = async (
  metadata: BundleCoreMetadata,
  ecrId: string,
): Promise<SaveResponse> => {
  try {
    await (db as Kysely<any>).transaction().execute(async (trx) => {
      await trx
        .insertInto("ecr_data")
        .values({
          eICR_ID: ecrId,
          set_id: metadata.eicr_set_id,
          patient_name_last: metadata.last_name,
          patient_name_first: metadata.first_name,
          patient_birth_date: new Date(metadata.birth_date),
          data_source: "DB",
          report_date: new Date(metadata.report_date),
          eicr_version_number: metadata.eicr_version_number,
        })
        .execute();
      // Add rr and rule_summaries logic here (similar to original)
    });
    return { message: "Success. Saved metadata to database.", status: 200 };
  } catch (error: unknown) {
    console.error({ message: "Failed to insert metadata.", error, ecrId });
    return { message: "Failed to insert metadata to database.", status: 500 };
  }
};
