/* eslint-disable unused-imports/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    /**
     * The version of the eCR Viewer. This value is set at build time
     * @ignore
     */
    readonly APP_VERSION: string;
    /**
     * The application/client id used to idenitfy the client
     */
    AUTH_CLIENT_ID?: string;
    /**
     * The client secret that comes from the authentication provider.
     */
    AUTH_CLIENT_SECRET?: string;
    /**
     * Additional information used during authentication process. For Azure AD, this will be the 'Tenant Id'. For Keycloak, this will be the url issuer including the realm.
     * @example Keycloak
     * https://my-keycloak-domain.com/realms/My_Realm
     * @example Azure
     * 4a62fd3e-be14-443f-b51d-a9facca4a0eb
     */
    AUTH_ISSUER?: string;
    /**
     * The authentication provider when running NON_INTEGRATED. Either keycloak or ad.
     */
    AUTH_PROVIDER?: "keycloak" | "ad";
    /**
     * AWS access key ID for accessing AWS services
     */
    AWS_ACCESS_KEY_ID?: string;
    /**
     * Custom endpoint URL for AWS services. This is used for local development only.
     * @ignore
     */
    AWS_CUSTOM_ENDPOINT?: string;
    /**
     * AWS region where resources are located
     */
    AWS_REGION?: string;
    /**
     * AWS secret access key for accessing AWS services
     */
    AWS_SECRET_ACCESS_KEY?: string;
    /**
     * Azure Blob Storage container name where eCR documents are stored
     * @deprecated Use ECR_BUCKET_NAME instead
     */
    AZURE_CONTAINER_NAME?: string;
    /**
     * Connection string for Azure Storage account
     */
    AZURE_STORAGE_CONNECTION_STRING?: string;
    /**
     * Base path for the eCR Viewer
     * @example /ecr-viewer
     */
    BASE_PATH: string;
    /**
     * Configuration name that determines the type of authentication used, metadata database, and eCR document storage type.
     */
    CONFIG_NAME:
      | "AWS_INTEGRATED"
      | "AWS_PG_NON_INTEGRATED"
      | "AWS_SQLSERVER_NON_INTEGRATED"
      | "AZURE_INTEGRATED"
      | "AZURE_PG_NON_INTEGRATED"
      | "AZURE_SQLSERVER_NON_INTEGRATED"
      | "GCP_INTEGRATED"
      | "GCP_PG_NON_INTEGRATED"
      | "GCP_SQLSERVER_NON_INTEGRATED";
    /**
     * Type of metadata database being used. This value is set by CONFIG_NAME.
     * @ignore
     */
    DATABASE_TYPE: string;
    /**
     * Connection URL for the database.
     */
    DATABASE_URL: string;
    /**
     * Cipher key for database encryption if different then the default.
     */
    DB_CIPHER?: string;
    /**
     * Name of the Container storage where eCR documents are stored.
     */
    ECR_BUCKET_NAME: string;
    GCP_CREDENTIALS?: string;
    GCP_PROJECT_ID?: string;
    GCP_API_ENDPOINT?: string;
    /**
     * Database schema to use for metadata storage. Core has a small subset of Extended. This value is set by CONFIG_NAME.
     * @ignore
     */
    METADATA_DATABASE_SCHEMA?: "core" | "extended";
    /**
     * Database type for metadata storage. This value is set by CONFIG_NAME.
     * @ignore
     */
    METADATA_DATABASE_TYPE?: "postgres" | "sqlserver";
    /**
     * Flag indicating whether authentication via NBS enabled. This value is set by CONFIG_NAME.
     * @ignore
     */
    NBS_AUTH: "true" | "false";
    /**
     * Public key for NBS authentication.
     */
    NBS_PUB_KEY: string;
    /**
     * Flag indicating whether this is a non-integrated viewer instance (client-side accessible). This value is set by CONFIG_NAME.
     */
    NEXT_PUBLIC_NON_INTEGRATED_VIEWER: "true" | "false";
    /**
     * Next.js runtime environment.
     * @ignore
     */
    NEXT_RUNTIME: string;
    /**
     * Secret key used for NextAuth.js sessions.
     */
    NEXTAUTH_SECRET: string;
    /**
     * Flag indicating whether this is a non-integrated viewer instance. This value is set by CONFIG_NAME.
     * @ignore
     */
    NON_INTEGRATED_VIEWER: "true" | "false";
    /**
     * The full URL that the orchestration URL is available at
     */
    ORCHESTRATION_URL: string;
    /**
     * Determines the cloud storage provider used for eCR document storage. This value is set by CONFIG_NAME.
     * @ignore
     */
    SOURCE: "s3" | "azure" | "gcp";
    /**
     * Hostname for SQL Server database.
     * @deprecated use DATABASE_URL
     */
    SQL_SERVER_HOST: string;
    /**
     * Password for SQL Server authentication.
     * @deprecated use DATABASE_URL
     */
    SQL_SERVER_PASSWORD: string;
    /**
     * Username for SQL Server authentication.
     * @deprecated use DATABASE_URL
     */
    SQL_SERVER_USER: string;
  }
}
