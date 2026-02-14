const admin = require('firebase-admin');

const key1 = {
    project_id: "swaroop-a03d9",
    private_key_id: "a6f66444e021541041bd1759886ab6534cbf8a51",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtWl7jdgiFValp\nmPssDMU1NSDuOKMF/JEkOT0qO6USEzqUoFFK2uH8D7gXdfFZ3zg4bimSRoXaAcGb\npFKnnR/B3//L5cmHbIbQLX82xNS8Jk/mOiyxd4UooJDlDKnN9HIiShE5ApElbwtN\nmL7doOGgrYFVZQnVYr/Zv7ZlVz8mI6ETHyZlnhmwC1EEf6nTsv4OZZMDet4BfW/H\nSJoBwHZRySC3kvZZtno6v67xN449Oe4MKnaI5v/fJLC99VbVyBhplQPWX2upisX5\naPOQ3gbAi3dExYXwBDRNajW9kGoPK0wvkaGjpWRxE3FRglyYWIVAjXMaPnU/MTIZ\n5Elb1LADAgMBAAECggEAVpPKzjlV+hmVObsAvrhGCdPV9YPtz4CbkIbRyHTvdT6L\nRE1pLERzFutW2si52FPGhVBnjLmSAhZcdno0Gag8gxx3aYMDCpKmJfSDE3xsbueH\ngglN5vg1VdwTYYHYkJbkJcHuJhXlHdf+witmL9Q4u4HMFTUYGy1tebfoxWY0kLvp\npFBd8w0kdxqTSseQON0UuaqhMNaPDGpNIvM5pHoZ7sAkFPOQADvVJdYXSCF9pXHv\nIwpbEyXG9HJfB1p2kkRnuiQSzVdUayDAgmH4ArnEkMvE2p0eiy4F0+TMVlJTBIHq\n4O1qe/xjWPTaKE1LuTrsodjAzZSxVfXdB39jVhg3iQKBgQDjAsIcHFllqHpVpIxr\n/vmI5gxBLFA/9epkliOKJIKK8gvVT7Uph8S6uSasoQMIbJt18yfwdH627yYZxevx\nz5hbqTOSWzUlt3+d0nAI5ZseUR9znovwKT5WQQKDe5Ka4zWYDqvAOUEpUspFVVCo\ngDRojQb7+9ZGGCXONvejkgAIJwKBgQDDfXqQSysRlh4bYH2v2NQJqcgGIFhFeAWx\nOqMVG1piyI1x6M/I3TVWR9fWPQVupg0A4pnPlKWmeJVrng5mnzAC14yKDXBKqn4i\nHPUQxOLCDzOIBbk+XOgh8DJKW7fsSra5Jqj0+z5bgPVLgv/Dm5LO+YPtFda3RRWs\n4U1YEmaGxQKBgEis2GHRfZk6/7ctT7s/TLnUFDZFLofbfaeoHUabe6Np6/nlY7Ug\n/w1cOxJnFaZ7xqVTLAUh9nMwSr1TjL7EXB10JMuFIZWqklN/TFi80RU6mVwVdO10\n9rz8YQag6AVoGf9NKxUF/2NwWsspjgHz0VNrWsIPFMEp9+h11n/qPNJfAoGBAMMT\nVdjjiajU+lorYYC2iHDUIawrXqqD6HpAnziSwRFOPAdtYNt6Ep10t6cr4V3XCabW\neNIx7VM/hSuM36X8ODa9zZp9ao63r4JvDwWa0wT/klasD3xxzZsAS87z04dRzyDX\nuUYt6L3648xkfsE9X7R2PPW7EzZzE/weH8ZBJlpZAoGBANpqciKsbU5jJ45Gpavo\nWXdcmQMz84t707NaH1lKGG2cNmusT9LUblkfOXUlMJC9ftfrEjmzVgs6hzvyWHVD\nwUP+JC6y94PU4DihAR0WkRTtB28UKxdaSMUx0JbgzKE3Yi7jAgw0w3lY5RgeECBQ\nAGqA1E1kcxK8iTLO1lQKv9sB\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    client_email: "firebase-adminsdk-fbsvc@swaroop-a03d9.iam.gserviceaccount.com"
};

