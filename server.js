const express = require('express')
const app = express()
const port = 4500
const compression = require('compression');
const conf = require('./postgresConfig.js');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const db = pgp('postgres://' + conf.username + ':' + conf.password + '@localhost:5432/' + conf.database);
const credentials = require('./credentials.js');

app.use(compression());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// db.any('SELECT id FROM product WHERE id > 600009 AND id < 1000012')
//   .then(function (data) {

//     for(let i = 0; i < data.length; i++) {

//       db.any('SELECT row_to_json(t) FROM (SELECT feature, value from features f WHERE f.product_id = ' + data[i].id +') t ')
//       .then((results)=>{
//         let arrayOfResultObjects = [];
//         let count = 0;
//         // let chunk1 = 0;
//         // let chunk2 = Math.floor(results/100000);
//         for(let j = 0; j < results.length; j++) {
//           arrayOfResultObjects.push(results[j].row_to_json);
//         }
//         arrayOfResultObjects = JSON.stringify(arrayOfResultObjects);
//         let query = "UPDATE products SET features = '" + arrayOfResultObjects + "' WHERE id = " + data[i].id;
//         db.any(query)
//         .then(() => {
//           console.log('success: ', data[i].id);

//         })
//         .catch((err)=>{
//           console.log('ERROR ' , err);
//         })
//       })
//       .catch((err)=>{
//         console.log('Error ' , err);
//       })

//     }
//     return data.length;

//   })
//   .then((size)=>{
//     console.log('Processing.... ', size);
//   })
//   .catch(function (error) {
//     console.log('ERROR:', error)
//   })




    // for(let i = 1; i < 5000; i++) {

    //   db.any('SELECT row_to_json(t) FROM (SELECT thumbnail_url, url from photos p WHERE p.styleId = ' + i +') t ')
    //   .then((results)=>{

    //     let arrayOfPhotoObjects = [];
    //     for(let j = 0; j < results.length; j++) {
    //       arrayOfPhotoObjects.push(results[j].row_to_json);
    //     }
    //     arrayOfPhotoObjects = JSON.stringify(arrayOfPhotoObjects);

    //     let query = "UPDATE productstyles SET photos = '" + arrayOfPhotoObjects + "' WHERE id = " + i;
    //     db.any(query)
    //     .then(() => {
    //       console.log('Successfully updated: ', i);
    //     })
    //     .catch((err)=>{
    //       console.log('ERROR ' , err);
    //     })


    //   })
    //   .catch((err)=>{
    //     console.log('Error ' , err);
    //   })

    // };

app.get('/', (req, res) => {
  // console.log(req)
  if(req.headers.authorization === credentials.authorization) {

  }
  res.send('You are not using the API correctly')
})

app.get('/products', (req, res)=>{
  console.log(req.url)
  if(req.headers.authorization === credentials.authorization && req.body === undefined) {
    // console.log(req.body);

    db.any('SELECT id, name, slogan, description, category, default_price FROM products WHERE id < 5 ')
    .then((results)=>{
      console.log(results);
      res.send(results);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(501)
    })

  } else if(req.headers.authorization === credentials.authorization && req.body !== undefined) {

    db.any('SELECT id, name, slogan, description, category, default_price, features FROM products WHERE id = ' + req.body.productId)
    .then((results)=>{
      // console.log(results);
      console.log(results);
      res.send(results[0]);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(501)
    })
  } else {
    console.log('not authorized')
    res.sendStatus(502);
  }

})
app.get('/products/styles', async (req, res)=>{
  let totalResults = {};
  totalResults.product_id = req.body.productId;
  if(req.headers.authorization === credentials.authorization && req.body !== undefined) {
    let styles = [];

    styles = await db.any('Select id, productId, name, sale_price, original_price, default_style FROM productstyles WHERE productId = ' + req.body.productId)
    .then((results)=>{
      return results;
      }
    ).catch((err)=>{
      res.sendStatus(501);
    })
    // console.log(styles)
    for (let i = 0; i < styles.length; i++) {
      let defaultVal = styles[i].default_style;
      styles[i]['default?'] = defaultVal;

      let entry = {};
      entry = await db.any('Select thumbnail_url, url FROM photos WHERE styleId = ' + styles[i].id)
      .then((results)=>{
        return results;
        }
      ).catch((err)=>{
        res.sendStatus(501);
      })
      styles[i].photos = entry;
      styles[i].skus = {};

      let skusForSingleStyleId = [];
      skusForSingleStyleId = await db.any('Select id, size, quantity FROM skus WHERE styleId =' + styles[i].id)
      .then((skus)=>{
        return skus;
      }).catch((err)=>{
        res.sendStatus(501);
      })
      for(let m = 0; m < skusForSingleStyleId.length; m++) {
        styles[i].skus[skusForSingleStyleId[m].id] = {
          quantity: skusForSingleStyleId[m].quantity,
          size: skusForSingleStyleId[m].size
        };
      }

    }
    totalResults.results = styles;
    res.send(totalResults);

  } else {
    res.sendStatus(501);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})