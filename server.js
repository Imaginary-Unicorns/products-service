const express = require('express')
const app = express()
const port = 4500
const compression = require('compression');
const conf = require('./postgresConfig.js');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
//const db = pgp('postgres://' + conf.username + ':'+ conf.password + '@localhost:5432/' + conf.database);
const db = pgp('postgres://' + conf.username + ':'+ conf.password + '@184.73.132.46:5432/' + conf.database);
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

  // let start = 1
  // let endBefore = 500;


  //   for(let i = start; i < endBefore; i++) {
  //     if (i === start) {
  //       console.log('Processing...');
  //     }
  //     let final;
  //     let query = 'UPDATE productstyles SET photos = (SELECT json_agg(row_to_json) AS allphotos FROM (SELECT row_to_json(t) FROM (SELECT thumbnail_url, url from photos p WHERE p.styleId = ' + i +')t)d) WHERE id = ' + i;
  //     db.any(query)
  //     .then(async (results)=>{
  //       final = await i === (endBefore-1);
  //       final ? console.log('finished') : null;

  //       // console.log(JSON.stringify(results));
  //       // let arrayOfPhotoObjects = [];
  //       // for(let j = 0; j < results.length; j++) {
  //       //   arrayOfPhotoObjects.push(results[j].row_to_json);
  //       // }
  //       // arrayOfPhotoObjects = JSON.stringify(arrayOfPhotoObjects);

  //       // let query = "UPDATE productstyles SET photos = '" + JSON.stringify(results) + "' WHERE id = " + i;
  //       // let final;
  //       // db.any(query)
  //       // .then(async () => {
  //       //   final = await i === 10499;
  //       //   final ? console.log('finished') : null;
  //       // })
  //       // .catch((err)=>{
  //       //   console.log('ERROR ' , err);
  //       // })


  //     })
  //     .catch((err)=>{
  //       console.log('Error ' , err);
  //     })

  //   };

// let testConnection = () => {
//   let totalResults = {};
//   totalResults.product_id = 2;
//   console.log('testing database connection SELECT * from productstyles WHERE id = ' + 2);
//   db.any('Select id, name, sale_price, original_price, default_style, photos, skus FROM productstyles WHERE productId = ' + 2)
//     .then((results)=>{
//       styles = results;
//       //console.log(results);
//       for (let i = 0; i < styles.length; i++) {
//         let skuDetails = {};
//         let defaultVal = styles[i].default_style;
//         styles[i]['default?'] = defaultVal;
//         // console.log('hello');
//         // console.log('length of current sku', styles[i].skus.length);
//         if(styles[i].skus) {
//           for(let m = 0; m < styles[i].skus.length; m++) {
//             skuDetails[styles[i].skus[m].id] = {
//               quantity: styles[i].skus[m].quantity,
//               size: styles[i].skus[m].size
//             };
//           }
//           styles[i].skus = skuDetails;

//         }
//         if(!styles[i].photos) {
//           styles[i].photos = {}
//         }
//       }
//       totalResults.results = styles;
//       // console.log(totalResults);
//       // console.log(JSON.stringify(totalResults));
//     })
//     .catch((err)=>{
//       console.log('Error occured: ');
//       console.log(err);
//     })

// }
// testConnection();

app.get('/', (req, res) => {
  // console.log(req)
  res.send('You are not using the API correctly')
})

app.get('/products/:productId/', (req, res)=>{
  console.log('products param: ', req.params.productId);
  console.log('products query: ', req.query);

  if(req.headers.authorization === credentials.authorization && req.params.productId === undefined) {
    //console.log(req.body);

    db.any('SELECT id, name, slogan, description, category, default_price FROM products WHERE id < 6 ')
    .then((results)=>{

      res.send(results);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(501)
    })

  } else if(req.headers.authorization === credentials.authorization && req.params.productId !== undefined) {
    //console.log('Get product info request made on productId: ',req.body.productId)
    //console.log('get product info on: ', req.body.productId)
    db.any('SELECT id, name, slogan, description, category, default_price, features FROM products WHERE id = ' + Number(req.params.productId))
    .then((results)=>{
      // console.log(results);
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

app.get('/products/:productId/styles', (req, res)=>{

  let totalResults = {};
  totalResults.product_id = Number(req.params.productId);
  //console.log('Get styles request made on productId: ',totalResults.product_id)
  if(req.headers.authorization === credentials.authorization && req.body !== undefined) {
    let styles = [];

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
      res.send(JSON.stringify(totalResults));
      }
    ).catch((err)=>{
      res.sendStatus(501);
    })


  } else {
    res.sendStatus(501);
  }
})

app.get('/products/:productId/related', (req, res)=>{
  //console.log('Get related products request made from parent productId: ', req.params.productId)
  db.any('SELECT related_product_id FROM RELATED WHERE current_product_id = ' + req.params.productId)
  .then(async (results)=>{
    let nums = []
    for(let i = 0; i < results.length; i++) {
      nums.push(results[i].related_product_id);

    }
    res.send(nums);
  })
  .catch((err)=>{
    console.log(err);
    res.sendStatus(501);
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = {
  app
}