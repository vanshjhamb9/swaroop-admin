
const { adminApp } = require('./app/api/firebaseadmin.js');
console.log('Project ID:', adminApp.options.projectId);
console.log('Storage Bucket:', adminApp.options.storageBucket);
