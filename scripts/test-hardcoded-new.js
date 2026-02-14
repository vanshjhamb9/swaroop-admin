const admin = require('firebase-admin');

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIWy7BenE+Jklk
IVZFhX67ySa5tQOtbwQ6Hezo+yPURfLAUYqDsAz7gX/rhCaSGFS2z+ZDKi+bqvrs
uu3nky7o4Lm8CPRJNiV+4mpxQGra8KrxBBSJxjmyWoSfGpaa/sU/aLY9+onaHlrt
Wdl6jirVN7tB0diu5Kyh+iyXdF7UxXXWdDsZJfOxlaMsThS24eDGXvYtunPe7u3Y
nM7Zkjl9Kz6AWzoVVs4V1nPlZDGUj5WbsSxkelio6T/XpyrHzL573cGwq9bGBRK9
KPkF/nCaRUSrZ7FEwS9jO7oQQ/Sp5PPzK5QcyHJYOMy1uWgaC+aLbtClmaF79eei
2qxPsbzXAgMBAAECggEALZCzJvRKOciqSzfbr27nPhzGjlhw8Cn9y5vPq8KlyNpp
lTxWJJHOugofBfhlbzdSWMsaQm8fKadubpUqks5hzjuBchaVO+sxBtTGQWBVjNpL
/gkgBJ9MstesLqT02GYVhNCzFZBbdnwN0Mns0FbxvdDxaMwpG8lMy3+iUYV5Jakk
/pez3aquNcoPlsBH4dlVGn3FV/SB1k3fSE7u3v3nYcTt3OpRnun0tn2EVnaEmJHX
Ma/9tei64LMemoRGvJdLm4ClJr8MQEWDp2F74VLsuN9hTT0ZwrZPA/Hex+7CaasV
m11ZWpJv6qkw0kx8aAC60Irzc9bS8jlk02SQ9LuoWQKBgQD8gVy8l6WqwRuW44bi
W+3rI/GYcAed89yKSXQD2oxMvtfXDA1quAcOqCSoONBME0MzOyad32rgGwcZTxCw
4TBiCK4mtcGIynoJ/7v2PsIX7ut2IpfEb06FpOfFKKVKUxc36ih6eQzcGY5HeRRS
mPhlcP2KaMEiTfUfmXwBdIH2/wKBgQDLIQ269YhtsB9EJwvxAcNGX5bBL7CW0Rkc
oLNxfBGFUKj/oMCa9w2BmrV7mZD78axvyFL8RriZJ9CgMpKFdmqdsB0R39nbzt9P
nP9Lk/5OQvnLjrRKNCalsxdgsfWB3D7HpyM8ULdB7UddeCpjk4z5PYfNFarWiFtFz
tu9yWbzSKQKBgCKt/belOEqodQqXO0pRh+64pBDkqhcmjA6uIfH5jTVpLKnLbPhQ
SB/aNhaonusj5iHeKOKb8cjPzXzLYCZ69zMvsAN/CRKphHNlHUKnwe6ZkNtLyv5e
rzEpwe9RMspveQvj7CVOBNch52mnloP1oIAGMbxVwNjeTiFF6kMk5kivAoGAdjEM
YS1+rXweJTSnERuaePcjq9LI6GhQOUUUREMRmsWdH+h0SXbYyAGx+XIYV1B+qigg
iSPJQ2xUSvJCKSAG1yvjLkRW6jwL2XvkhVRkk4MNLIbG1YO6rkzMBM8K8xwRxFsQ
nishBl4++Rbzay8uhtOTkfQ6jEuY+Bxt5ZcrrQEkCgYEAv51eW/RP0s/qu2xn3LTT
mGKgkeo7qSTUWo+Dqmr2TusZY7GjKsu5krCRyb6Qr91JNQ1yGJn4gV9LbJ2X5XK1
nuBjFykql2iD6diCLDvGLA0PcIlnJPgoccjzHVPQxAwCtPcNVzn2/JtQUt/HEAgaL
zvgFWLBV4wgFpk0qoaPDCb4=
-----END PRIVATE KEY-----`;

console.log('--- Hardcoded New Key Test ---');

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "uplai-aeff0",
            clientEmail: "firebase-adminsdk-fbsvc@uplai-aeff0.iam.gserviceaccount.com",
            privateKey: privateKey,
        }),
    });
    console.log('✅ Admin initialized successfully!');
    process.exit(0);
} catch (e) {
    console.error('❌ Initialization failed:', e.message);
    process.exit(1);
}
