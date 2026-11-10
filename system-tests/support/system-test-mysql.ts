import * as mysql from 'mysql2/promise';

export async function resetProjectManagersForSystemTest(): Promise<void> {
  const conn = await mysql.createConnection({
    host: process.env.SYSTEM_TEST_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.SYSTEM_TEST_DB_PORT ?? 13308),
    user: process.env.SYSTEM_TEST_DB_USERNAME ?? 'root',
    password: process.env.SYSTEM_TEST_DB_PASSWORD ?? 'mofi_test_root',
    database: process.env.SYSTEM_TEST_DB_NAME ?? 'mofi_platform_test',
    // MySQL 8 from kind NodePort without TLS
    ssl: undefined,
  });
  try {
    await conn.query(
      `DELETE FROM users WHERE JSON_CONTAINS(roles, '"project_manager"')`,
    );
  } finally {
    await conn.end();
  }
}
