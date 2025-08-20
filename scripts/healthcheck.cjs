const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const url = process.env.DATABASE_URL || 'postgresql://v5ultra:password@127.0.0.1:5432/v5ultra';
  try {
    const client = new Client({ connectionString: url });
    await client.connect();

    const who = await client.query('SELECT current_user;');
    const roles = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'app'");
    if (!roles.rowCount) {
      console.log('UNHEALTHY role "app" does not exist');
      await client.end();
      process.exit(1);
    }

    const schemaOwner = await client.query(`
      SELECT nspname, pg_catalog.pg_get_userbyid(nspowner) AS owner
      FROM pg_namespace WHERE nspname='public'
    `);

    console.log('HEALTHY',
      `user=${who.rows[0].current_user}`,
      `db=${(new URL(url)).pathname.slice(1)}`,
      `schema_owner=${schemaOwner.rows?.[0]?.owner || 'unknown'}`
    );
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log('UNHEALTHY', err.message || String(err));
    process.exit(1);
  }
})();
