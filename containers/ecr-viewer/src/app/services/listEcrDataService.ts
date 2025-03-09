import { Kysely, SelectQueryBuilder, sql } from 'kysely';
import { CoreSchema } from '@/app/data/db/schemas/core';
import { ExtendedSchema } from '@/app/data/db/schemas/extended';
import { db } from '@/app/data/db/base';
import { DateRangePeriod } from '@/app/utils/date-utils';
import { formatDate, formatDateTime } from './formatDateService';
import { EcrDisplay } from './listEcrDataService'; // Assuming this is exported elsewhere

type DB = CoreSchema & ExtendedSchema;

export async function listEcrData(
  startIndex: number,
  itemsPerPage: number,
  sortColumn: string,
  sortDirection: string,
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
): Promise<EcrDisplay[]> {
  const SCHEMA_TYPE = process.env.METADATA_DATABASE_SCHEMA as 'core' | 'extended';
  const isCore = SCHEMA_TYPE === 'core';

  let query = db
    .selectFrom('ecr_viewer.ecr_data as ed')
    .leftJoin('ecr_viewer.ecr_rr_conditions as erc', 'ed.eICR_ID', 'erc.eICR_ID')
    .leftJoin('ecr_viewer.ecr_rr_rule_summaries as ers', 'erc.uuid', 'ers.ecr_rr_conditions_id')
    .groupBy('ed.eICR_ID');

  // Select fields based on schema
  if (isCore) {
    query = query.select([
      'ed.eICR_ID',
      'ed.patient_name_first',
      'ed.patient_name_last',
      'ed.patient_birth_date',
      'ed.date_created',
      'ed.report_date',
      'ed.set_id',
      'ed.eicr_version_number',
      sql`ARRAY_AGG(DISTINCT erc.condition)`.as('conditions'),
      sql`ARRAY_AGG(DISTINCT ers.rule_summary)`.as('rule_summaries'),
    ]) as SelectQueryBuilder<DB, 'ed' | 'erc' | 'ers', CoreMetadataModel>;
  } else {
    query = query.select([
      'ed.eICR_ID',
      'ed.first_name',
      'ed.last_name',
      'ed.birth_date',
      'ed.encounter_start_date',
      'ed.date_created',
      'ed.set_id',
      'ed.eicr_version_number',
      sql`STRING_AGG(erc.condition, ',')`.as('conditions'),
      sql`STRING_AGG(ers.rule_summary, ',')`.as('rule_summaries'),
    ]) as SelectQueryBuilder<DB, 'ed' | 'erc' | 'ers', ExtendedMetadataModel>;
  }

  // Where clause
  if (searchTerm) {
    const fields = isCore ? ['ed.patient_name_first', 'ed.patient_name_last'] : ['ed.first_name', 'ed.last_name'];
    query = query.where((eb) =>
      eb.or(fields.map((field) => eb(field, 'ilike', `%${searchTerm}%`)))
    );
  }
  if (filterConditions?.length) {
    query = query.where('erc.condition', 'in', filterConditions);
  }
  query = query
    .where('ed.date_created', '>=', filterDates.startDate)
    .where('ed.date_created', '<=', filterDates.endDate);

  // Sorting
  const sortDir = sortDirection.toUpperCase() === 'ASC' ? 'asc' : 'desc';
  if (sortColumn === 'patient') {
    query = isCore
      ? query.orderBy(['ed.patient_name_last', 'ed.patient_name_first'], sortDir)
      : query.orderBy(['ed.last_name', 'ed.first_name'], sortDir);
  } else {
    const col = isCore || sortColumn !== 'report_date' ? `ed.${sortColumn}` : 'ed.encounter_start_date';
    query = query.orderBy(col, sortDir);
  }

  // Pagination
  query = query.offset(startIndex).limit(itemsPerPage);

  const result = await query.execute();
  return isCore ? processCoreMetadata(result as CoreMetadataModel[]) : processExtendedMetadata(result as ExtendedMetadataModel[]);
}

// Keep processCoreMetadata, processExtendedMetadata, and other helper functions as-is for now
/**
 * Processes a list of eCR data retrieved from Postgres.
 * @param responseBody - The response body containing eCR data from Postgres.
 * @returns - The processed list of eCR IDs and dates.
 */
export const processCoreMetadata = (
  responseBody: CoreMetadataModel[],
): EcrDisplay[] => {
  return responseBody.map((object) => {
    return {
      ecrId: object.eicr_id || "",
      patient_first_name: object.patient_name_first || "",
      patient_last_name: object.patient_name_last || "",
      patient_date_of_birth: object.patient_birth_date
        ? formatDate(object.patient_birth_date.toISOString())
        : "",
      reportable_conditions: object.conditions || [],
      rule_summaries: object.rule_summaries || [],
      date_created: object.date_created
        ? formatDateTime(object.date_created.toISOString())
        : "",
      patient_report_date: object.report_date
        ? formatDateTime(object.report_date.toISOString())
        : "",
      eicr_set_id: object.set_id,
      eicr_version_number: object.eicr_version_number,
    };
  });
};

