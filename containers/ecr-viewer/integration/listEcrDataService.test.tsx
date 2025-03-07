/**
 * @jest-environment node
 */
import { formatDate, formatDateTime } from "@/app/services/formatDateService";
import {
  CoreMetadataModel,
  EcrDisplay,
  generateFilterConditionsStatement,
  generateSearchStatement,
  generateCoreWhereStatement,
  getTotalEcrCount,
  processCoreMetadata,
  listEcrData,
  generateFilterDateStatementPostgres,
} from "@/app/services/listEcrDataService";
import { buildCoreAlias, dropCoreAlias } from "@/app/api/services/db_schema";
import { db } from "@/app/api/services/database";

const testDateRange = {
  startDate: new Date("12-01-2024"),
  endDate: new Date("12-02-2024"),
};

describe("listEcrDataService", () => {
  describe("process Metadata", () => {
    it("should return an empty array when responseBody is empty", () => {
      const result = processCoreMetadata([]);
      expect(result).toEqual([]);
    });

    it("should map each object in responseBody to the correct output structure", () => {
      const date1 = new Date();
      const date2 = new Date();
      const date3 = new Date();

      const responseBody: CoreMetadataModel[] = [
        {
          eicr_id: "ecr1",
          date_created: date1,
          patient_name_first: "Test",
          patient_name_last: "Person",
          patient_birth_date: date2,
          report_date: date3,
          conditions: ["Long"],
          rule_summaries: ["Longer"],
          data_source: "DB",
          data_link: "",
          set_id: "123",
          eicr_version_number: "1",
        },
        {
          eicr_id: "ecr2",
          date_created: date1,
          patient_name_first: "Another",
          patient_name_last: "Test",
          patient_birth_date: date2,
          report_date: date3,
          conditions: ["Stuff"],
          rule_summaries: ["Other stuff", "Even more stuff"],
          data_source: "DB",
          data_link: "",
          set_id: "124",
          eicr_version_number: "1",
        },
      ];

      const expected: EcrDisplay[] = [
        {
          ecrId: "ecr1",
          date_created: formatDateTime(date1.toISOString()),
          patient_first_name: "Test",
          patient_last_name: "Person",
          patient_date_of_birth: formatDate(date2.toISOString()),
          patient_report_date: formatDateTime(date3.toISOString()),
          reportable_conditions: expect.arrayContaining(["Long"]),
          rule_summaries: expect.arrayContaining(["Longer"]),
          eicr_set_id: "123",
          eicr_version_number: "1",
        },
        {
          ecrId: "ecr2",
          date_created: formatDateTime(date1.toISOString()),
          patient_first_name: "Another",
          patient_last_name: "Test",
          patient_date_of_birth: formatDate(date2.toISOString()),
          patient_report_date: formatDateTime(date3.toISOString()),
          reportable_conditions: expect.arrayContaining(["Stuff"]),
          rule_summaries: expect.arrayContaining([
            "Other stuff",
            "Even more stuff",
          ]),
          eicr_set_id: "124",
          eicr_version_number: "1",
        },
      ];
      const result = processCoreMetadata(responseBody);

      expect(result).toEqual(expected);
    });
  });

  describe("listCoreEcrData", () => {
    interface EcrDisplay {
      ecrId: string;
      patient_first_name: string;
      patient_last_name: string;
      patient_date_of_birth: string | undefined;
      reportable_conditions: string[];
      rule_summaries: string[];
      patient_report_date: string;
      date_created: string;
      eicr_set_id: string | undefined;
      eicr_version_number: string | undefined;
    }
    beforeAll(async () => {
      process.env.METADATA_DATABASE_SCHEMA = "core";
      await buildCoreAlias();
    });

    afterAll(async () => {
      delete process.env.METADATA_DATABASE_TYPE;
      await dropCoreAlias();
    });

    it("should return empty array when no data is found", async () => {
      const startIndex = 0;
      const itemsPerPage = 25;
      const columnName = "date_created";
      const direction = "DESC";

      const result = await listEcrData(
        startIndex,
        itemsPerPage,
        columnName,
        direction,
        testDateRange,
      );

      expect(result).toBeEmpty();
    });

    it("should return data when found", async () => {
      await (db as any)
        .insertInto("ecr_viewer.ecr_data")
        .values({
          eicr_id: "12345",
          set_id: "123",
          data_source: "DB",
          fhir_reference_link: "",
          eicr_version_number: "1",
          patient_name_first: "Billy",
          patient_name_last: "Bob",
          patient_birth_date: new Date("2024-12-01T12:00:00Z"),
          date_created: new Date("2024-12-01T12:00:00Z"),
          report_date: new Date("2024-12-01T12:00:00Z"),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      // @ts-ignore TS2364
      const startIndex = 0;
      const itemsPerPage = 25;
      const columnName = "date_created";
      const direction = "DESC";
      const actual: EcrDisplay[] = await listEcrData(
        startIndex,
        itemsPerPage,
        columnName,
        direction,
        testDateRange,
      );
      expect(actual).toEqual([
        {
          date_created: "12/01/2024 7:00\u00A0AM\u00A0EST",
          ecrId: "12345",
          patient_date_of_birth: "12/01/2024",
          patient_first_name: "Billy",
          patient_last_name: "Bob",
          patient_report_date: "12/01/2024 12:00\u00A0AM\u00A0EST",
          reportable_conditions: [null],
          rule_summaries: [null],
          eicr_set_id: "123",
          eicr_version_number: "1",
        },
      ]);
    });

    it("should get data from the fhir_metadata table", async () => {
      // @ts-ignore TS2364
      const startIndex = 0;
      const itemsPerPage = 25;
      const columnName = "date_created";
      const direction = "DESC";
      const actual: EcrDisplay[] = await listEcrData(
        startIndex,
        itemsPerPage,
        columnName,
        direction,
        testDateRange,
      );
      expect(actual).toEqual([
        {
          date_created: "12/01/2024 7:00\u00A0AM\u00A0EST",
          ecrId: "12345",
          patient_date_of_birth: "12/01/2024",
          patient_first_name: "Billy",
          patient_last_name: "Bob",
          patient_report_date: "12/01/2024 12:00\u00A0AM\u00A0EST",
          reportable_conditions: [null],
          rule_summaries: [null],
          eicr_set_id: "123",
          eicr_version_number: "1",
        },
      ]);
    });
  });

  describe("listEcrDataService with SQL Server", () => {
    beforeAll(async () => {
      process.env.METADATA_DATABASE_TYPE = "postgres";
      process.env.METADATA_DATABASE_SCHEMA = "core";
      await buildCoreAlias();
    });

    afterAll(async () => {
      delete process.env.METADATA_DATABASE_TYPE;
      await dropCoreAlias();
    });
    beforeEach(() => {
      process.env.METADATA_DATABASE_TYPE = "sqlserver";
    });
    afterAll(() => {
      process.env.METADATA_DATABASE_TYPE = "postgres";
    });

    describe("listExtendedEcrData", () => {
      it("should return data when found", async () => {
        // Arrange
        const insert = await (db as any)
          .insertInto("ecr_viewer.ecr_data")
          .values({
            eicr_id: "12345",
            set_id: "123",
            data_source: "DB",
            fhir_reference_link: "",
            eicr_version_number: "1",
            patient_name_first: "Billy",
            patient_name_last: "Bob",
            patient_birth_date: new Date("2024-12-01T12:00:00Z"),
            date_created: new Date("2024-12-01T12:00:00Z"),
            report_date: new Date("2024-12-01T12:00:00Z"),
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        const mockRecordset = [
          {
            eICR_ID: "123",
            first_name: "John",
            last_name: "Doe",
            birth_date: new Date("1990-01-01"),
            encounter_start_date: new Date("2023-01-01T07:30:00Z"),
            date_created: new Date("2023-01-02T07:45:00Z"),
            conditions: "Condition1,Condition2",
            rule_summaries: "Rule1,Rule2",
            set_id: "123",
            eicr_version_number: "1",
          },
          {
            eICR_ID: "124",
            first_name: "Jane",
            last_name: "Doe",
            birth_date: new Date("1990-01-02"),
            encounter_start_date: new Date("2023-01-02T07:30:00Z"),
            date_created: new Date("2023-01-01T07:45:00Z"),
            conditions: "Condition1,Condition2",
            rule_summaries: "Rule1,Rule2",
          },
        ];

        // Act
        const result = await listEcrData(
          0,
          10,
          "report_date",
          "DESC",
          testDateRange,
        );

        // Assert
        expect(result).toEqual([
          {
            ecrId: "12345",
            patient_first_name: "Billy",
            patient_last_name: "Bob",
            patient_date_of_birth: "12/01/2024",
            reportable_conditions: [null],
            rule_summaries: [null],
            date_created: "12/01/2024 7:00\u00A0AM\u00A0EST",
            patient_report_date: "12/01/2024 12:00\u00A0AM\u00A0EST",
            eicr_set_id: "123",
            eicr_version_number: "1",
          },
        ]);
      });
    });

    describe("getTotalEcrCount with SQL Server", () => {
      it("should return count when DATABASE_TYPE is sqlserver", async () => {
        // Act
        const count = await getTotalEcrCount(testDateRange);

        // Assert
        expect(count).toEqual("1");
      });
    });
  });

  describe("get total ecr count", () => {
    beforeAll(async () => {
      process.env.METADATA_DATABASE_TYPE = "postgres";
      await buildCoreAlias();
    });
    afterAll(async () => {
      delete process.env.METADATA_DATABASE_TYPE;
      await dropCoreAlias();
    });

    it("should call db to get all ecrs", async () => {
      const actual = await getTotalEcrCount(testDateRange);
      expect(actual).toEqual("0");
    });
    it("should use search term in count query", async () => {
      // @ts-ignore TS2364
      const actual = await getTotalEcrCount(testDateRange, "blah", undefined);
      expect(actual).toEqual("0");
    });
    it("should escape the search term in count query", async () => {
      // @ts-ignore TS2364
      const actual = await getTotalEcrCount(
        testDateRange,
        "O'Riley",
        undefined,
      );
      expect(actual).toEqual("0");
    });
    it("should use filter conditions in count query", async () => {
      // @ts-ignore TS2364
      const actual = await getTotalEcrCount(testDateRange, "", [
        "Anthrax (disorder)",
      ]);
      expect(actual).toEqual("0");
    });
  });

  describe("generate search statement", () => {
    it("should use the search term in the search statement", () => {
      expect(generateSearchStatement("Dan")).toEqual(
        "ed.patient_name_first ILIKE '%Dan%' OR ed.patient_name_last ILIKE '%Dan%'",
      );
    });
    it("should escape characters when an apostrophe is added", () => {
      expect(generateSearchStatement("O'Riley")).toEqual(
        "ed.patient_name_first ILIKE '%O''Riley%' OR ed.patient_name_last ILIKE '%O''Riley%'",
      );
    });
    it("should only generate true statements when no search is provided", () => {
      expect(generateSearchStatement("")).toEqual(
        "NULL IS NULL OR NULL IS NULL",
      );
    });
  });

  describe("generate filter conditions statement", () => {
    it("should add conditions in the filter statement", () => {
      expect(generateFilterConditionsStatement(["Anthrax (disorder)"])).toEqual(
        "ed.eICR_ID IN (SELECT DISTINCT ed_sub.eICR_ID FROM ecr_viewer.ecr_data ed_sub LEFT JOIN ecr_viewer.ecr_rr_conditions erc_sub ON ed_sub.eICR_ID = erc_sub.eICR_ID WHERE erc_sub.condition IS NOT NULL AND (erc_sub.condition ILIKE '%Anthrax (disorder)%'))",
      );
    });
    it("should only look for eCRs with no conditions when de-selecting all conditions on filter", () => {
      expect(generateFilterConditionsStatement([""])).toEqual(
        "ed.eICR_ID NOT IN (SELECT DISTINCT erc_sub.eICR_ID FROM ecr_viewer.ecr_rr_conditions erc_sub WHERE erc_sub.condition IS NOT NULL)",
      );
    });
    it("should add date range in the filter statement", () => {
      expect(generateFilterDateStatementPostgres(testDateRange)).toEqual(
        "ed.date_created >= '2024-12-01T00:00:00.000-05:00' AND ed.date_created <= '2024-12-02T00:00:00.000-05:00'",
      );
    });
    it("should display all conditions in date range by default if no filter has been added", () => {
      expect(generateCoreWhereStatement(testDateRange, "", undefined)).toEqual(
        "(NULL IS NULL OR NULL IS NULL) AND (ed.date_created >= '2024-12-01T00:00:00.000-05:00' AND ed.date_created <= '2024-12-02T00:00:00.000-05:00') AND (NULL IS NULL)",
      );
    });
  });

  describe("generate where statement", () => {
    it("should generate where statement using search and filter statements", () => {
      expect(
        generateCoreWhereStatement(testDateRange, "blah", [
          "Anthrax (disorder)",
        ]),
      ).toEqual(
        "(ed.patient_name_first ILIKE '%blah%' OR ed.patient_name_last ILIKE '%blah%') AND (ed.date_created >= '2024-12-01T00:00:00.000-05:00' AND ed.date_created <= '2024-12-02T00:00:00.000-05:00') AND (ed.eICR_ID IN (SELECT DISTINCT ed_sub.eICR_ID FROM ecr_viewer.ecr_data ed_sub LEFT JOIN ecr_viewer.ecr_rr_conditions erc_sub ON ed_sub.eICR_ID = erc_sub.eICR_ID WHERE erc_sub.condition IS NOT NULL AND (erc_sub.condition ILIKE '%Anthrax (disorder)%')))",
      );
    });
    it("should generate where statement using search statement (no conditions filter provided)", () => {
      expect(
        generateCoreWhereStatement(testDateRange, "blah", undefined),
      ).toEqual(
        "(ed.patient_name_first ILIKE '%blah%' OR ed.patient_name_last ILIKE '%blah%') AND (ed.date_created >= '2024-12-01T00:00:00.000-05:00' AND ed.date_created <= '2024-12-02T00:00:00.000-05:00') AND (NULL IS NULL)",
      );
    });
    it("should generate where statement using filter conditions statement (no search provided)", () => {
      expect(
        generateCoreWhereStatement(testDateRange, "", ["Anthrax (disorder)"]),
      ).toEqual(
        "(NULL IS NULL OR NULL IS NULL) AND (ed.date_created >= '2024-12-01T00:00:00.000-05:00' AND ed.date_created <= '2024-12-02T00:00:00.000-05:00') AND (ed.eICR_ID IN (SELECT DISTINCT ed_sub.eICR_ID FROM ecr_viewer.ecr_data ed_sub LEFT JOIN ecr_viewer.ecr_rr_conditions erc_sub ON ed_sub.eICR_ID = erc_sub.eICR_ID WHERE erc_sub.condition IS NOT NULL AND (erc_sub.condition ILIKE '%Anthrax (disorder)%')))",
      );
    });
  });
});
