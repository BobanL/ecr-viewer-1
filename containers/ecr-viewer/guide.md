---
title: Setup Guide
group: Documents
category: Guides
---

# eCR Viewer Setup Guide

## General Background

## Environment Variable Setup

### Base Required

These variables are required for all deployments. If variables are not set, this may cause issues running the app.
{@includeCode ./environment.d.ts#required}

In addition, an storage container for the eCRs must be created. Certain values may need to be set depending on the storage provider used.
{@includeCode ./environment.d.ts#aws}
{@includeCode ./environment.d.ts#azure}
{@includeCode ./environment.d.ts#gcp}

#### Config Name

`CONFIG_NAME` determines the features, the cloud environment, and type of database. It will follow the format of `Cloud_Db_FeatureSet`. The full list of values can be found {@link NodeJS.ProcessEnv.CONFIG_NAME}

| Feature Set    | Features Available | Metadata Support | Authentication Supported                      |
| -------------- | ------------------ | ---------------- | --------------------------------------------- |
| INTEGRATED     | Viewer             | None             | NBS                                           |
| NON_INTEGRATED | Viewer, Library    | SQLSERVER or PG  | External authentication provider              |
| DUAL           | Viewer, Library    | SQLSERVER or PG  | Both NBS and external authentication provider |

### Authentication Setup

Some form of authentication will be required on the application.

#### Integrated Authentication

Integrated eCR Viewer will rely on NBS to authenticate the user.
{@includeCode ./environment.d.ts#auth_nbs}

#### Non Integrated Authentication

Non-Integrated will relies on an external authentication provider (like azure ad, entra, or keycloak).
{@includeCode ./environment.d.ts#auth}

#### Dual Authentication

Dual allows both NBS and external authentication provider. All environment from above will be required
{@includeCode ./environment.d.ts#auth_nbs}
{@includeCode ./environment.d.ts#auth}

### Metadata - eCR Library

If using either `NON_INTEGRATED` or `DUAL`, metadata db environments will be required.
{@includeCode ./environment.d.ts#metadata}

### Removed Environment Variables

In order to maintain a history, these are variables that have been retired and no longer have a use in the app.

| Name | Description | Version Removed | Date Removed |
| ---- | ----------- | --------------- | ------------ |
|      |             |                 |              |

## Inserting data

### From Rhapsody

Data can be added to the eCR Viewer as a step in Rhapsody.

```js
Placeholder script
```

### From API

Data can be added directly via API requeset to eCR Viewer's /process-zip endpoint.

```bash
curl --location '{URL}/ecr-viewer/api/process-zip' \
--form 'upload_file=@"/path/to/eicr.zip";type=application/zip'
```

## Database Setup

Database setup, migration, and updates are handled at app startup by [Kysely](https://kysely.dev/docs/migrations). There is no need to run any other scripts manually.