/**
 * Processes a list of eCR data retrieved from Postgres.
 * @param responseBody - The response body containing eCR data from Postgres.
 * @returns - The processed list of eCR IDs and dates.
 */
const processExtendedMetadata = (
  responseBody: ExtendedMetadataModel[],
): EcrDisplay[] => {
  return responseBody.map((object) => {
    const result = {
      ecrId: object.eICR_ID || "",
      patient_first_name: object.first_name || "",
      patient_last_name: object.last_name || "",
      patient_date_of_birth: object.birth_date
        ? formatDate(object.birth_date.toISOString())
        : "",
      reportable_conditions: object.conditions?.split(",") ?? [],
      rule_summaries: object.rule_summaries?.split(",") ?? [],
      date_created: object.date_created
        ? formatDateTime(object.date_created.toISOString())
        : "",
      patient_report_date: object.encounter_start_date
        ? formatDateTime(object.encounter_start_date.toISOString())
        : "",
      eicr_set_id: object.set_id,
      eicr_version_number: object.eicr_version_number,
    };

    return result;
  });
};

/**
 * Retrieves the total number of eCRs stored in the ecr_data table.
 * @param filterDates - The date (range) to filter on
 * @param searchTerm - The search term used to filter the count query
 * @param filterConditions - The array of reportable conditions used to filter the count query
 * @returns A promise resolving to the total number of eCRs.
 */
export const getTotalEcrCount = async (
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
): Promise<number> => {
  const SCHEMA_TYPE = process.env.METADATA_DATABASE_SCHEMA;

  switch (SCHEMA_TYPE) {
    case "core":
      return getTotalCoreEcrCount(filterDates, searchTerm, filterConditions);
    case "extended":
      return getTotalExtendedEcrCount(
        filterDates,
        searchTerm,
        filterConditions,
      );
    default:
      throw new Error("Unsupported database type");
  }
};

const getTotalCoreEcrCount = async (
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
): Promise<number> => {
  var whereClause = generateCoreWhereStatement(
    filterDates,
    searchTerm,
    filterConditions,
  );
  const query = `SELECT count(DISTINCT ed.eICR_ID) as count FROM ecr_viewer.ecr_data as ed LEFT JOIN ecr_viewer.ecr_rr_conditions erc on ed.eICR_ID = erc.eICR_ID WHERE ${whereClause}`;
  const result = await sql.raw<{ count: number }>(query).execute(db);
  return result.rows[0].count;
};

const getTotalExtendedEcrCount = async (
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
): Promise<number> => {
  try {
    const whereStatement = generateWhereStatementSqlServer(
      filterDates,
      searchTerm,
      filterConditions,
    );

    const query = `SELECT COUNT(DISTINCT ed.eICR_ID) as count FROM ecr_viewer.ecr_data ed LEFT JOIN ecr_viewer.ecr_rr_conditions erc ON ed.eICR_ID = erc.eICR_ID WHERE ${whereStatement}`;
    const result = await sql.raw<{ count: number }>(query).execute(db);
    return result.rows[0].count;
  } catch (error: unknown) {
    console.error(error);
    return Promise.reject(error);
  }
};

/**
 * A custom type format for where statement
 * @param filterDates - The date (range) to filter on
 * @param searchTerm - Optional search term used to filter
 * @param filterConditions - Optional array of reportable conditions used to filter
 * @returns custom type format object for use by pg-promise
 */
export const generateCoreWhereStatement = (
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
) => {
  const statementSearch = generateSearchStatement(searchTerm);
  const statementConditions = filterConditions
    ? generateFilterConditionsStatement(filterConditions)
    : "NULL IS NULL";
  const statementDate = generateFilterDateStatementPostgres(filterDates);

  return `(${statementSearch}) AND (${statementDate}) AND (${statementConditions})`;
};

/**
 *  Generate where statement for SQL Server
 * @param filterDates - The date (range) to filter on
 * @param searchTerm - Optional search term used to filter
 * @param filterConditions - Optional array of reportable conditions used to filter
 * @returns - where statement for SQL Server
 */
const generateWhereStatementSqlServer = (
  filterDates: DateRangePeriod,
  searchTerm?: string,
  filterConditions?: string[],
) => {
  const statementSearch = generateSearchStatementSqlServer(searchTerm);
  const statementConditions = filterConditions
    ? generateFilterConditionsStatementSqlServer(filterConditions)
    : "NULL IS NULL";
  const statementDate = generateFilterDateStatementSqlServer(filterDates);

  return `(${statementSearch}) AND (${statementDate}) AND (${statementConditions})`;
};

/**
 * A custom type format for search statement
 * @param searchTerm - Optional search term used to filter
 * @returns custom type format object for use by pg-promise
 */
