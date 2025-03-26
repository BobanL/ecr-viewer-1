# eCR Viewer Guide

## General Background

## Environment Configuration Support
### Non Integrated

### Integrated

Integrated configuration is used for 
## Inserting data

### From Rhapsody

Data can be added to the eCR Viewer as a step in Rhapsody.

```
Placeholder script
```

### From API

Data can be added directly via API requeset to eCR Viewer's /process-zip endpoint.

```
curl --location '{URL}/ecr-viewer/api/process-zip' \
--form 'upload_file=@"/path/to/eicr.zip";type=application/zip'
```

## Additional Startup

Database setup and updates are handled at app startup by [Kysely](https://kysely.dev/docs/migrations).

## Environment Variables


### Retired Environment Variables

Variables that were previously used

| Name                            | Description                                                        | Version Removed | Date Removed |

