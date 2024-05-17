const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000

var db = require('./js/database')
var auth = require('./js/authentication');
const { nextTick } = require('process');

app.use(cookieParser());
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/users', (req, res) => {
  db.getAllRunners((err, results) => {
    if (err) {
      res.status(404).json({ message: err})
    }
    else {
      console.log(results)
      res.json({results})
    }

  })
})

app.get('/login/:pwd', (req, res) => {
  auth.adminLogin(req.params.pwd, (err, token) => {
    if (err) {
      res.status(401).json({message: err})
    } else {
      res.cookie('token', token)
      res.json({token: token})
    }
  })
})

app.use('/admin', (req, res, next) => {
  if (req.cookies.token) {
    auth.authenticate(req.cookies.token, (err, granted) => {
      if (err) {
        res.json({error: err})
      } else if (granted) {
        return next()
      } else {
        res.status(401).send("Kein Zutritt!")
      }
    })
  } else {
    res.redirect("/login/test")
  }
})

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin.html'));
})

app.get('/admin/test', (req, res) => {
  res.send("Testbereich")
})

app.listen(port, () => {
  console.log('Spendenlauf-Tool listening on port ' + port)
})
