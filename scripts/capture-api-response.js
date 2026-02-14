const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5002';

function createTestImage() {
    return Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    ]);
}

function createMultipartFormData(fields, files) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let bodyChunks = [];

    for (const [key, value] of Object.entries(fields)) {
        bodyChunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`, 'utf8'));
    }

    for (const file of files) {
        bodyChunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`, 'utf8'));
        bodyChunks.push(file.data);
        bodyChunks.push(Buffer.from(`\r\n`, 'utf8'));
    }

    bodyChunks.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));

    return {
        body: Buffer.concat(bodyChunks),
        contentType: `multipart/form-data; boundary=${boundary}`
    };
}

const fields = {
    name: 'Experience with Image',
    model: 'Visual Proof 2026',
    registration: 'IMG-' + Date.now(),
    experienceName: 'Final Verified Experience',
    imageCount: '1'
};

const files = [{
    fieldName: 'images',
    filename: 'verification-shot.png',
    contentType: 'image/png',
    data: createTestImage()
}];

const { body, contentType } = createMultipartFormData(fields, files);

const options = {
    method: 'POST',
    headers: {
        'Content-Type': contentType,
        'Content-Length': body.length
    }
};

const req = http.request(`${BASE_URL}/api/vehicles/create`, options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
        console.log('--- API RESPONSE ---');
        try {
            console.log(JSON.stringify(JSON.parse(responseData), null, 2));
        } catch (e) {
            console.log(responseData);
        }
    });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
