
(async () => {
    try {
        const { adminApp } = await import('./app/api/firebaseadmin.js');
        console.log('Project ID:', adminApp.options.projectId);
        console.log('Storage Bucket:', adminApp.options.storageBucket);
    } catch (err) {
        console.error(err);
    }
})();