export const generateSearchStatement = (searchTerm?: string) => {
  const searchFields = ["ed.patient_name_first", "ed.patient_name_last"];
  return searchFields
    .map((field) => {
      if (!searchTerm) {
        return `NULL IS NULL`;
      }
      const escapedSearchTerm = searchTerm.replace(/'/g, "''");
      return `${field} ILIKE '%${escapedSearchTerm}%'`;
    })
    .join(" OR ");
};

const generateSearchStatementSqlServer = (searchTerm?: string) => {
  const searchFields = ["ed.first_name", "ed.last_name"];
  return searchFields
    .map((field) => {
      if (!searchTerm) {
        return "NULL IS NULL";
      }
      return `${field} LIKE '%${searchTerm}%'`;
    })
    .join(" OR ");
};

/**
 * A custom type format for statement filtering conditions
 * @param filterConditions - Optional array of reportable conditions used to filter
 * @returns custom type format object for use by pg-promise
 */
export const generateFilterConditionsStatement = (
  filterConditions: string[],
) => {
  if (
    Array.isArray(filterConditions) &&
    filterConditions.every((item) => item === "")
  ) {
    const subQuery = `SELECT DISTINCT erc_sub.eICR_ID FROM ecr_viewer.ecr_rr_conditions erc_sub WHERE erc_sub.condition IS NOT NULL`;
    return `ed.eICR_ID NOT IN (${subQuery})`;
  }

  const whereStatement = filterConditions
    .map((condition) => {
      return `erc_sub.condition ILIKE '%${condition}%'`;
    })
    .join(" OR ");
  const subQuery = `SELECT DISTINCT ed_sub.eICR_ID FROM ecr_viewer.ecr_data ed_sub LEFT JOIN ecr_viewer.ecr_rr_conditions erc_sub ON ed_sub.eICR_ID = erc_sub.eICR_ID WHERE erc_sub.condition IS NOT NULL AND (${whereStatement})`;
  return `ed.eICR_ID IN (${subQuery})`;
};

const generateFilterConditionsStatementSqlServer = (
  filterConditions: string[],
) => {
  if (
    Array.isArray(filterConditions) &&
    filterConditions.every((item) => item === "")
  ) {
    const subQuery = `SELECT DISTINCT erc_sub.eICR_ID FROM ecr_viewer.ecr_rr_conditions erc_sub WHERE erc_sub.condition IS NOT NULL`;
    return `ed.eICR_ID NOT IN (${subQuery})`;
  }

  const whereStatement = filterConditions
    .map((condition) => {
      return `erc_sub.condition LIKE '${condition}'`;
    })
    .join(" OR ");
  const subQuery = `SELECT DISTINCT ed_sub.eICR_ID FROM ecr_viewer.ecr_data ed_sub LEFT JOIN ecr_viewer.ecr_rr_conditions erc_sub ON ed_sub.eICR_ID = erc_sub.eICR_ID WHERE erc_sub.condition IS NOT NULL AND (${whereStatement})`;
  return `ed.eICR_ID IN (${subQuery})`;
};

/**
 * A custom type format for statement filtering by date range
 * @param props - The props representing the date range to filter on
 * @param props.startDate - Start date of date range
 * @param props.endDate - End date of date range
 * @returns custom type format object for use by pg-promise
 */
export const generateFilterDateStatementPostgres = ({
  startDate,
  endDate,
}: DateRangePeriod) => {
  return [
    `ed.date_created >= '${startDate
      .toISOString()
      .replace("Z", "-05:00")
      .replace("T05", "T00")}'`,
    `ed.date_created <= '${endDate
      .toISOString()
      .replace("Z", "-05:00")
      .replace("T05", "T00")}'`,
  ].join(" AND ");
};

const generateFilterDateStatementSqlServer = ({
  startDate,
  endDate,
}: DateRangePeriod) => {
  return [
    `ed.date_created >= '${startDate.toISOString()}'`,
    `ed.date_created <= '${endDate.toISOString()}'`,
  ].join(" AND ");
};

/**
 * A custom type format for sort statement
 * @param columnName - The column to sort by
 * @param direction - The direction to sort by
 * @returns custom type format object for use by pg-promise
 */
export const generateSortStatement = (
  columnName: string,
  direction: string,
) => {
  const validColumns = ["patient", "date_created", "report_date"];
  const validDirections = ["ASC", "DESC"];

  // Validation check
  if (!validColumns.includes(columnName)) {
    columnName = "date_created";
  }
  if (!validDirections.includes(direction)) {
    direction = "DESC";
  }

  if (columnName === "patient") {
    return `ORDER BY ed.patient_name_last ${direction}, ed.patient_name_first ${direction}`;
  }

  // Default case for other columns
  return `ORDER BY ${columnName} ${direction}`;
};

const generateSqlServerSortStatement = (
  columnName: string,
  direction: string,
) => {
  // Valid columns and directions
  const validColumns: { [key: string]: string } = {
    patient: "patient",
    date_created: "date_created",
    report_date: "encounter_start_date",
  };
  const validDirections = ["ASC", "DESC"];

  // Validation checks
  columnName = validColumns[columnName] ?? "date_created";
  if (!validDirections.includes(direction)) {
    direction = "DESC";
  }

  if (columnName === "patient") {
    return `ORDER BY ed.first_name ${direction}, ed.last_name ${direction}`;
  }

  // Default case for other columns
  return `ORDER BY ed.${columnName} ${direction}`;
};
