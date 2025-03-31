/**
 * @document guide.md
 */
/* eslint-disable unused-imports/no-unused-vars */
namespace EnvironmentVariables {
  /**
   * @categoryDescription eCR Storage - AWS
   * These variables are used to configure the storage of FHIR data.
   * @categoryDescription eCR Storage - AZURE
   * These variables are used to configure the storage of FHIR data.
   * @categoryDescription eCR Storage - GCP
   * These variables are used to configure the storage of FHIR data.
   */
  interface EcrStorage {
    /**
     * @category eCR Storage - AWS
     * @description AWS access key ID for accessing AWS services.
     */
    AWS_ACCESS_KEY_ID?: string;
    /**
     * @ignore
     * @category eCR Storage - AWS
     * @description Custom endpoint URL for AWS services. This is used for local development only.
     */
    AWS_CUSTOM_ENDPOINT?: string;
    /**
     * @category eCR Storage - AWS
     * @description AWS region where resources are located.
     */
    AWS_REGION?: string;
    /**
     * @category eCR Storage - AWS
     * @description AWS secret access key for accessing AWS services.
     */
    AWS_SECRET_ACCESS_KEY?: string;
    /**
     * @category eCR Storage - AZURE
     * @description Azure Blob Storage container name where eCR documents are stored.
     * @deprecated Since v3.1.0 - Use {@link BaseRequired.ECR_BUCKET_NAME}
     */
    AZURE_CONTAINER_NAME?: string;
    /**
     * @category eCR Storage - AZURE
     * @description Connection string for Azure Storage account. Required for Azure Blob Storage.
     */
    AZURE_STORAGE_CONNECTION_STRING?: string;
    /**
     * @category eCR Storage - GCP
     * @description Google Cloud service account credentials JSON (stringified) for GCP deployments.
     * Only required if not using Application Default Credentials.
     */
    GCP_CREDENTIALS?: string;
    /**
     * @category eCR Storage - GCP
     * @description Google Cloud project ID where resources are located.
     * Only required if not using Application Default Credentials.
     */
    GCP_PROJECT_ID?: string;
    /**
     * @ignore
     * @category eCR Storage - GCP
     * @description Custom endpoint URL for GCP services. This is used for local development only.
     */
    GCP_API_ENDPOINT?: string;
  }

  /**
   * @ignore
   */
  interface InternalUse {
    /**
     * @ignore
     * @description The version of the eCR Viewer. This value is set at build time.
     */
    readonly APP_VERSION: string;
    /**
     * @ignore
     * @description Next.js runtime environment.
     */
    readonly NEXT_RUNTIME: string;
    /**
     * @ignore
     * @description Flag indicating whether this is a non-integrated viewer instance. This value is set by CONFIG_NAME.
     */
    NON_INTEGRATED_VIEWER: "true" | "false";
    /**
     * @ignore
     * @description Determines the cloud storage provider used for eCR document storage. This value is set by CONFIG_NAME.
     */
    SOURCE: "s3" | "azure" | "gcp";
    /**
     * @ignore
     * @description Flag indicating whether this is a non-integrated viewer instance (client-side accessible). This value is set by CONFIG_NAME.
     */
    NEXT_PUBLIC_NON_INTEGRATED_VIEWER: "true" | "false";
    /**
     * @ignore
     * @description Database schema to use for metadata storage. Core has a small subset of Extended. This value is set by CONFIG_NAME.
     */
    METADATA_DATABASE_SCHEMA?: "core" | "extended";
    /**
     * @ignore
     * @description Database type for metadata storage. This value is set by CONFIG_NAME.
     */
    METADATA_DATABASE_TYPE?: "postgres" | "sqlserver";
  }

