
import http from 'http';

const data = JSON.stringify({
    name: "Verification User",
    email: `verify_${Date.now()}@example.com`,
    password: "password123"
});

const options = {
    hostname: 'localhost',
    port: 5500,
    path: '/api/v1/auth/sign-up',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('BODY: ' + body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
