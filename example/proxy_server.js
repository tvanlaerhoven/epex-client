const cors_proxy = require('cors-anywhere');

const host = 'localhost'; // Or use '0.0.0.0' for it to be accessible externally
const port = 8088; // You can choose any available port

// Set up the CORS Anywhere server
cors_proxy
    .createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: [], // No required headers
        removeHeaders: ['cookie', 'accept-encoding'] // Remove unwanted headers
    })
    .listen(port, host, () => {
        console.log(`CORS Anywhere server running on http://${host}:${port}`);
    });
