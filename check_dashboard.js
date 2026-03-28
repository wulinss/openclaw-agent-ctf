
const http = require('http');
const querystring = require('querystring');

const uid = "2ca01c4924cc40e5b0c303f33d0aa184";
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
  console.log("Got cookie, getting dashboard...");
  const dashOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/dashboard',
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };
  const dashReq = http.request(dashOpts, (dashRes) => {
    let body = '';
    dashRes.on('data', chunk => body += chunk);
    dashRes.on('end', () => {
      console.log("\nDashboard full content:");
      console.log(body);
      console.log("\n");
      // Check if button is enabled
      if (body.includes('disabled')) {
        console.log("❌ Button is still disabled → we are not admin");
      } else {
        console.log("✅ Button is enabled → we are admin!");
      }
    });
  });
  dashReq.end();
});

req.on('error', err => console.error(err));
req.write(loginData);
req.end();
