const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@postgres:5432/postgres"
});

app.get("/api", async (req, res) => {
  try {
    const r = await pool.query("SELECT now() as now");
    res.json({ message: "Hello from Node", time: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Backend running on ${port}`));
