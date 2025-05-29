const express = require("express");
const cors = require("cors"); // ✅ Require cors at the top
const { sql, poolConnect, pool } = require("./db");
require("dotenv").config();

const app = express(); // ✅ Declare app first

app.use(cors()); // ✅ THEN use cors
app.use(express.json());

// 🟢 GET all tenants
app.get("/tenants", async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query("SELECT * FROM Tenants");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error fetching tenants: " + err.message);
  }
});

app.get("/tenants/search", async (req, res) => {
  const { name, cnic } = req.query;

  if (!name && !cnic) {
    return res
      .status(400)
      .send("Please provide a search parameter: name or cnic");
  }

  try {
    await poolConnect;

    let query = "SELECT * FROM tenants WHERE 1=1";
    const request = pool.request();

    if (name) {
      query += " AND Name LIKE @name";
      request.input("name", sql.VarChar, `%${name}%`);
    }
    if (cnic) {
      query += " AND CNIC = @cnic";
      request.input("cnic", sql.VarChar, cnic);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 2. Get by ID route next
app.get("/tenants/:id", async (req, res) => {
  const tenantId = parseInt(req.params.id, 10);
  if (isNaN(tenantId)) return res.status(400).send("Invalid tenant ID");

  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("id", sql.Int, tenantId)
      .query("SELECT * FROM tenants WHERE Tenantid = @id");

    if (result.recordset.length === 0) {
      return res.status(404).send("Tenant not found");
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
