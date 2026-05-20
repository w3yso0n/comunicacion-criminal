import sql from "mssql";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function getConfig(): sql.config {
  const host = process.env.TW_DB_HOST ?? "127.0.0.1";
  const port = envInt("TW_DB_PORT", 14330);
  const user = process.env.TW_DB_USERNAME;
  const password = process.env.TW_DB_PASSWORD;
  const database = process.env.TW_DB_DATABASE ?? "CUANTIVA";

  if (!user || !password) {
    throw new Error(
      "Faltan TW_DB_USERNAME o TW_DB_PASSWORD en las variables de entorno.",
    );
  }

  return {
    server: host,
    port,
    user,
    password,
    database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    requestTimeout: envInt("TW_DB_REQUEST_TIMEOUT", 30_000),
    connectionTimeout: 15_000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
  };
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    const config = getConfig();
    poolPromise = new sql.ConnectionPool(config).connect().catch((err) => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

export { sql };
