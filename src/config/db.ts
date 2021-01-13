import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  max: 20,
  connectionString,
});

export default pool;
