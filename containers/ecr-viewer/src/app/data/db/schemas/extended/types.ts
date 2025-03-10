import { ColumnType, Generated } from 'kysely';

export interface ExtendedECR {
  eICR_ID: string;
  set_id: string | null;
  fhir_reference_link: string | null;
  last_name: string | null;
  first_name: string | null;
  birth_date: ColumnType<Date, string | Date, string | Date> | null;
  gender: string | null;
  birth_sex: string | null;
  gender_identity: string | null;
  race: string | null;
  ethnicity: string | null;
  latitude: number | null;
  longitude: number | null;
  homelessness_status: string | null;
  disabilities: string | null;
  tribal_affiliation: string | null;
  tribal_enrollment_status: string | null;
  current_job_title: string | null;
  current_job_industry: string | null;
  usual_occupation: string | null;
  usual_industry: string | null;
  preferred_language: string | null;
  pregnancy_status: string | null;
  rr_id: string | null;
  processing_status: string | null;
  eicr_version_number: string | null;
  authoring_date: ColumnType<Date, string | Date, string | Date> | null;
  authoring_provider: string | null;
  provider_id: string | null;
  facility_id: string | null;
  facility_name: string | null;
  encounter_type: string | null;
  encounter_start_date: ColumnType<Date, string | Date, string | Date> | null;
  encounter_end_date: ColumnType<Date, string | Date, string | Date> | null;
  reason_for_visit: string | null;
  active_problems: string | null; // Portable; use JSON or delimited string
  date_created: Generated<ColumnType<Date, string | Date, string | Date>>;
}

export interface PatientAddress {
  uuid: string;
  use: 'home' | 'work' | 'temp' | 'old' | 'billing' | null;
  type: 'postal' | 'physical' | 'both' | null;
  text: string | null;
  line: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  period_start: ColumnType<Date, string | Date, string | Date> | null;
  period_end: ColumnType<Date, string | Date, string | Date> | null;
  eICR_ID: string | null;
}

export interface ECRLabs {
  uuid: string;
  eICR_ID: string;
  test_type: string | null;
  test_type_code: string | null;
  test_type_system: string | null;
  test_result_qualitative: string | null;
  test_result_quantitative: number | null;
  test_result_units: string | null;
  test_result_code: string | null;
  test_result_code_display: string | null;
  test_result_code_system: string | null;
  test_result_interpretation: string | null;
  test_result_interpretation_code: string | null;
  test_result_interpretation_system: string | null;
  test_result_reference_range_low_value: number | null;
  test_result_reference_range_low_units: string | null;
  test_result_reference_range_high_value: number | null;
  test_result_reference_range_high_units: string | null;
  specimen_type: string | null;
  specimen_collection_date: ColumnType<Date, string | Date, string | Date> | null;
  performing_lab: string | null;
}

export interface ExtendedECRConditions {
  uuid: string;
  eICR_ID: string;
  condition: string | null;
}

export interface ExtendedECRRuleSummaries {
  uuid: string;
  ecr_rr_conditions_id: string | null;
  rule_summary: string | null;
}

export interface ExtendedSchema {
  'ecr_viewer.ecr_data': ExtendedECR;
  'ecr_viewer.patient_address': PatientAddress;
  'ecr_viewer.ecr_labs': ECRLabs;
  'ecr_viewer.ecr_rr_conditions': ExtendedECRConditions;
  'ecr_viewer.ecr_rr_rule_summaries': ExtendedECRRuleSummaries;
}
