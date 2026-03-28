
const http = require('http');
const querystring = require('querystring');

// First login with our last uid
const uid = "7a545a003dae471983c8e252267c8d30";
const postData = querystring.stringify({uid: uid});

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
  let cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Got cookie, checking profile...");
  // Now call /api/profile
  const profileData = JSON.stringify({uid: uid});
  const profileOptions = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(profileData),
      'Cookie': cookie
    }
  };
  const profileReq = http.request(profileOptions, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\napi/profile response:");
      console.log(body);
      let data = JSON.parse(body);
      console.log("\nCurrent role:", data.role);
    });
  };
  profileReq.write(profileData);
  profileReq.end();
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();
