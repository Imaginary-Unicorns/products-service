const { Client } = require('pg');
const client = new Client();
//initialize response variable
let res;
//initialize connection to postgres server
await client.connect();
/*DATABASE NAVIGATION */


/*SCHEMA CREATION */
let createSchema = 'CREATE SCHEMA IF NOT EXISTS sdcproductsapi';
res = await client.query(createSchema);
console.log(res.rows[0].message);


/*TABLE CREATION*/
let createProductsTable = 'CREATE TABLE IF NOT EXISTS sdcproductsapi';
res = await client.query(createProductsTable);
console.log(res.rows[0].message);

let createProductsTable = 'CREATE TABLE IF NOT EXISTS sdcproductsapi';
res = await client.query(createProductsTable);
console.log(res.rows[0].message);

let createProductsTable = 'CREATE TABLE IF NOT EXISTS sdcproductsapi';
res = await client.query(createProductsTable);
console.log(res.rows[0].message);

let createProductsTable = 'CREATE TABLE IF NOT EXISTS sdcproductsapi';
res = await client.query(createProductsTable);
console.log(res.rows[0].message);

let createProductsTable = 'CREATE TABLE IF NOT EXISTS sdcproductsapi';
res = await client.query(createProductsTable);
console.log(res.rows[0].message);



//end connection
await client.end();

