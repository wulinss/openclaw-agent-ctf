
const http = require('http');
const querystring = require('querystring');

const uid = "524a8f8e4e344efebf0868c589c30b9b";
const loginData = querystring.stringify({uid: uid});

const loginOpts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  const dashOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/dashboard',
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };
  const dashReq = http.request(dashOpts, (dashRes) => {
    let body = '';
    dashRes.on('data', chunk => body += chunk);
    dashRes.on('end', () => {
      console.log("\nDashboard full content:");
      console.log(body);
      // Find any links
      let links = body.match(/href="([^"]+)"/g);
      if (links) {
        console.log("\nFound links:");
        console.log(links);
      }
    });
  });
  dashReq.end();
});

req.on('error', err => console.error(err));
req.write(loginData);
req.end();
