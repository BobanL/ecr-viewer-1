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
View the full list of required variables under {@link EnvironmentVariables.BaseRequired | EnvironmentVariables > BaseRequired}.

In addition, an storage container for the eCRs must be created. Certain values may need to be set depending on the storage provider used. View the full list of available configurations under {@link EnvironmentVariables.EcrStorage | Environment Variables -> eCR Storage }

#### Base Required - Config Name

`CONFIG_NAME` determines the features, the cloud environment, and type of database. It will follow the format of `Cloud_Db_FeatureSet`

{@includeCode ./environment.d.ts#configList}

| Feature Set    | Features Available | Metadata Support | Authentication Supported                      |
| -------------- | ------------------ | ---------------- | --------------------------------------------- |
| INTEGRATED     | Viewer             | None             | NBS                                           |
| NON_INTEGRATED | Viewer, Library    | SQLSERVER or PG  | External authentication provider              |
| DUAL           | Viewer, Library    | SQLSERVER or PG  | Both NBS and external authentication provider |

### Authentication Setup

Authentication variables are required. Authentication can support either NBS and or external authentication provider (e.g. Keycloak, Azure AD). View the full list of auth related variables under {@link EnvironmentVariables.Authentication | EnvironmentVariables > Authentication}.

### Metadata - eCR Library

If using either `NON_INTEGRATED` or `DUAL`, metadata db environments will be required. {@link EnvironmentVariables.Metadata | Environment Variables -> Metadata}

### Removed Environment Variables

In order to maintain a history, these are variables that have been retired and no longer have a use in the app.

| Name | Description | Version Removed | Date Removed |
| ---- | ----------- | --------------- | ------------ |
|      |             |                 |              |

## Inserting data

### From Rhapsody

Data can be added to the eCR Viewer as a step in Rhapsody.

````

Placeholder script

```

### From API

Data can be added directly via API requeset to eCR Viewer's /process-zip endpoint.

```

curl --location '{URL}/ecr-viewer/api/process-zip' \
--form 'upload_file=@"/path/to/eicr.zip";type=application/zip'

```

## Database Setup

Database setup, migration, and updates are handled at app startup by [Kysely](https://kysely.dev/docs/migrations). There is no need to run any other scripts manually.
```
````
