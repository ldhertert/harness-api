const server = require('./server');

const port = process.env.PORT || 3000
server.start(port);

(async () => {
    try {
        console.log(`Server started listening on ${port}`);
    } catch (e) {
        console.error(e)
        // Deal with the fact the chain failed
    }
})();


