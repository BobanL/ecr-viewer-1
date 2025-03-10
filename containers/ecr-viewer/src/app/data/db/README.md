# Kysely Persistence Layer

The Kysely-based persistence layer of the eCR viewer is designed with modularity and extensibility in mind. It leverages [Kysely](https://kysely.dev/), a type-safe SQL query builder for TypeScript, to provide a robust and portable database interaction layer.

## Philosophy

- **Prefer dynamic loading**: Schemas and dialects are loaded dynamically based on configuration, reducing hard-coded dependencies.
- **Build for extensibility**: The codebase is structured to easily accommodate new database dialects or schemas with minimal refactoring.
- **Avoid dialect-specific behaviors**: Kysely’s abstractions are used to minimize vendor-specific SQL, ensuring compatibility across database systems.

## Directory Structure

Code in this directory is divided into three main subdirectories:

- **`utils/`**: Provides tools and capabilities for database maintenance, such as health checks and migration utilities.
- **`dialects/`**: Contains vendor-specific configurations and support code for interfacing with databases. Currently supported dialects include:
  - **MS SQL Server** (`mssql`)
  - **PostgreSQL** (`postgres`)
- **`schemas/`**: Organizes persisted data and system capabilities into feature sets. It includes:
  - **`_shared/`**: Shared utilities and types used across all schemas.
  - **`core/`**: Functions and types for the "core" schema, representing the base feature set.
  - **`extended/`**: Functions and types for the "extended" schema, adding additional features.

## System Behaviors

### Migrations

Database migrations are managed using Kysely’s migration system and are stored in schema-specific directories under `schemas/<schema_name>/migrations/`.

- **Naming Convention**: Migration files use a timestamp prefix for ordering (e.g., `20230308120000_create_foos.ts`).
- **Running Migrations**: The `ensureMigrations` function in `utils/migrate.ts` automatically checks for and applies pending migrations when the application starts.

## Interacting with the Database

In most cases, use `createDatabaseFromEnvironment` from `factory.ts` to establish a database connection. This function reads the `SCHEMA` and `DIALECT` environment variables (defaulting to `'core'` and `'postgres'`, respectively) to dynamically load the appropriate schema and dialect. For more control — such as in testing — use `createDatabase` directly, specifying the schema, dialect, and connection configuration. See comments in `factory.ts` for details.

### Database-Level Utilities

- **Health Checks**: The `checkDatabaseHealth` function in `utils/health.ts` verifies database connectivity and schema integrity.
  - **Usage**: `await checkDatabaseHealth(db);`

### Business Object Persistence Utilities

Schema-specific CRUD operations are defined in `schemas/<schema_name>/index.ts`.

- **Example**: The `saveMetadata` function persists metadata for a given schema.
  - **Usage**: `await saveMetadata(metadata, ecrId);`
  - Available in both `core` and `extended` schemas, with behavior tailored to each.

## Tests

Tests are divided into two categories: unit-style and integration-style.

### Unit-Style Tests

- **Purpose**: Validate business logic without a real database, using mocks.
- **Location**: `src/app/tests/data/db/schemas/<schema_name>/`
- **Naming Convention**: Files match the function they test (e.g., `saveMetadata.test.ts`).
- **Behavior Verified**: SQL query generation, input validation, and error handling.

### Integration-Style Tests

- **Purpose**: Ensure database interactions work as expected in a live environment.
- **Location**: `src/app/tests/integration/data/db/schemas/<schema_name>/`
- **Naming Convention**: Similar to unit tests (e.g., `saveMetadata.test.ts`).
- **Matrix of Tests**: Tests are executed across all supported dialects (`mssql`, `postgres`) and schemas (`core`, `extended`) using a GitHub Actions matrix strategy.

## Developer’s Guide

### Supporting a New Dialect

To add support for a new database dialect (e.g., MySQL):

1. **Add Dialect Configuration**:
   - Create a file in `dialects/config/<dialect>.ts` (e.g., `mysql.ts`).
   - Implement a function like `createMysqlDialect` that returns a Kysely dialect instance.

2. **Update Dialect Registry**:
   - Edit `dialects/registry.ts` to add the new dialect to `SupportedDialects` and `loadDialectConfig`.

3. **Test the Dialect**:
   - Add unit and integration tests in the respective test directories.

### Expanding Existing Types

To add a new field to an existing schema (e.g., `middle_name` to the `core` schema):

1. **Update Schema Definition**:
   - Modify the TypeScript interface in `schemas/core/tables.ts` to include the new field.

2. **Write a Migration**:
   - Create a migration file in `schemas/core/migrations/` (e.g., `20230308130000_add_middle_name.ts`).
   - Use Kysely’s `alterTable` to add the column.

3. **Update Business Logic**:
   - Adjust functions like `saveMetadata` in `schemas/core/index.ts` to handle the new field.

4. **Update Tests**:
   - Modify unit and integration tests to verify the new field’s behavior.

### Adding New Types

To introduce a new schema or table (e.g., a `reporting` schema):

1. **Create a New Schema Directory**:
   - Add a directory under `schemas/` (e.g., `schemas/reporting/`).

2. **Define the Schema**:
   - Create `tables.ts` with TypeScript interfaces for the new tables.
   - Implement business logic (e.g., `saveReport`) in `index.ts`.

3. **Add Migrations**:
   - Create migration files in `schemas/reporting/migrations/` to initialize the tables (e.g., `20230308140000_create_reporting_schema.ts`).

4. **Update the Schema Registry**:
   - Edit `schemas/registry.ts` to include the new schema in `SchemaRegistry`.

5. **Update Tests**:
   - Add unit and integration tests in the corresponding test directories.
