export type BaseConnectionConfig = {
    host?: string;
    database?: string;
    user?: string;
    password?: string;
    port?: number;
  };
  
  export type MssqlConnectionConfig = BaseConnectionConfig & {
    dialect: 'mssql';
    trustServerCertificate?: boolean;
    connectTimeout?: number;
    tarnMin?: number;
    tarnMax?: number;
  };
  
  export type PostgresConnectionConfig = BaseConnectionConfig & {
    dialect: 'postgres';
    maxThreadPool?: number;
  };
  
  export type ConnectionConfig = MssqlConnectionConfig | PostgresConnectionConfig;
  
  export type SupportedDialects = 'mssql' | 'postgres';
