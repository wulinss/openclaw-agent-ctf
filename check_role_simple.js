
const http = require('http');

const uid = "7a545a003dae471983c8e252267c8d30";

// First login
const querystring = require('querystring');
const postData = querystring.stringify({ uid: uid });

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
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log('Got cookie, checking profile...');

  // Request profile
  const profileBody = JSON.stringify({ uid: uid });
  const profileOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(profileBody),
      'Cookie': cookie
    }
  };

  const profileReq = http.request(profileOpts, (profileRes) => {
    let data = '';
    profileRes.on('data', chunk => data += chunk);
    profileRes.on('end', () => {
      console.log('\nAPI Response:');
      console.log(data);
      try {
        const json = JSON.parse(data);
        console.log('\nParsed JSON:');
        console.log(JSON.stringify(json, null, 2));
        console.log('\nCurrent role:', json.role);
      } catch(e) {
        console.log('Failed to parse JSON');
      }
    });
  });
  profileReq.write(profileBody);
  profileReq.end();
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();
