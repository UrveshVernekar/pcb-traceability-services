var mysql = require('mysql');
require('dotenv').config();

var pool = mysql.createPool({
    connectionLimit: 10,
    multipleStatements: true,
    dateStrings: true,
    host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASS_LOCAL,
});

module.exports = pool;
