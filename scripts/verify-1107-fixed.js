const admin = require('firebase-admin');

// 1107 key content
const rawKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDaYVtlJDSD0+eB
7m6StpF/LKN6A6gA3iMROM1JfS1Mq9N7fsU4FCDOEgiBT/V5OuZa3kpVKu74ps3E
Ek+TO0PTdH1dsCwRtASJ0LBSjsALHrFXZOHPnPzCmblu11kkrPv2dQLXnrbNe57X
fVx14vjnN2bC8Cf06YZ8uCjSZTsbK+DXhD26sFCWf7jnTl/mjuDrINghjbXY/ISE
xcpETEe/IXqASU6OHDzum/3gCTNIksVCZW0vbn9tU1OF9HrPhHSCDlSXZ8/iFa15
nQncEDLLjPUctJxjkIo97yb0vtNMHU6+7jUpHx3634nijO0CXIQwYeeTZgb+1NZq
LtJtaAFtAgMBAAECggEAHff73KSsD0ZKkD5qDri+vVLhKVqsmNfjPJcMtw/WYl33
Mwyp4IEEonr/j01rjMQ8Pg6g6VCvxFBRzx1LLdOVgoSLOsr1NUW81LPeqqm76Zq/
8BQgWAc9ebAybidf7KRPnJogtnnpsMfM+9oQkP4BtetYrxpZhWbxxZZZRcxOIPNy
zWRMJa8irYpU7d14ZQNkaQumMAU4En4XKlinqL4ky+srP0/KYof0TAnhJHL3djlS
nl6/GRbjmCfT6tyEImboeAgm63b/qXHQwi/FVzb01nViC457yxqXTBkInNG2QXk36
ehQqLTwvFsmI/xrZWy4hibf33b5wT6+n2mxlCk/SSQKBgQD7nlb7aJ4JaxsyUc1L
lKAC7cYgH1ifuE6j5puYm5eOWKx15UtlAD94bFidNm9CYpZZPahEJsSUEHIoiMFt
Md0pOBI2Tw67+U9YUZcEENHqpPhZamoftDiOT6aLa9HZkOY37go2Bm7tH6exKTWf
YBN6g/o/kFuPdvJCQ/PnHBs5WQKBgQDeLtk7SltOjt4iAAb7W375/GnRzKs5eWPx
ugPaP5JnAj/0uuYuitBtGG9zAzfBmYQUmsqyOWzZXtQu73VW/TkWlUXkpKY9uEUw
xKiIM1nL8g95cXCcVZt/DlJ4sT6lJ1VwLYCDmLgUl5kO2hCmKfXYTKiCdFWBDj6E
WXVr2yfyNQKBgDLVMk1oPUU51iy8SfVS+WCeGMC0lHrwCTMji5uxE1U2pODMigbF
ngz+FojsTl3i/Ozaf/wEuQIQsH9v4WPmBwAky8kc/6UKIPV+xjuUClSVL3chAH+X
MTXO8Z6JEcQaeegitv1jH1XYZ1BrOuIPzt+Zeh0NVPIO3bJ1d/jgvL9BAoGAVSQq
nxpe16aLB6NGN22CyheV+P5Fow/uKmyUnOMlHtwWbsJK2hntXZ5cHjlFbWmsTvDmd
FzL+TUYTlXDZzF35NHg7cmTN97TXftq9ooPbE1ZNK8KW3rHHhqbcX7e8Q9mQ2g31
w3gQgoOdeZ2C58oIlby6jlM6ONxWhK0rXAt9gUkCgYBuw6Fol4j4qY2ADC3ijh+T
nX/IHLELctCvAFk5TKVJOjQsl/0t80yyMJt6ecKoDSnDZNaEN+vjithd1kLJdwANF
xzG3PbhCCQw+PchXJE8WgxrgIvwvvsB7HPlKCqp18g2qpBEBskyVKvOmoVhh8iBF
EX4PqPsKo8KP/tBPYyAAeg==
-----END PRIVATE KEY-----`;

console.log('--- Final 1107 Integrity Test ---');

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "uplai-aeff0",
            clientEmail: "firebase-adminsdk-fbsvc@uplai-aeff0.iam.gserviceaccount.com",
            privateKey: rawKey,
        }),
        storageBucket: "uplai-aeff0.firebasestorage.app",
    });
    console.log('✅ Admin initialized successfully!');

    async function test() {
        const db = admin.firestore();
        await db.collection('test_connection').doc('hardcoded_verify').set({
            msg: 'Successfully verified 1107 key again',
            time: new Date().toISOString()
        });
        console.log('✅ Firestore ping successful!');

        const [exists] = await admin.storage().bucket().exists();
        if (exists) console.log('✅ Storage bucket accessible!');
        process.exit(0);
    }

    test().catch(e => {
        console.error('❌ Test failed:', e.message);
        process.exit(1);
    });
} catch (e) {
    console.error('❌ Initialization failed:', e.message);
    process.exit(1);
}
