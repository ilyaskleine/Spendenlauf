require ('dotenv').config()

const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    socketPath: '/var/run/mysqld/mysqld.sock'
});

function getAllRunners(callback) {
    pool.query("SELECT * FROM laeufer;", function (err, results) {
        if (err) return callback(err, null)
        callback(err, results)
    })
}

function saveToken(token, callback) {
    pool.query("INSERT INTO token (value) VALUES (" + pool.escape(token) + ");", (err, results) => {
        callback(err)
    })
}

function checkToken(token, callback) {
    pool.query("SELECT * FROM token WHERE value = " + pool.escape(token) + ";", (err, results) => {
        callback(err, results.length > 0)
    })
}

module.exports = {
    getAllRunners: getAllRunners,
    saveToken: saveToken,
    checkToken: checkToken
}