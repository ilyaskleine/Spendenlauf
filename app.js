const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express()
const port = 3000

var db = require('./js/database')
var auth = require('./js/authentication');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'))

// ----------- HTML Routen -----------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/index.html'))
})

app.get('/login', (req, res) => {
  if (req.cookies.token) return res.redirect('/');
  res.sendFile(path.join(__dirname, '/html/login.html'))
})

function checkAdmin(req, res, next) {
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
    res.redirect("/login")
  }
}

app.use('/admin', checkAdmin)

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin.html'));
})

app.get('/admin/runners', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin/runners.html'));
})

app.get('/admin/event', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin/event.html'));
})

// ----------- API Routen -----------

app.post('/api/login', (req, res) => {
  auth.adminLogin(req.body.password, (err, token) => {
    if (err) {
      res.redirect('/login?error=' +  err)
    } else {
      res.cookie('token', token)
      res.redirect('/admin')
    }
  })
})

app.use('/api/admin', checkAdmin)

app.get('/api/admin/jahrgaenge', (req, res) => {
  db.getJahrgaenge((err, results) => {
    if (err) {
      res.status(404).json({ message: err})
    }
    else {
      console.log(results)
      res.json({results})
    }
  })
})

app.listen(port, () => {
  console.log('Spendenlauf-Tool listening on port ' + port)
})
