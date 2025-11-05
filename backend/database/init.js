const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

async function initDatabase() {
  try {
    // Połączenie bez wyboru bazy (żeby móc ją stworzyć)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    console.log("📦 Połączono z MySQL");

    // Wczytaj i wykonaj schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");
    await connection.query(schema);
    console.log("✅ Struktura bazy danych utworzona");

    await connection.end();
    console.log("🎉 Inicjalizacja bazy zakończona!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Błąd inicjalizacji bazy:", error);
    process.exit(1);
  }
}

initDatabase();
