// db/db.js
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {envGet} from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema', 'schema.sql');

 async function initDB() {
  try {
    const db = await mysql.createConnection({
      host: envGet('DB_HOST'),
      user: envGet('DB_USER'),
      password: envGet('DB_PASSWORD'),
      database: envGet('DB_NAME'),
      multipleStatements: true 
    });

    console.log('✅ Connected to MySQL');

    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    await db.query(schemaSql);
    console.log('✅ Schema applied');

    return db; 
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
}

export default await initDB()