const key2 = {
    project_id: "swaroop-a03d9",
    private_key_id: "32735c25d190f5f5e6c112b5235f97f82f69b742",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD1CQXEK9s35Ncz\nCgH4yTgv47PE484UBWUc0wPF6F01uC2gnfBaezp6yFbtZcXLJXxpr67tGmz5BR6w\nlMxGRfGkvnja2X4oN7flEsOt7Z+CYoS9cYxsnXShEBe2yjBvqaE5HrIvHB6v1++U\n7uLKSnW3F8PC1K+wxF9D/yDqoIzJQafnAJ5NM3LthEXu0F+9YK0Y/08xlTcwV6Ja\n4enhrZoAx5bpr0dFOEgEch5xV0k0vk/+Oyl3miByUsNXXMKZeG8pKgUP34kr5KAC\ntvZ9k5WEb9LB5Si9wHqgPSBmjlizwjHLWZP6/0i4euNuTQhMEF/wprsHCZYkHyWH\nfb+sezHtAgMBAAECggEAIK80KXNXIajA6sIwOqTufXbQPRhM3f9NOi/MbkrdGgQH\n9Ad1LsCGr6eG7tIXNM56fqdsPBy9AedkrVWfvNTqE1lDyh9eNFOgUCo1Vz8dunjV\nL2bUvg0vqCc7HorwNIjKJFIbnuyPjFGPl8xYjHarpoFBP7z6dWfwNCP1Gk7RkKuS\nPUFvp56O8Xftdgc3ZUoNYECMdvI4M83ZXLS//0OpsRa87/+3l4uPkQBOAZkuEe11\nlT3UXzY+2DwEpBeC/i4yRs0ecbj+TDCsqt3GA1sPmJOcOp/5OtIE3c8Tx5nY86Rk\nmOqRGx9PqUOFLHG/0uUK1i6XdhqHm+XdtcL7L+oLcQKBgQD9qEBn1IgR2lvwXYdB\nSKuZzS1z6Kdn+Z1tpa2xwjnCDSGpEo47UQzzbeOqd+Eo7IR7p7w8q9hMzz/qZEv1\nvtkvPvlnd/eCK701gpAtY3IFm/jYYpIC+5xN+JJVISqLVqAOs/Z1cmC2bQyi5f/7\npGFFgRvqF5U12PR5NgEGcrH28QKBgQD3TGKT0JzWZWZ2w1mbx6LN3iSq4niIxqNy\nX2G4xxahqGNuEGQRy7U4xAoZsUEhYm11Sc+Mxv6zY0QjKUCp5aKJw4H/gRhpmNSy\ntVHYUay/Jc2OiBzOey8ztdXXC642lY/yqPMW/MAjXJ9x6jWg4CYf1umGszsTBUWk\nJsUQ0coCvQKBgAbBAR4CobDgAIyw4NYTKkaJGQm6CyMQmWl+/NX71u/cy6Wl0dWw\nfcjJh0NVt9AQJCLqv29aIANDjW8fRop/j2bbpWZk4lk78ujG1jHvMO0HTyPr0/ly\nW6IT2Umc/XYCU3awwgI0jnCtDKYVu7Amm1RvcJ/WCuoJIdFMZ9CVIznxAoGBAOgU\nh26xGH8cKkzKiA3qDJ+nGkJEx1mVEU8EtHD0ZgjQPn/MYh1RT4E2eUQjVTw/Yvnv\nixhSqDUxs4BL9qN7Hk6rbBSc0oxHIVWVVHnuLHA2yfI5Ss98S4/71fM6wwP22GCi\nrX+lM6v8AKanZizULvMyfXYsPgRbrj+fItHmD+8BAoGAfbE1o7vpOyldsTV0GKI2\n6/wySdPUY5cVoAwc2uHD2kuBy0P0+ZxxA2zDEkKSio8fPw2GBTW0kZsGYiQkTZrE\n6ebMrDWHvJw3KwsEbNmCyPtAFpnA1zvj2WV8lDRM6qbQuaea/HeYjMKHzD+foRUs\n3S0qIG7frvn5/4tO39cgBE4=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    client_email: "firebase-adminsdk-fbsvc@swaroop-a03d9.iam.gserviceaccount.com"
};

async function testKey(name, key) {
    console.log(`Testing ${name}...`);
    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert(key),
        }, name);
        const auth = app.auth();
        const user = await auth.getUserByEmail('dealer1@car360.com');
        console.log(`✅ ${name} works! User UID: ${user.uid}`);
        await app.delete();
    } catch (e) {
        console.log(`❌ ${name} failed: ${e.message}`);
    }
}

(async () => {
    await testKey('Key1 (a6f664...)', key1);
    await testKey('Key2 (32735c...)', key2);
})();
