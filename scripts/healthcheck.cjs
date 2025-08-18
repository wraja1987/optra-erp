/*
 Simple healthcheck: attempts to connect to Postgres and Redis from env.
 Prints HEALTHY on success, exits non-zero on failure.
*/
const { Client } = require('pg');
const { createClient } = require('redis');

async function checkPostgres(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query('SELECT 1');
    return true;
  } finally {
    await client.end().catch(() => {});
  }
}

async function checkRedis(url) {
  const client = createClient({ url });
  client.on('error', () => {});
  try {
    await client.connect();
    const pong = await client.ping();
    return pong === 'PONG';
  } finally {
    await client.quit().catch(() => {});
  }
}

(async () => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://app:app@localhost:5432/v5';
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const [pgOk, redisOk] = await Promise.all([
      checkPostgres(dbUrl),
      checkRedis(redisUrl)
    ]);
    if (pgOk && redisOk) {
      console.log('HEALTHY');
      process.exit(0);
    }
    console.error('UNHEALTHY');
    process.exit(1);
  } catch (e) {
    console.error('UNHEALTHY', e && e.message);
    process.exit(1);
  }
})();
