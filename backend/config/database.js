import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Konfiguracja pod chmurę (Render/TiDB/Aiven) często wymaga SSL
// Sprawdzamy zmienną środowiskową DB_SSL lub port 4000 (typowy dla TiDB)
const useSSL = process.env.DB_SSL === "true" || process.env.DB_PORT == 4000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Dodanie obsługi SSL dla zewnętrznych baz danych
  ssl: useSSL
    ? {
        rejectUnauthorized: true, // Dla TiDB zazwyczaj true, dla Heroku/starych baz false
        minVersion: "TLSv1.2",
      }
    : undefined,
};

const pool = mysql.createPool(dbConfig);

// Prosty test połączenia przy starcie aplikacji
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Błąd połączenia z bazą danych:", err.message);
  } else {
    console.log("✅ Połączono z bazą danych MySQL!");
    connection.release();
  }
});

export default pool.promise();
