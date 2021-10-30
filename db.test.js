const conf = require('./postgresConfig.js');
const pgp = require('pg-promise')();
const db = pgp('postgres://' + conf.username + ':' + conf.password + '@localhost:5432/' + conf.database);

describe('Should query all tables', ()=>{

  test('Should be able to query from photos table', async () => {
    let results;
    await db.any('SELECT * FROM photos WHERE id = 1')
    .then((res)=>{
      results = res;
      expect(results[0].id).toBe(1);
    })
  });
  test('Should be able to query from skus table', async () => {
    let results;
    db.any('SELECT * FROM skus WHERE id = 1')
    .then((res)=>{
      results = res;
      expect(results[0].id).toBe(1);
    })

  });
  test('Should be able to query from product table', () => {
    let results;
    db.any('SELECT * FROM product WHERE id = 1')
    .then((res)=>{
      results = res;
      expect(results[0].id).toBe(1);
    })

  });
  test('Should be able to query from style table', () => {

    let results;
    db.any('SELECT * FROM photos WHERE style = 1')
    .then((res)=>{
      results = res;
      expect(results[0].id).toBe(1);
    })
  });
  test('Should be able to query from related table', () => {
    let results;
    db.any('SELECT * FROM photos WHERE related = 1')
    .then((res)=>{
      results = res;
      expect(results[0].id).toBe(1);
    })

  });

})
