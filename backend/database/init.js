import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Utworzenie __dirname dla ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: "./.env" });

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
