const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express()
const port = process.env.PORT

var fs = require('fs');

var db = require('./js/database')
var auth = require('./js/authentication');
var pdf = require('./js/pdf')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'))

// ----------- HTML Routen -----------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/index.html'))
})


app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/live.html'))
})

app.get('/login', (req, res) => {
  if (req.cookies.token) return res.redirect('/');
  res.sendFile(path.join(__dirname, '/html/login.html'))
})

app.get('/logout', (req, res) => {
  if (req.cookies.token) {
    db.removeToken(req.cookies.token, (err) => {
      if (err) {
        return res.status(500).send(err)
      }
    })
  };
  res.clearCookie('token')
  res.redirect('/')
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
app.use('/admin', express.static('admin'))

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin.html'));
})

app.get('/admin/runners', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin/runners.html'));
})

app.get('/admin/event', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin/event.html'));
})

app.get('/admin/runs', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/admin/runs.html'));
})

// ----------- API Routen -----------
// PUBLIC

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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.get('/api/raised', (req, res) => {
  db.getTotal((err, raised) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      amountString = raised.toFixed(2).replaceAll('.', ',')
      res.json({success: true, amount: amountString})
    }
  });
})

// ADMIN
app.use('/api/admin', checkAdmin)

app.get('/api/admin/jahrgaenge', (req, res) => {
    db.getRunnerStruct((err, results) => {
    if (err) {
      res.status(404).json({ message: err})
    }
    else {
      res.json({results: results, deletionDisabled: process.env.DISABLED_DELETION, payment: process.env.PAYMENT})
    }
  })
})

app.post('/api/admin/runner', (req, res) => {
  db.createRunner(req.body.name, req.body.per_round, req.body.class_id, req.body.fixed, (err, output) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true, output: output})
    }
  })
})

app.delete('/api/admin/runner', (req, res) => {
  db.deleteRunner(req.body.number, err => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

app.get('/api/admin/runs', (req, res) => {
  db.getAllRuns((err, results) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true, runs: results})
    }
  })
})

app.get('/api/admin/runs-runners', (req, res) => {
  db.getRunsWithRunners((err, results) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true, runs: results})
    }
  })
})

app.post('/api/admin/run', (req, res) => {
  db.createRun(req.body.title, req.body.jahrgang_1, req.body.jahrgang_2, (err, results) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

app.put('/api/admin/round', (req, res) => {
  db.addRound(req.body.number, err => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

app.delete('/api/admin/round', (req, res) => {
  db.removeRound(req.body.number, err => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

app.get('/api/admin/payment', (req, res) => {
  db.getPaymentData(req.query.number, (err, data) => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true, result: data})
    }
  })
})

app.post('/api/admin/payment', (req, res) => {
  db.setPayed(req.body.number, err => {
    if (err) {
      res.status(500).json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

app.post('/api/admin/pdf/results', (req, res) => {
  db.getRunnersOfClass(req.body.class, (err, results) => {
    if (err) return res.status(500).json({success: false, error: err})
    if(results < 1) return res.json({success: false, error: "No runners in class."})
    var filename = pdf.generateResultsPDF(results);
    res.json({success: true, filename: filename})
  })
})

app.post('/api/admin/pdf/runners', (req, res) => {
  db.getRunnersWithClass((err, results) => {
    if (err) return res.status(500).json({success: false, error: err})
    var filename = pdf.generateRunnerDataPDF(results);
    res.json({success: true, filename: filename})
  })
})

app.listen(port, () => {
  console.log('Spendenlauf-Tool listening on port ' + port)
})
