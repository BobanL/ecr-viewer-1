import { ColumnType, Generated } from 'kysely';

export interface CoreECR {
  eICR_ID: string;
  set_id: string | null;
  eicr_version_number: string | null;
  data_source: 'S3' | 'DB' | null;
  fhir_reference_link: string | null;
  patient_name_first: string | null;
  patient_name_last: string | null;
  patient_birth_date: ColumnType<Date, string | Date, string | Date> | null;
  date_created: Generated<ColumnType<Date, string | Date, string | Date>>;
  report_date: ColumnType<Date, string | Date, string | Date> | null;
}

export interface CoreECRConditions {
  uuid: string;
  eICR_ID: string;
  condition: string | null;
}

export interface CoreECRRuleSummaries {
  uuid: string;
  ecr_rr_conditions_id: string | null;
  rule_summary: string | null;
}

export interface CoreSchema {
  'ecr_viewer.ecr_data': CoreECR;
  'ecr_viewer.ecr_rr_conditions': CoreECRConditions;
  'ecr_viewer.ecr_rr_rule_summaries': CoreECRRuleSummaries;
}
