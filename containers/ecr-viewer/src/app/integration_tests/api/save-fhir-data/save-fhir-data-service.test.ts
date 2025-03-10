import { saveCoreMetadata, saveExtendedMetadata } from '@/app/api/save-fhir-data/save-fhir-data-service';
import { createTestDatabase, teardownDatabase } from './_setup';
import { Kysely } from 'kysely';

jest.mock('@/app/data/db/base', () => ({
  db: globalThis.testDb,
}));

let db: Kysely<any>;

beforeAll(async () => {
  db = await createTestDatabase();
  globalThis.testDb = db;
});

afterAll(async () => await teardownDatabase(db));

describe('saveExtendedMetadata Integration', () => {
  afterEach(async () => {
    await db.deleteFrom('ecr_viewer.ecr_data').execute();
    await db.deleteFrom('ecr_viewer.patient_address').execute();
    await db.deleteFrom('ecr_viewer.ecr_labs').execute();
    await db.deleteFrom('ecr_viewer.ecr_rr_conditions').execute();
    await db.deleteFrom('ecr_viewer.ecr_rr_rule_summaries').execute();
  });

  it('saves extended metadata correctly', async () => {
    const metadata = {
      eicr_set_id: 'set1',
      last_name: 'Doe',
      first_name: 'John',
      patient_addresses: [{ use: 'home', line: '123 Main St' }],
      labs: [{ uuid: 'lab1', test_type: 'COVID' }],
      rr: [{ condition: 'Flu', rule_summaries: [{ summary: 'Rule1' }] }],
    };
    const result = await saveExtendedMetadata(metadata, 'ecr1');

    expect(result).toEqual({ status: 200, message: 'Success. Saved metadata to database.' });

    const ecrData = await db.selectFrom('ecr_viewer.ecr_data').selectAll().where('eICR_ID', '=', 'ecr1').executeTakeFirst();
    expect(ecrData).toMatchObject({ set_id: 'set1', last_name: 'Doe', first_name: 'John' });

    const addresses = await db.selectFrom('ecr_viewer.patient_address').selectAll().where('eICR_ID', '=', 'ecr1').execute();
    expect(addresses).toHaveLength(1);
    expect(addresses[0]).toMatchObject({ use: 'home', line: '123 Main St' });

    const labs = await db.selectFrom('ecr_viewer.ecr_labs').selectAll().where('eICR_ID', '=', 'ecr1').execute();
    expect(labs).toHaveLength(1);
    expect(labs[0]).toMatchObject({ test_type: 'COVID' });

    const conditions = await db.selectFrom('ecr_viewer.ecr_rr_conditions').selectAll().where('eICR_ID', '=', 'ecr1').execute();
    expect(conditions).toHaveLength(1);
    expect(conditions[0]).toMatchObject({ condition: 'Flu' });

    const summaries = await db
      .selectFrom('ecr_viewer.ecr_rr_rule_summaries')
      .selectAll()
      .where('ecr_rr_conditions_id', '=', conditions[0].uuid)
      .execute();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ rule_summary: 'Rule1' });
  });
});

describe('saveCoreMetadata Integration', () => {
  afterEach(async () => {
    await db.deleteFrom('ecr_viewer.ecr_data').execute();
    await db.deleteFrom('ecr_viewer.ecr_rr_conditions').execute();
    await db.deleteFrom('ecr_viewer.ecr_rr_rule_summaries').execute();
  });

  it('saves core metadata correctly', async () => {
    const metadata = {
      eicr_set_id: 'set1',
      last_name: 'Doe',
      first_name: 'John',
      birth_date: '1990-01-01',
      report_date: '2023-01-01',
      rr: [{ condition: 'Flu', rule_summaries: [{ summary: 'Rule1' }] }],
    };
    const result = await saveCoreMetadata(metadata, 'ecr1');

    expect(result).toEqual({ status: 200, message: 'Success. Saved metadata to database.' });

    const ecrData = await db.selectFrom('ecr_viewer.ecr_data').selectAll().where('eICR_ID', '=', 'ecr1').executeTakeFirst();
    expect(ecrData).toMatchObject({
      set_id: 'set1',
      patient_name_last: 'Doe',
      patient_name_first: 'John',
      birth_date: expect.anything(),
      report_date: expect.anything(),
    });

    const conditions = await db.selectFrom('ecr_viewer.ecr_rr_conditions').selectAll().where('eICR_ID', '=', 'ecr1').execute();
    expect(conditions).toHaveLength(1);
    expect(conditions[0]).toMatchObject({ condition: 'Flu' });

    const summaries = await db
      .selectFrom('ecr_viewer.ecr_rr_rule_summaries')
      .selectAll()
      .where('ecr_rr_conditions_id', '=', conditions[0].uuid)
      .execute();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ rule_summary: 'Rule1' });
  });
});
