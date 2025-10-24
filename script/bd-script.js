#!/usr/bin/env node
/*
  Script: create-db.js
  Ensures the database configured via env (DB_NAME or DB_DATABASE) exists.
  Usage: node scripts/create-db.js
*/
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user =
    process.env.DB_USER ||
    process.env.DB_USERNAME ||
    process.env.DB_USER_NAME ||
    'root';
  // support multiple common env names for password
  const password =
    process.env.DB_PASSWORD ||
    process.env.DB_PASS ||
    process.env.DB_PASSWD ||
    '';
  const db =
    process.env.DB_NAME ||
    process.env.DB_DATABASE ||
    process.env.DB_DB ||
    'ps_carrito';

  console.log(`Ensuring database '${db}' exists on ${host}:${port} as ${user}`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    console.log(`Database '${db}' is present or was created.`);
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error('Failed to ensure database exists:', err.message || err);
  process.exit(1);
});
