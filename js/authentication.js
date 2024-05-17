require ('dotenv').config()
var db = require('./database')

function generate_token(length) {
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function adminLogin(password, callback) {
    if (password == process.env.ADMIN_PASSWORD) {
        var token = generate_token(16);
        db.saveToken(token, err => {
            if (err) { 
                callback (err, null)
            } else {
                callback(null, token);
            }
        })
    } else {
        callback('Falsches Passwort.', null)
    }
}

function authenticate(token, callback) {
    db.checkToken(token, (err, exists) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, exists)
        }
    })
}

module.exports = {
    adminLogin: adminLogin,
    authenticate: authenticate
}