import { Kysely } from "kysely";

import { Core } from "@/app/data/db/schemas/core/types";
import { db } from "@/app/data/db/factory";
import { Extended } from "@/app/data/db/schemas/extended/types";

/**
 * Retrieves all unique conditions from the ecr_rr_conditions table.
 * @returns Array of conditions
 */



import { ColumnType, Generated } from "kysely";

export interface BaseECR<T extends object = {}> {
  eICR_ID: Generated<string>;
  set_id?: string;
  fhir_reference_link?: string;
  eicr_version_number?: string;
  date_created?: ColumnType<Date>;
} & T;

export interface BaseECRConditions {
  uuid: Generated<string>;
  eICR_ID: string;
  condition: string;
}

export interface BaseECRRuleSummaries {
  uuid: Generated<string>;
  ecr_rr_conditions_id: string;
  rule_summary: string;
}
