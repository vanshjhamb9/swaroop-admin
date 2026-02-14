const crypto = require('crypto');
const admin = require('firebase-admin');

// User's 1281 key (stripped of all whitespace)
const base64Content = `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIWy7BenE+JklkIVZFhX67ySa5tQOtbwQ6Hezo+yPURfLAUYqDsAz7gX/rhCaSGFS2z+ZDKi+bqvrsuu3nky7o4Lm8CPRJNiV+4mpxQGra8KrxBBSJxjmyWoSfGpaa/sU/aLY9+onaHlrtWdl6jirVN7tB0diu5Kyh+iyXdF7UxXXWdDsZJfOxlaMsThS24eDGXvYtunPe7u3YnM7Zkjl9Kz6AWzoVVs4V1nPlZDGUj5WbsSxkelio6T/XpyrHzL573cGwq9bGBRK9KPkF/nCaRUSrZ7FEwS9jO7oQQ/Sp5PPzK5QcyHJYOMy1uWgaC+aLbtClmaF79eei2qxPsbzXAgMBAAECggEALZCzJvRKOciqSzfbr27nPhzGjlhw8Cn9y5vPq8KlyNpplTxWJJHOugofBfhlbzdSWMsaQm8fKadubpUqks5hzjuBchaVO+sxBtTGQWBVjNpL/gkgBJ9MstesLqT02GYVhNCzFZBbdnwN0Mns0FbxvdDxaMwpG8lMy3+iUYV5Jakk/pez3aquNcoPlsBH4dlVGn3FV/SB1k3fSE7u3v3nYcTt3OpRnun0tn2EVnaEmJHXMa/9tei64LMemoRGvJdLm4ClJr8MQEWDp2F74VLsuN9hTT0ZwrZPA/Hex+7CaasVm11ZWpJv6qkw0kx8aAC60Irzc9bS8jlk02SQ9LuoWQKBgQD8gVy8l6WqwRuW44biW+3rI/GYcAed89yKSXQD2oxMvtfXDA1quAcOqCSoONBME0MzOyad32rgGwcZTxCw4TBiCK4mtcGIynoJ/7v2PsIX7ut2IpfEb06FpOfFKKVKUxc36ih6eQzcGY5HeRRSmPhlcP2KaMEiTfUfmXwBdIH2/wKBgQDLIQ269YhtsB9EJwvxAcNGX5bBL7CW0RkcoLNxfBGFUKj/oMCa9w2BmrV7mZD78axvyFL8RriZJ9CgMpKFdmqdsB0R39nbzt9PP9Lk/5OQvnLjrRKNCalsxdgsfWB3D7HpyM8ULdB7UddeCpjk4z5PYfNFarWiFtFztu9yWbzSKQKBgCKt/belOEqodQqXO0pRh+64pBDkqhcmjA6uIfH5jTVpLKnLbPhQSB/aNhaonusj5iHeKOKb8cjPzXzLYCZ69zMvsAN/CRKphHNlHUKnwe6ZkNtLyv5erzEpwe9RMspveQvj7CVOBNch52mnloP1oIAGMbxVwNjeTiFF6kMk5kivAoGAdjEMYS1+rXweJTSnERuaePcjq9LI6GhQOUUUREMRmsWdH+h0SXbYyAGx+XIYV1B+qiggiSPJQ2xUSvJCKSAG1yvjLkRW6jwL2XvkhVRkk4MNLIbG1YO6rkzMBM8K8xwRxFsqishBl4++Rbzay8uhtOTkfQ6jEuY+Bxt5ZcrrQEkCgYEAv51eW/RP0s/qu2xn3LTTmGKgkeo7qSTUWo+Dqmr2TusZY7GjKsu5krCRyb6Qr91JNQ1yGJn4gV9LbJ2X5XK1uBjFykql2iD6diCLDvGLA0PcIlnJPgoccjzHVPQxAwCtPcNVzn2/JtQUt/HEAgaLzvgFWLBV4wgFpk0qoaPDCb4=`;

console.log('--- DER Recovery Test ---');

try {
    // 1. Convert to Buffer
    const der = Buffer.from(base64Content, 'base64');
    console.log('DER Bytes:', der.length);

    // 2. Try to wrap in PEM with proper newlines
    const pem = `-----BEGIN PRIVATE KEY-----\n${base64Content}\n-----END PRIVATE KEY-----\n`;

    // 3. Try to use it
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "uplai-aeff0",
            clientEmail: "firebase-adminsdk-fbsvc@uplai-aeff0.iam.gserviceaccount.com",
            privateKey: pem,
        }),
    });
    console.log('✅ Admin initialized successfully with reconstructed PEM!');
    process.exit(0);
} catch (e) {
    console.error('❌ Failed:', e.message);
    process.exit(1);
}
