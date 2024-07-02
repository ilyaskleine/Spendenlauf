require ('dotenv').config()

const mysql = require('mysql2')

const pool = mysql.createConnection({
    connectionLimit: 10,
    host: process.env.MYSQL,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    socketPath: '/var/run/mysqld/mysqld.sock'
});

// -------- RUNNERS --------

function getRunnersOfJahrgang(jahrgang_id, callback) {
    pool.query("SELECT * FROM laeufer WHERE jahrgang_id = " + pool.escape(jahrgang_id) + ";", callback)
}

function getAllRunners(callback) {
    pool.query("SELECT * FROM laeufer;", callback)
}

function getJahrgaenge(callback) {
    var jahrgaenge = []

    pool.query("SELECT * FROM jahrgang;", function (err, results) {
        if (err) return callback(err, null)
        for (var jahrgang of results) {
            jahrgang.runners = []
            jahrgaenge.push(jahrgang)
        }
        getAllRunners((runners_err, runners) => {
            if (runners_err) return callback(err, null)
            for (var runner of runners) {
                for (var jahrgang of jahrgaenge) { 
                  if(jahrgang.id == runner.jahrgang_id) {
                    jahrgang.runners.push(runner);
                  }
                }
            }
            callback(null, jahrgaenge)     
        })
    })
    
    // callback(null, [{id: 1, name: "5. Klasse", total: 0, runners: ["Alex Meier"]}, {id: 2, name: "6. Klasse", total: 0, runners: ["Lena Fuchs", "Tom Steiger"]}])
}

function createRunner(number, name, per_round, jahrgang_id, callback) {
    if (!per_round) per_round = 0
    validateRunnerID(number, idIsValid => {
        if (idIsValid) {
            pool.query("INSERT INTO laeufer (number, name, per_round, jahrgang_id, class) VALUES (" 
                    + pool.escape(number) + ", " 
                    + pool.escape(name) + ", " 
                    + pool.escape(per_round) + ", " 
                    + pool.escape(jahrgang_id) + ", '11a');", (err, results) => {
                        callback(err)
                    })
        } else {
            callback('Läufer-ID bereits belegt.')
        }
    })
}

function deleteRunner(number, callback) {
    pool.query("DELETE FROM laeufer WHERE number = " + pool.escape(number) + ";", (err, results) => {
        if (err) return callback(err);
        calcAll(callback);
    })
}

function addRound(runner_number, callback) {
    pool.query("UPDATE laeufer SET rounds = rounds + 1, amount_raised = rounds * per_round WHERE number = " 
    + pool.escape(runner_number) + ";", (err, results) => {
        if (err) return callback(err);
        calcAll(callback)
    })
}

function removeRound(runner_number, callback) {
    pool.query("UPDATE laeufer SET rounds = rounds - 1, amount_raised = rounds * per_round WHERE number = " 
    + pool.escape(runner_number) + ";", (err, results) => {
        if (err) return callback(err);
        calcAll(callback)
    })
}


function getTotal(callback) {
    pool.query("SELECT amount_raised as raised FROM spendenlauf WHERE id = " + pool.escape(process.env.SPENDENLAUF_ID) + ";", (err, results)  => {
        if (err) return callback(err, null);
        callback(null, results[0].raised);
    })
}

// -------- [NOT_EXP] CALCULATIONS --------

function calcJahrgaenge(callback) {
    pool.query("UPDATE jahrgang SET jahrgang.amount_raised = (SELECT SUM(laeufer.amount_raised) FROM laeufer WHERE laeufer.jahrgang_id = jahrgang.id);", (err, results) =>{
        callback(err)
    })
}

function calcTotal(callback) {
    pool.query("UPDATE spendenlauf SET spendenlauf.amount_raised = (SELECT SUM(jahrgang.amount_raised) FROM jahrgang WHERE spendenlauf_id = spendenlauf.id);", (err, results) =>{
        callback(err)
    })
}

function calcAll(callback) {
    calcJahrgaenge(err => {
        if (err) return callback(err);
        calcTotal(totalErr => {
            callback(totalErr)
        })
    })
}

// -------- CHECKS --------
// Check if ID for runner is avaible
function validateRunnerID(id, callback) {
    // Implement check
    callback(true)
}


// -------- TOKEN --------
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

function removeToken(token, callback) {
    pool.query("DELETE FROM token WHERE value = " + pool.escape(token) + ";", (err, results) => {
        callback(err)
    })
}

module.exports = {
    getJahrgaenge: getJahrgaenge,
    
    createRunner: createRunner,
    deleteRunner: deleteRunner,

    addRound: addRound,
    removeRound: removeRound,

    getTotal: getTotal,

    saveToken: saveToken,
    checkToken: checkToken,
    removeToken: removeToken
}
