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

function getAllClasses(callback) {
    pool.query("SELECT * FROM class;", callback)
}

function getAllJahrgaenge(callback) {
    pool.query("SELECT * FROM jahrgang;", callback)
}

function getRunnerStruct(callback) {
    getAllRunners((runners_err, runners) => {
        if (runners_err) return callback(runners_err, null)
        getAllClasses((classes_err, classes) => {
            if (classes_err) return callback(classes_err, null);
            for (var classObj of classes) {
                classObj.runners = []
                for (var runner of runners) {
                    if (runner.class_id == classObj.id) {
                        classObj.runners.push(runner)
                    }
                }
            }
            getAllJahrgaenge((jahr_err, jahrgaenge) => {
                if (jahr_err) return callback(jahr_err, null)
                for (var jahrgang of jahrgaenge) {
                    jahrgang.classes = []
                    for (var classObj of classes) {
                        if (classObj.jahrgang_id == jahrgang.id) {
                            jahrgang.classes.push(classObj)
                        }
                    }
                }
                callback(null, jahrgaenge)
            })
        })   
    })
}

function createRunner(name, per_round, jahrgang_id, callback) {
    if (!per_round) per_round = 0
    const number = 0;
    validateRunnerID(number, idIsValid => {
        if (idIsValid) {
            pool.query("INSERT INTO laeufer (name, per_round, class_id) VALUES (" 
                    + pool.escape(name) + ", " 
                    + pool.escape(per_round) + ", " 
                    + pool.escape(1) + ");", (err, results) => {
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

// -------- RUNS --------
function createRun(title, jahrgang_id1, jahrgang_id2, callback) {
    pool.query("INSERT INTO run (title, jahrgang_1, jahrgang_2) VALUES (" 
        + pool.escape(title) + ", "
        + pool.escape(jahrgang_id1) + ", "
        + pool.escape(jahrgang_id2) + ");", callback)
}

function getRuns(callback) {
    pool.query("select run.title, jahrgang.name from run, runToJahrgang, jahrgang where run.id = runToJahrgang.run_id and jahrgang.id = runToJahrgang.jahrgang_id;",
    (err, results) => {
        if (err) return callback(err, null)

    }
    )
}

// -------- ROUNDS --------

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

// -------- TOTAL FOR DASHBOARD --------
function getTotal(callback) {
    createRun("Test", [1], callback);
    return
    pool.query("SELECT amount_raised as raised FROM spendenlauf WHERE id = " + pool.escape(process.env.SPENDENLAUF_ID) + ";", (err, results)  => {
        if (err) return callback(err, null);
        callback(null, results[0].raised);
    })
}

// -------- [NOT_EXP] CALCULATIONS --------

function calcClasses(callback) {
    pool.query("UPDATE class SET class.amount_raised = (SELECT SUM(laeufer.amount_raised) FROM laeufer WHERE laeufer.class_id = class.id);", (err, results) =>{
        callback(err)
    })
}

function calcJahrgaenge(callback) {
    pool.query("UPDATE jahrgang SET jahrgang.amount_raised = (SELECT SUM(class.amount_raised) FROM class WHERE class.jahrgang_id = jahrgang.id);", (err, results) =>{
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

function getNewRunnerID(callback) {
    pool.query("SELECT number FROM laeufer;", (number, err) => {
        if (err) return callback(err, null);
        // Implementation
    })
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
    getRunnerStruct: getRunnerStruct,
    
    createRunner: createRunner,
    deleteRunner: deleteRunner,

    createRun: createRun,

    addRound: addRound,
    removeRound: removeRound,

    getTotal: getTotal,

    saveToken: saveToken,
    checkToken: checkToken,
    removeToken: removeToken
}
