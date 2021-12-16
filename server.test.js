const app = require('./server.js');
const request = require('request');

describe('Should handle incoming Client Requests', ()=>{

  test('Should be able to query for /products', async () => {
    const response = await request();

    expect(response.data.length).toBe(5);
  });


})
