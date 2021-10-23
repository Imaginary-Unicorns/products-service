const express = require('express')
const app = express()
const port = 4500
const compression = require('compression');
const conf = require('./postgresConfig.js');
const pgp = require('pg-promise')();
const db = pgp('postgres://' + conf.username + ':' + conf.password + '@localhost:5432/' + conf.database);


app.use(compression());

db.one('SELECT * FROM product WHERE id = 4')
  .then(function (data) {
    console.log('DATA:', data)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})