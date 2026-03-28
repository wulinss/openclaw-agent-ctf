
const http = require('http');

// First login to get cookie
const querystring = require('querystring');

const postData = querystring.stringify({
  "uid": "093f2fff41654320930244c2990d203b"
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
  console.log("Got cookie:", cookie);
  
  // Try /backup
  getPage('/backup', cookie, (body) => {
    if (!body.includes('Access Denied') && !body.includes('404')) {
      console.log("Got backup response:");
      console.log(body);
    } else {
      // Try /admin
      getPage('/admin', cookie, (body2) => {
        console.log("Admin response:");
        console.log(body2);
      });
    }
  });
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
