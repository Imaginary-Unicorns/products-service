const express = require('express')
const app = express()
const port = 4500
const redis_port = 6379;
const compression = require('compression');
const conf = require('./postgresConfig.js');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
//const db = pgp('postgres://' + conf.username + ':'+ conf.password + '@localhost:5432/' + conf.database);
const db = pgp('postgres://' + conf.username + ':'+ conf.password + '@184.73.132.46:5432/' + conf.database);
const credentials = require('./credentials.js');
const redis = require('redis');

const client = redis.createClient(redis_port);
app.use(compression());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  // console.log(req)
  res.send('Incorrect')
})

function cache(req, res, next) {


}

app.get('/products/:productId/', (req, res)=>{
  let keyString = 'products_' + req.params.productId;

  if(req.headers.authorization === credentials.authorization && req.params.productId === undefined) {

    client.get(keyString, (err, data)=> {
      if(err) {
        throw err;
      }
      if(data !== null) {
        res.send(data);
      } else {

        db.any('SELECT id, name, slogan, description, category, default_price FROM products WHERE id < 6 ')
        .then((results)=>{
          let keyString = 'productList'

          //cache results
          client.setex(keyString, 3600, results);

          res.send(results);
        })
        .catch((err)=>{
          console.log(err);
          res.sendStatus(501)
        })
      }
    })


  } else if(req.headers.authorization === credentials.authorization && req.params.productId !== undefined) {
    client.get(keyString, (err, data)=> {
      if(err) {
        res.send(500);
      }
      if(data !== null) {
        console.log('typeof data returned from cache: ', typeof data);
        console.log(data);
        res.send(data);
      } else {

        db.any('SELECT id, name, slogan, description, category, default_price, features FROM products WHERE id = ' + Number(req.params.productId))
        .then((results)=>{
          // console.log(results);
          console.log('typeof for results[0] in db query: ', typeof results[0])
          client.setex(keyString, 3600, JSON.stringify(results[0]));

          res.send(results[0]);
        })
        .catch((err)=>{
          console.log(err);
          res.sendStatus(501)
        })

      }
    })

  } else {
    console.log('Not Authorized')
    res.sendStatus(502);
  }

})

app.get('/products/:productId/styles', (req, res)=>{
  let keyString = 'styles_' + req.params.productId;
  let totalResults = {};
  totalResults.product_id = Number(req.params.productId);
  //console.log('Get styles request made on productId: ',totalResults.product_id)
  if(req.headers.authorization === credentials.authorization && req.body !== undefined) {
    let styles = [];
    client.get(keyString, (err, data)=> {
      if(err) {
        res.send(500);
      }
      if(data !== null) {
        console.log('typeof data returned from cache: ', typeof data);
        console.log(data);
        res.send(data);
      } else {

        db.any('Select id, name, sale_price, original_price, default_style, photos, skus FROM productstyles WHERE productId = ' + Number(req.params.productId))
       .then((results)=>{

         styles = results;
         //console.log(results);
         for (let i = 0; i < styles.length; i++) {
           let skuDetails = {};
           let defaultVal = styles[i].default_style;
           styles[i]['default?'] = defaultVal;
           // console.log('hello');
           // console.log('length of current sku', styles[i].skus.length);
           if(styles[i].skus) {
             for(let m = 0; m < styles[i].skus.length; m++) {
               skuDetails[styles[i].skus[m].id] = {
                 quantity: styles[i].skus[m].quantity,
                 size: styles[i].skus[m].size
               };
             }
             styles[i].skus = skuDetails;

           }
           if(!styles[i].photos) {
             styles[i].photos = {}
           }
         }
         totalResults.results = styles;
         // console.log(totalResults);
         let finalResults = JSON.stringify(totalResults);
         client.setex(keyString, 3600, finalResults);
         res.send(finalResults);
         }
       ).catch((err)=>{
         res.sendStatus(501);
       })


      }
    })

  } else {
    res.sendStatus(501);
  }
})

app.get('/products/:productId/related', (req, res)=>{
  let keyString = 'related_' + req.params.productId;
  //console.log('Get related products request made from parent productId: ', req.params.productId)
  client.get(keyString, (err, data)=> {
    if(err) {
      res.send(500);
    }
    if(data !== null) {
      console.log('typeof data returned from cache: ', typeof data);
      console.log(data);
      res.send(data);
    } else {


      db.any('SELECT related_product_id FROM RELATED WHERE current_product_id = ' + req.params.productId)
      .then((results)=>{
        let nums = []
        for(let i = 0; i < results.length; i++) {
          nums.push(results[i].related_product_id);

        }
        let stringNum = JSON.stringify(nums);
        client.setex(keyString, 3600, stringNum);
        res.send(stringNum);
      })
      .catch((err)=>{
        console.log(err);
        res.sendStatus(501);
      })

    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = {
  app
}