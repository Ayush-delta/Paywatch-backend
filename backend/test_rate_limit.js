import http from 'http';

const numRequests = 15;
let completed = 0;
let successes = 0;
let rateLimited = 0;

console.log(`Starting ${numRequests} concurrent signup requests to test rate limiting...`);

for (let i = 0; i < numRequests; i++) {
    const data = JSON.stringify({
        name: `Test User ${i}`,
        email: `test_user_limit_${Date.now()}_${i}@example.com`,
        password: "password123"
    });

    const options = {
        hostname: 'localhost',
        port: 5500,
        path: '/api/v1/auth/sign-up',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            completed++;
            if (res.statusCode === 201 || res.statusCode === 200) {
                successes++;
                console.log(`[Request ${i + 1}] ✅ SUCCESS: User created (${res.statusCode})`);
            } else if (res.statusCode === 403 || res.statusCode === 429) {
                rateLimited++;
                // Expecting 403 or 429 from the security middleware
                console.log(`[Request ${i + 1}] ⛔ BLOCKED: Rate limit hit (${res.statusCode}) -> ${body}`);
            } else {
                console.log(`[Request ${i + 1}] ⚠️ OTHER: Status ${res.statusCode} -> ${body}`);
            }

            if (completed === numRequests) {
                console.log('\n--- Test Summary ---');
                console.log(`Total Requests: ${numRequests}`);
                console.log(`Successful Signups: ${successes}`);
                console.log(`Rate Limited Blocks: ${rateLimited}`);
                if (successes <= 10 && rateLimited > 0) {
                    console.log('✅ Rate limiter is working perfectly! (Max 10 requests allowed)');
                } else {
                    console.log('❌ Rate limiter might not be working as expected.');
                }
            }
        });
    });

    req.on('error', (e) => {
        console.error(`[Request ${i + 1}] Error: ${e.message}`);
    });

    req.write(data);
    req.end();
}
