import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

//membaca dan memastikan lokasi file .env
const envPath = fileURLToPath(
    new URL('../.env', import.meta.url)
);

//digunakan untuk membaca isi file .env
const env = dotenv.config({ path: envPath });

if (env.error) {
    throw env.error;
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

export default db;
