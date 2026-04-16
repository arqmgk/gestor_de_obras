import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestor_obras',
  password: 'MiHijo12_AEC!2026',
  port: 5432,
});

export default pool;
