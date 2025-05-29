const sql = require("mssql");
require("dotenv").config();

const config = {
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
server: process.env.DB_SERVER,
database: process.env.DB_DATABASE,
port: parseInt(process.env.DB_PORT),
options: {
encrypt: false, // set true if using Azure
trustServerCertificate: true,
},
};

const pool = new sql.ConnectionPool(config);

module.exports = pool;