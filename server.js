const app = require('./lib/app');
const http = require('http');
const PORT = process.env.PORT || 4000;
require('./lib/connection');

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log('server is running on ', server.address());
});