  /**
   * @categoryDescription Authentication - Standalone
   * These variables are used to configure authentication for the eCR Library & Viewer.
   * They are all required when running in `NON_INTEGRATED` or `DUAL`.
   * @categoryDescription Authentication - NBS
   * These variables are used to configure authentication for the eCR Viewer.
   * They are all required when running in `INTEGRATED` or `DUAL`.
   */
  interface Authentication {
    /**
     * @category Authentication - Standalone
     * @description Secret key used for NextAuth.js sessions.
     */
    NEXTAUTH_SECRET: string;
    /**
     * @category Authentication - NBS
     * @description Public key for NBS authentication.
     */
    NBS_PUB_KEY: string;
    /**
     * @ignore
     * @category Authentication - NBS
     * @category Override
     * @description Flag indicating whether authentication via NBS enabled. This value is set by CONFIG_NAME.
     */
    NBS_AUTH: "true" | "false";
    /**
     * @category Authentication - Standalone
     * @description The application/client id used to idenitfy the client.
     */
    AUTH_CLIENT_ID?: string;
    /**
     * @category Authentication - Standalone
     * @description The client secret that comes from the authentication provider.
     */
    AUTH_CLIENT_SECRET?: string;
    /**
     * @category Authentication - Standalone
     * @description Additional information used during authentication process. For Azure AD, this will be the 'Tenant Id'. For Keycloak, this will be the url issuer including the realm.
     * @example Keycloak
     * https://my-keycloak-domain.com/realms/My_Realm
     * @example Azure
     * 4a62fd3e-be14-443f-b51d-a9facca4a0eb
     */
    AUTH_ISSUER?: string;
    /**
     * @category Authentication - Standalone
     * @description The authentication provider used for logging in. Either keycloak or ad.
     */
    AUTH_PROVIDER?: "keycloak" | "ad";
  }

  /**
   * @categoryDescription Base Required
   * These variables are required for the app to run properly. These are required for all deployments.
   */
  interface BaseRequired {
    /**
     * @category Base Required
     * @description Base path for the eCR Viewer.
     * @example /ecr-viewer
     */
    BASE_PATH: string;
    /**
     * @category Base Required
     * @description Configuration name that determines the type of authentication used, metadata database, and eCR document storage type.
     */
    //#region configList
    CONFIG_NAME:
      | "AWS_INTEGRATED"
      | "AWS_PG_NON_INTEGRATED"
      | "AWS_SQLSERVER_NON_INTEGRATED"
      | "AWS_PG_DUAL"
      | "AWS_SQLSERVER_DUAL"
      | "AZURE_INTEGRATED"
      | "AZURE_PG_NON_INTEGRATED"
      | "AZURE_SQLSERVER_NON_INTEGRATED"
      | "AZURE_PG_DUAL"
      | "AZURE_SQLSERVER_DUAL"
      | "GCP_INTEGRATED"
      | "GCP_PG_NON_INTEGRATED"
      | "GCP_SQLSERVER_NON_INTEGRATED";
    DATABASE_TYPE: string;
    DATABASE_URL?: string;
    /**
     * @category eCR Library Metadata
     * @description Cipher key for database encryption if different then the default.
     */
    DB_CIPHER?: string;
    ECR_BUCKET_NAME: string;
    GCP_CREDENTIALS?: string;
    GCP_PROJECT_ID?: string;
    GCP_API_ENDPOINT?: string;
    METADATA_DATABASE_SCHEMA?: "core" | "extended";
    METADATA_DATABASE_TYPE?: "postgres" | "sqlserver";
    NBS_AUTH: "true" | "false";
    NBS_PUB_KEY: string;
    NEXT_PUBLIC_NON_INTEGRATED_VIEWER: "true" | "false";
    NEXT_RUNTIME: string;
    NEXTAUTH_SECRET: string;
    NON_INTEGRATED_VIEWER: "true" | "false";
    ORCHESTRATION_URL: string;
    SOURCE: "s3" | "azure" | "gcp";
    SQL_SERVER_HOST?: string;
    /**
     * @category SQL Server
     * @description Password for SQL Server authentication.
     * @deprecated Since v3.1.0 - use {@link DATABASE_URL}
     */
    SQL_SERVER_PASSWORD?: string;
    /**
     * @category SQL Server
     * @description Username for SQL Server authentication.
     * @deprecated Since v3.1.0 - use {@link DATABASE_URL}
     */
    SQL_SERVER_USER?: string;
  }
}

/**
 * @ignore
 */
/* eslint-disable unused-imports/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv
    extends EnvironmentVariables.BaseRequired,
      EnvironmentVariables.EcrStorage,
      EnvironmentVariables.Authentication,
      EnvironmentVariables.Metadata,
      EnvironmentVariables.InternalUse {}
}
